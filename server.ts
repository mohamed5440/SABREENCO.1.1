import express, { Response, NextFunction } from "express";
import 'dotenv/config';
import { createServer as createViteServer } from "vite";
import mysql from 'mysql2/promise';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import fs from 'fs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_development_secret_do_not_use_in_prod_123!';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('CRITICAL WARNING: JWT_SECRET is missing. Using dynamic fallback secret (sessions will reset on restart).');
}

// Auth Middleware
const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: { message: "غير مصرح لك بالوصول" } });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: { message: "انتهت صلاحية الجلسة" } });
    req.user = user;
    next();
  });
};

const optionalAuthenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // Necessary for rate limiting behind the Nginx reverse proxy
  app.set('trust proxy', 1);
  
  // Enable gzip/deflate compression
  app.use(compression());
  
  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Vite needs some flexibility in dev
    crossOriginEmbedderPolicy: false
  }));
  app.use(helmet.xssFilter()); // Explicit XSS protection
  app.use(helmet.noSniff()); // Prevent MIME type sniffing
  app.use(helmet.frameguard({ action: 'deny' })); // Prevent Clickjacking (CSRF protection element)
  app.use(helmet.hidePoweredBy()); // Hide Express signature
  
  // Rate Limiting
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { error: { message: "محاولات تسجيل دخول كثيرة جداً، يرجى المحاولة لاحقاً" } }
  });

  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100 // 100 requests per minute
  });

  const bookingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 bookings per hour per IP
    message: { error: { message: "لقد تجاوزت الحد الأقصى للحجوزات خلال ساعة واحدة. يرجى المحاولة لاحقاً أو التواصل معنا مباشرة." } }
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use('/api', apiLimiter);

  // Initialize MySQL pool with optimized settings
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 30, // Increased connection pool size for better concurrency
    maxIdle: 30, // Keep idle connections alive to prevent handshake latency
    idleTimeout: 60000, // Close idle connections after 60 seconds of inactivity
    queueLimit: 0,
    connectTimeout: 10000, // 10 seconds connection timeout
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    charset: 'utf8mb4_unicode_ci', // Force optimized collation and charset
    decimalNumbers: true, // Return decimals as numbers instead of strings for faster math/sorting
    dateStrings: true, // Avoid heavy JavaScript Date object creation and timezone shifts (extremely fast serialization)
    compress: true // Enable packet compression to reduce network overhead over cloud database connections
  });

  // Database initialization
  async function initDb() {
    let connection;
    try {
      if (!process.env.DB_HOST) {
        throw new Error('DB_HOST not set, skipping MySQL connection');
      }
      connection = await pool.getConnection();
      console.log('Connected to MySQL successfully.');

      // Migration helpers
      const checkCol = async (table: string, col: string) => {
        const [rows]: any = await connection.query(`
          SELECT COLUMN_NAME
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
        `, [table, col]);
        return rows.length > 0;
      };

      const addCol = async (table: string, col: string, type: string) => {
        const exists = await checkCol(table, col);
        if (!exists) {
          try {
            await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${col}\` ${type}`);
          } catch (e) {
            console.warn(`Migration addCol warning for ${table}.${col}:`, e);
          }
        }
      };

      const modifyCol = async (table: string, col: string, type: string) => {
        try {
          await connection.query(`ALTER TABLE \`${table}\` MODIFY COLUMN \`${col}\` ${type}`);
        } catch (e) {
          console.warn(`Migration modifyCol warning for ${table}.${col}:`, e);
        }
      };

      const checkIndex = async (table: string, indexName: string) => {
        try {
          const [rows]: any = await connection.query(`SHOW INDEXES FROM \`${table}\` WHERE Key_name = ?`, [indexName]);
          return rows.length > 0;
        } catch {
          return false;
        }
      };

      const dropIndex = async (table: string, indexName: string) => {
        const exists = await checkIndex(table, indexName);
        if (exists) {
          try {
            await connection.query(`ALTER TABLE \`${table}\` DROP INDEX \`${indexName}\``);
            console.log(`Successfully dropped redundant index ${indexName} from table ${table}.`);
          } catch (e: any) {
            console.warn(`Migration dropIndex warning for ${table}.${indexName}:`, e?.message || e);
          }
        }
      };

      const addIndex = async (table: string, indexName: string, columnsExpr: string) => {
        const exists = await checkIndex(table, indexName);
        if (!exists) {
          try {
            await connection.query(`ALTER TABLE \`${table}\` ADD INDEX \`${indexName}\` (${columnsExpr})`);
            console.log(`Successfully added high-performance index ${indexName} to table ${table}.`);
          } catch (e: any) {
            if (e.code === 'ER_DUP_KEYNAME' || e?.message?.includes('Duplicate key name') || e?.message?.includes('Too many keys specified')) {
              // Ignore these expected errors safely
            } else {
              console.warn(`Migration addIndex warning for ${table}.${indexName}:`, e?.message || e);
            }
          }
        }
      };

      const addUniqueIndex = async (table: string, indexName: string, columnsExpr: string) => {
        const exists = await checkIndex(table, indexName);
        if (!exists) {
          try {
            await connection.query(`ALTER TABLE \`${table}\` ADD UNIQUE INDEX \`${indexName}\` (${columnsExpr})`);
            console.log(`Successfully added high-performance unique index ${indexName} to table ${table}.`);
          } catch (e: any) {
            if (e.code === 'ER_DUP_KEYNAME' || e?.message?.includes('Duplicate key name')) {
              // Ignore safely
            } else {
              console.warn(`Migration addUniqueIndex warning for ${table}.${indexName}:`, e?.message || e);
            }
          }
        }
      };

      const addForeignKey = async (table: string, fkName: string, column: string, refTable: string, refColumn: string, onDelete: string) => {
        try {
          const [rows]: any = await connection.query(`
            SELECT CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?
          `, [table, fkName]);
          
          if (rows.length === 0) {
            await connection.query(`ALTER TABLE \`${table}\` ADD CONSTRAINT \`${fkName}\` FOREIGN KEY (\`${column}\`) REFERENCES \`${refTable}\`(\`${refColumn}\`) ON DELETE ${onDelete}`);
            console.log(`Successfully added foreign key ${fkName} to table ${table}.`);
          }
        } catch (e: any) {
          console.warn(`Migration addForeignKey warning for ${table}.${fkName}:`, e?.message || e);
        }
      };

      const ensureInnoDB = async (table: string) => {
        try {
          await connection.query(`ALTER TABLE \`${table}\` ENGINE=InnoDB`);
          console.log(`Successfully verified/migrated table ${table} to ENGINE=InnoDB.`);
        } catch (e: any) {
          console.warn(`Migration ensureInnoDB warning for ${table}:`, e?.message || e);
        }
      };

      const optimizeTableCharset = async (table: string) => {
        try {
          await connection.query(`ALTER TABLE \`${table}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
          console.log(`Successfully optimized charset and collation for table ${table}.`);
        } catch (e: any) {
          console.warn(`Migration optimizeTableCharset warning for ${table}:`, e?.message || e);
        }
      };

      // Users table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(255) UNIQUE,
          password VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);

      // Ensure the primary admin user exists (fallback to default if not set in .env)
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@sabreenco.com';
      const adminPass = process.env.ADMIN_PASSWORD || 'secure_password';
      
      if (adminEmail && adminPass) {
        const [existingUser]: any = await connection.query('SELECT password FROM users WHERE email = ?', [adminEmail]);
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPass, salt);

        if (existingUser.length === 0) {
          await connection.query('INSERT INTO users (email, password) VALUES (?, ?)', [adminEmail, hashedPassword]);
          console.log('Main admin account created.');
        }
      }
      
      // Removed secondary admin user logic

      await connection.query(`
        CREATE TABLE IF NOT EXISTS subscribers (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          phone VARCHAR(100) UNIQUE,
          name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX (created_at)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);

      console.log('Secure admin account verified.');
      
      // Auto-create tables if they don't exist
      await connection.query(`
        CREATE TABLE IF NOT EXISTS offers (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255),
          description TEXT,
          descriptionTitle VARCHAR(255),
          destination VARCHAR(255),
          image LONGTEXT,
          badgeText VARCHAR(255),
          urgencyText VARCHAR(255),
          price VARCHAR(100),
          oldPrice VARCHAR(100),
          currency VARCHAR(100),
          duration VARCHAR(100),
          status VARCHAR(50),
          features JSON,
          notIncluded JSON,
          category VARCHAR(100),
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);

      // Migration: Safety for offers table
      await addCol('offers', 'descriptionTitle', 'VARCHAR(255)');
      await addCol('offers', 'badgeText', 'VARCHAR(255)');
      await addCol('offers', 'urgencyText', 'VARCHAR(255)');
      await addCol('offers', 'oldPrice', 'VARCHAR(100)');
      await addCol('offers', 'category', 'VARCHAR(100)');
      await addCol('offers', 'sort_order', 'INT DEFAULT 0');
      // Ensure image is LONGTEXT
      await modifyCol('offers', 'image', 'LONGTEXT');

      await connection.query(`
        CREATE TABLE IF NOT EXISTS visas (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255),
          description TEXT,
          descriptionTitle VARCHAR(255),
          image LONGTEXT,
          price VARCHAR(100),
          currency VARCHAR(100),
          status VARCHAR(50),
          processingTime VARCHAR(255),
          duration VARCHAR(255),
          features JSON,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);

      // Migration: Ensure processingTime and duration exists if table was created earlier
      await addCol('visas', 'processingTime', 'VARCHAR(255)');
      await addCol('visas', 'duration', 'VARCHAR(255)');
      await addCol('visas', 'sort_order', 'INT DEFAULT 0');

      await connection.query(`
        CREATE TABLE IF NOT EXISTS destinations (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255),
          description TEXT,
          image LONGTEXT,
          category VARCHAR(100),
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);

      await addCol('destinations', 'sort_order', 'INT DEFAULT 0');

      await connection.query(`
        CREATE TABLE IF NOT EXISTS bookings (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          user_id BIGINT,
          name VARCHAR(255),
          phone VARCHAR(100),
          email VARCHAR(255),
          passportNumber VARCHAR(100),
          service VARCHAR(255),
          serviceType VARCHAR(255),
          date VARCHAR(100),
          status VARCHAR(50),
          amount VARCHAR(100),
          details TEXT,
          passportImage LONGTEXT,
          personalPhoto LONGTEXT,
          documents JSON,
          preferredContact VARCHAR(100),
          preferredContactTime VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX (status),
          INDEX (serviceType),
          INDEX (created_at)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);

      // Migration: Safety for bookings table
      await modifyCol('bookings', 'user_id', 'BIGINT');
      await addCol('bookings', 'passportNumber', 'VARCHAR(100)');
      await addCol('bookings', 'serviceType', 'VARCHAR(255)');
      await addCol('bookings', 'passportImage', 'LONGTEXT');
      await addCol('bookings', 'personalPhoto', 'LONGTEXT');
      await addCol('bookings', 'documents', 'JSON');
      await addCol('bookings', 'preferredContact', 'VARCHAR(100)');
      await addCol('bookings', 'preferredContactTime', 'VARCHAR(100)');
      // Ensure image columns are LONGTEXT if they exist
      await modifyCol('bookings', 'passportImage', 'LONGTEXT');
      await modifyCol('bookings', 'personalPhoto', 'LONGTEXT');

      // Clean up redundant indexes created implicitly or from earlier schemas
      await dropIndex('offers', 'status');
      await dropIndex('offers', 'category');
      await dropIndex('offers', 'sort_order');
      await dropIndex('visas', 'status');
      await dropIndex('visas', 'sort_order');
      await dropIndex('destinations', 'category');
      await dropIndex('destinations', 'sort_order');
      await dropIndex('bookings', 'user_id');
      await dropIndex('bookings', 'status');
      await dropIndex('bookings', 'serviceType');
      await dropIndex('bookings', 'created_at');

      // Optimize queries with Compound and High-Performance Indexes
      await addUniqueIndex('users', 'idx_users_email_unique', 'email');
      await addIndex('offers', 'idx_offers_sort_id', 'sort_order, id DESC');
      await addIndex('offers', 'idx_offers_status_sort', 'status, sort_order');
      await addIndex('visas', 'idx_visas_sort_id', 'sort_order, id DESC');
      await addIndex('visas', 'idx_visas_status_sort', 'status, sort_order');
      await addIndex('destinations', 'idx_dest_sort_id', 'sort_order, id DESC');
      await addIndex('destinations', 'idx_dest_cat_sort', 'category, sort_order');
      await addIndex('bookings', 'idx_bookings_user_created', 'user_id, created_at DESC');
      await addIndex('bookings', 'idx_bookings_status_created', 'status, created_at DESC');
      await addIndex('bookings', 'idx_bookings_created', 'created_at DESC');
      await addIndex('subscribers', 'idx_subscribers_created', 'created_at DESC');

      // Add foreign keys for data integrity
      await addForeignKey('bookings', 'fk_bookings_user_id', 'user_id', 'users', 'id', 'SET NULL');

      // Enforce high-performance storage engine (InnoDB) and optimal character collation (utf8mb4_unicode_ci)
      const tablesToTune = ['users', 'subscribers', 'offers', 'visas', 'destinations', 'bookings', 'social_links', 'contact_info'];
      for (const t of tablesToTune) {
        await ensureInnoDB(t);
        await optimizeTableCharset(t);
        try {
          await connection.query(`ANALYZE TABLE \`${t}\``);
        } catch {
          // Ignore analyze table warnings
        }
      }

      await connection.query(`
        CREATE TABLE IF NOT EXISTS social_links (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          platform VARCHAR(100),
          url VARCHAR(1024),
          icon VARCHAR(100),
          visible BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS contact_info (
          id INT PRIMARY KEY DEFAULT 1,
          phones JSON,
          email VARCHAR(255),
          address TEXT,
          addressUrl VARCHAR(1024),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);

      // Initialize contact info if empty
      const [contactRows]: any = await connection.query('SELECT id FROM contact_info WHERE id = 1');
      if (contactRows.length === 0) {
        await connection.query(
          'INSERT INTO contact_info (id, phones, email, address, addressUrl) VALUES (1, ?, ?, ?, ?)',
          [
            JSON.stringify(['+201553004593', '+201103103362', '+201154162244']),
            'reservation@sabreentourism.com',
            'صابرينكو للخدمات السياحية - روكسي - الدور السادس - مصر الجديده - القاهرة',
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.035409391062!2d31.318522524987564!3d30.09317221626129!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x245c4f197382d62b%3A0xef6ed84fa3f29564!2z2LXYp9io2LHZitmG2YPZiCDZhNmE2K7Yr9mF2KfYqiDYp9mE2LPZitin2K3Zitip!5e0!3m2!1sar!2seg!4v1782998635960!5m2!1sar!2seg'
          ]
        );
      }

      // Initialize social links if empty
      const [socialRows]: any = await connection.query('SELECT id FROM social_links LIMIT 1');
      if (socialRows.length === 0) {
        await connection.query(
          'INSERT INTO social_links (platform, url, icon, visible) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
          ['facebook', 'https://www.facebook.com/share/1C6WokSrAE/', 'Facebook', true, 'whatsapp', 'https://wa.me/201553004593', 'MessageCircle', true]
        );
      }

    } catch {
      console.log('MySQL Connection unavailable. Switching to local JSON fallback database.');
      useLocalFallback = true;
      await initLocalDb();
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  let useLocalFallback = false;
  const FALLBACK_FILE = path.join(process.cwd(), 'db_fallback.json');

  interface LocalDbData {
    users: any[];
    subscribers: any[];
    offers: any[];
    visas: any[];
    destinations: any[];
    bookings: any[];
    social_links: any[];
    contact_info: any[];
  }

  let localDb: LocalDbData = {
    users: [],
    subscribers: [],
    offers: [],
    visas: [],
    destinations: [],
    bookings: [],
    social_links: [],
    contact_info: []
  };

  async function initLocalDb() {
    if (fs.existsSync(FALLBACK_FILE)) {
      try {
        localDb = JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf8'));
        console.log('Loaded local fallback database from file.');
        // Ensure arrays are initialized if missing, but DO NOT wipe existing data
        if (!localDb.users) localDb.users = [];
        if (!localDb.subscribers) localDb.subscribers = [];
        if (!localDb.offers) localDb.offers = [];
        if (!localDb.visas) localDb.visas = [];
        if (!localDb.destinations) localDb.destinations = [];
        if (!localDb.bookings) localDb.bookings = [];
        if (!localDb.social_links) localDb.social_links = [];
        if (!localDb.contact_info) localDb.contact_info = [];
        
        // Ensure default admin user exists if users array is empty
        if (localDb.users.length === 0) {
          const salt = await bcrypt.genSalt(10);
          const adminEmail = process.env.ADMIN_EMAIL || "admin@sabreenco.com";
          const adminPass = process.env.ADMIN_PASSWORD || "secure_password";
          const hashedAdminPassword = await bcrypt.hash(adminPass, salt);
          localDb.users.push({
            id: 1,
            email: adminEmail,
            password: hashedAdminPassword,
            created_at: new Date().toISOString()
          });
          saveLocalDb();
        }
        return;
      } catch (e) {
        console.error('Failed to parse local fallback database file, re-initializing:', e);
      }
    }

    console.log('Initializing local fallback database with seed data...');
    
    // Hash the default admin password
    const salt = await bcrypt.genSalt(10);
    const adminEmail = process.env.ADMIN_EMAIL || "admin@sabreenco.com";
    const adminPass = process.env.ADMIN_PASSWORD || "secure_password";
    const hashedAdminPassword = await bcrypt.hash(adminPass, salt);

    localDb.users = [
      {
        id: 1,
        email: adminEmail,
        password: hashedAdminPassword,
        created_at: new Date().toISOString()
      }
    ];

    localDb.subscribers = [];
    localDb.bookings = [];

    localDb.contact_info = [
      {
        id: 1,
        phones: JSON.stringify(['+201553004593', '+201103103362', '+201154162244']),
        email: 'reservation@sabreentourism.com',
        address: 'صابرينكو للخدمات السياحية - روكسي - الدور السادس - مصر الجديده - القاهرة',
        addressUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.035409391062!2d31.318522524987564!3d30.09317221626129!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x245c4f197382d62b%3A0xef6ed84fa3f29564!2z2LXYp9io2LHZitmG2YPZiCDZhNmE2K7Yr9mF2KfYqiDYp9mE2LPZitin2K3Zitip!5e0!3m2!1sar!2seg!4v1782998635960!5m2!1sar!2seg',
        created_at: new Date().toISOString()
      }
    ];

    localDb.social_links = [
      { id: 1, platform: 'facebook', url: 'https://www.facebook.com/share/1C6WokSrAE/', icon: 'Facebook', visible: true },
      { id: 2, platform: 'whatsapp', url: 'https://wa.me/201553004593', icon: 'MessageCircle', visible: true }
    ];

    localDb.destinations = [];
    localDb.offers = [];
    localDb.visas = [];

    saveLocalDb();
  }

  let saveDbTimeout: NodeJS.Timeout | null = null;
  function saveLocalDb() {
    if (typeof clearCache === 'function') {
      try { clearCache(); } catch { /* ignore */ }
    }
    if (saveDbTimeout) clearTimeout(saveDbTimeout);
    saveDbTimeout = setTimeout(() => {
      fs.writeFile(FALLBACK_FILE, JSON.stringify(localDb, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Failed to write local fallback database file:', err);
        }
      });
    }, 50);
  }

  const localQuery = async (sql: string, params: any[] = []): Promise<any> => {
    const s = sql.toLowerCase().trim();
    
    if (s.startsWith('select * from users where email =') || s.includes('from users where email =')) {
      const email = params[0];
      return localDb.users.filter(u => u.email === email);
    }
    
    if (s.startsWith('select password from users where email =')) {
      const email = params[0];
      const match = localDb.users.filter(u => u.email === email);
      return match.map(u => ({ password: u.password }));
    }

    if (s.includes('from contact_info')) {
      return localDb.contact_info;
    }

    if (s.includes('from social_links')) {
      return localDb.social_links;
    }

    if (s.includes('from offers')) {
      const sorted = [...localDb.offers].sort((a, b) => {
        const orderA = a.sort_order || 0;
        const orderB = b.sort_order || 0;
        if (orderA !== orderB) return orderA - orderB;
        return b.id - a.id;
      });
      return sorted;
    }

    if (s.includes('from visas')) {
      const sorted = [...localDb.visas].sort((a, b) => {
        const orderA = a.sort_order || 0;
        const orderB = b.sort_order || 0;
        if (orderA !== orderB) return orderA - orderB;
        return b.id - a.id;
      });
      return sorted;
    }

    if (s.includes('from destinations')) {
      const sorted = [...localDb.destinations].sort((a, b) => {
        const orderA = a.sort_order || 0;
        const orderB = b.sort_order || 0;
        if (orderA !== orderB) return orderA - orderB;
        return b.id - a.id;
      });
      return sorted;
    }

    if (s.startsWith('select * from bookings where id=')) {
      const id = String(params[0]);
      return localDb.bookings.filter(b => String(b.id) === id);
    }

    if (s.includes('from bookings')) {
      const sorted = [...localDb.bookings].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      return sorted;
    }

    if (s.includes('from subscribers')) {
      const sorted = [...localDb.subscribers].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      return sorted;
    }

    return [];
  };

  const localExecute = async (sql: string, params: any[] = []): Promise<any> => {
    const s = sql.toLowerCase().trim();
    
    if (s.startsWith('insert into')) {
      let table = '';
      if (s.includes('insert into users')) table = 'users';
      else if (s.includes('insert into subscribers')) table = 'subscribers';
      else if (s.includes('insert into offers')) table = 'offers';
      else if (s.includes('insert into visas')) table = 'visas';
      else if (s.includes('insert into destinations')) table = 'destinations';
      else if (s.includes('insert into bookings')) table = 'bookings';
      else if (s.includes('insert into social_links')) table = 'social_links';
      else if (s.includes('insert into contact_info')) table = 'contact_info';
      
      if (!table) return { insertId: 0 };

      if (table === 'subscribers') {
        const phone = params[0];
        const name = params[1];
        const idx = localDb.subscribers.findIndex(sub => sub.phone === phone);
        if (idx !== -1) {
          localDb.subscribers[idx].name = name;
          saveLocalDb();
          return { insertId: localDb.subscribers[idx].id };
        } else {
          const newId = localDb.subscribers.length > 0 ? Math.max(...localDb.subscribers.map(sub => sub.id)) + 1 : 1;
          localDb.subscribers.push({
            id: newId,
            phone,
            name,
            created_at: new Date().toISOString()
          });
          saveLocalDb();
          return { insertId: newId };
        }
      }

      const newId = localDb[table as keyof LocalDbData].length > 0 
        ? Math.max(0, ...localDb[table as keyof LocalDbData].map((x: any) => Number(x.id) || 0)) + 1 
        : 1;

      if (table === 'offers') {
        localDb.offers.push({
          id: newId,
          title: params[0] || null,
          description: params[1] || null,
          descriptionTitle: params[2] || null,
          destination: params[3] || null,
          image: params[4] || null,
          badgeText: params[5] || null,
          urgencyText: params[6] || null,
          price: params[7] || null,
          oldPrice: params[8] || null,
          currency: params[9] || null,
          duration: params[10] || null,
          status: params[11] || 'نشط',
          features: params[12] || '[]',
          notIncluded: params[13] || '[]',
          category: params[14] || null,
          sort_order: 0,
          created_at: new Date().toISOString()
        });
      } else if (table === 'visas') {
        localDb.visas.push({
          id: newId,
          title: params[0] || null,
          description: params[1] || null,
          descriptionTitle: params[2] || null,
          image: params[3] || null,
          price: params[4] || null,
          currency: params[5] || null,
          status: params[6] || 'نشط',
          processingTime: params[7] || null,
          duration: params[8] || null,
          features: params[9] || '[]',
          sort_order: 0,
          created_at: new Date().toISOString()
        });
      } else if (table === 'destinations') {
        localDb.destinations.push({
          id: newId,
          name: params[0] || null,
          description: params[1] || null,
          image: params[2] || null,
          category: params[3] || null,
          sort_order: 0,
          created_at: new Date().toISOString()
        });
      } else if (table === 'bookings') {
        localDb.bookings.push({
          id: newId,
          user_id: params[0] || null,
          name: params[1] || null,
          phone: params[2] || null,
          email: params[3] || null,
          passportNumber: params[4] || null,
          service: params[5] || null,
          serviceType: params[6] || null,
          date: params[7] || null,
          status: params[8] || 'قيد الانتظار',
          amount: params[9] || null,
          details: params[10] || null,
          passportImage: params[11] || null,
          personalPhoto: params[12] || null,
          documents: params[13] || '[]',
          preferredContact: params[14] || null,
          preferredContactTime: params[15] || null,
          created_at: new Date().toISOString()
        });
      } else if (table === 'social_links') {
        localDb.social_links.push({
          id: newId,
          platform: params[0],
          url: params[1],
          icon: params[2],
          visible: params[3] !== 0
        });
      } else if (table === 'users') {
        localDb.users.push({
          id: newId,
          email: params[0],
          password: params[1],
          created_at: new Date().toISOString()
        });
      }

      saveLocalDb();
      return { insertId: newId };
    }

    if (s.startsWith('update')) {
      let table = '';
      if (s.includes('update offers')) table = 'offers';
      else if (s.includes('update visas')) table = 'visas';
      else if (s.includes('update destinations')) table = 'destinations';
      else if (s.includes('update bookings')) table = 'bookings';
      else if (s.includes('update contact_info')) table = 'contact_info';
      else if (s.includes('update users')) table = 'users';

      if (!table) return { affectedRows: 0 };

      if (table === 'contact_info') {
        localDb.contact_info[0] = {
          id: 1,
          phones: params[0],
          email: params[1],
          address: params[2],
          addressUrl: params[3],
          created_at: localDb.contact_info[0]?.created_at || new Date().toISOString()
        };
        saveLocalDb();
        return { affectedRows: 1 };
      }

      if (s.includes('set sort_order = ? where id = ?')) {
        const sortOrder = params[0];
        const id = params[1];
        const idx = localDb[table as keyof LocalDbData].findIndex((x: any) => String(x.id) === String(id));
        if (idx !== -1) {
          (localDb[table as keyof LocalDbData][idx] as any).sort_order = sortOrder;
          saveLocalDb();
          return { affectedRows: 1 };
        }
        return { affectedRows: 0 };
      }

      if (table === 'offers') {
        const id = params[params.length - 1];
        const idx = localDb.offers.findIndex(x => String(x.id) === String(id));
        if (idx !== -1) {
          localDb.offers[idx] = {
            ...localDb.offers[idx],
            title: params[0] || null,
            description: params[1] || null,
            descriptionTitle: params[2] || null,
            destination: params[3] || null,
            image: params[4] || null,
            badgeText: params[5] || null,
            urgencyText: params[6] || null,
            price: params[7] || null,
            oldPrice: params[8] || null,
            currency: params[9] || null,
            duration: params[10] || null,
            status: params[11] || null,
            features: params[12] || '[]',
            notIncluded: params[13] || '[]',
            category: params[14] || null
          };
          saveLocalDb();
          return { affectedRows: 1 };
        }
      } else if (table === 'visas') {
        const id = params[params.length - 1];
        const idx = localDb.visas.findIndex(x => String(x.id) === String(id));
        if (idx !== -1) {
          localDb.visas[idx] = {
            ...localDb.visas[idx],
            title: params[0] || null,
            description: params[1] || null,
            descriptionTitle: params[2] || null,
            image: params[3] || null,
            price: params[4] || null,
            currency: params[5] || null,
            status: params[6] || null,
            processingTime: params[7] || null,
            duration: params[8] || null,
            features: params[9] || '[]'
          };
          saveLocalDb();
          return { affectedRows: 1 };
        }
      } else if (table === 'destinations') {
        const id = params[params.length - 1];
        const idx = localDb.destinations.findIndex(x => String(x.id) === String(id));
        if (idx !== -1) {
          localDb.destinations[idx] = {
            ...localDb.destinations[idx],
            name: params[0] || null,
            description: params[1] || null,
            image: params[2] || null,
            category: params[3] || null
          };
          saveLocalDb();
          return { affectedRows: 1 };
        }
      } else if (table === 'users') {
        const password = params[0];
        const email = params[1];
        const idx = localDb.users.findIndex(x => x.email === email);
        if (idx !== -1) {
          localDb.users[idx].password = password;
          saveLocalDb();
          return { affectedRows: 1 };
        }
      } else if (table === 'bookings') {
        const id = params[params.length - 1];
        const idx = localDb.bookings.findIndex(x => String(x.id) === String(id));
        if (idx !== -1) {
          const setClauseMatch = sql.match(/set\s+([\s\S]+?)\s+where/i);
          if (setClauseMatch) {
            const setFields = setClauseMatch[1].split(',').map(f => f.trim().replace(/`/g, '').split('=')[0].trim());
            for (let i = 0; i < setFields.length; i++) {
              const field = setFields[i];
              const val = params[i];
              localDb.bookings[idx][field] = val;
            }
            saveLocalDb();
            return { affectedRows: 1 };
          }
        }
      }

      return { affectedRows: 0 };
    }

    if (s.startsWith('delete')) {
      let table = '';
      if (s.includes('delete from offers')) table = 'offers';
      else if (s.includes('delete from visas')) table = 'visas';
      else if (s.includes('delete from destinations')) table = 'destinations';
      else if (s.includes('delete from bookings')) table = 'bookings';
      else if (s.includes('delete from subscribers')) table = 'subscribers';
      else if (s.includes('delete from social_links')) table = 'social_links';
      
      if (!table) return { affectedRows: 0 };

      if (s.includes('id != 0')) {
        localDb.social_links = [];
        saveLocalDb();
        return { affectedRows: 1 };
      }

      const id = params[0];
      const initialLength = localDb[table as keyof LocalDbData].length;
      localDb[table as keyof LocalDbData] = localDb[table as keyof LocalDbData].filter((x: any) => String(x.id) !== String(id)) as any;
      
      if (localDb[table as keyof LocalDbData].length !== initialLength) {
        saveLocalDb();
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    return { affectedRows: 0 };
  };

  // Define APIs
  // Ensure we avoid naming collisions and use standard JSON responses

  app.get('/api/health', (req, res) => res.json({ status: "ok" }));

  // --- Auto-recovery & Health Check for Transient DB Connection Losses ---
  let lastDbCheck = 0;
  const checkDbHealth = async () => {
    if (!useLocalFallback) return true;
    if (!process.env.DB_HOST) return false;
    const now = Date.now();
    if (now - lastDbCheck > 30000) { // check database health every 30 seconds
      lastDbCheck = now;
      try {
        const connection = await pool.getConnection();
        await connection.query('SELECT 1');
        connection.release();
        console.log('MySQL connection automatically recovered. Switching back to MySQL database.');
        useLocalFallback = false;
        return true;
      } catch {
        // Silently stay on local fallback if MySQL is still down
      }
    }
    return false;
  };

  // Generic Query Helper
  const q = async (sql: string, params: any[] = []) => {
    await checkDbHealth();
    if (useLocalFallback) {
      return await localQuery(sql, params);
    }
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (e: any) {
      console.warn("MySQL Query failed, using local fallback. Error:", e?.message || e);
      useLocalFallback = true;
      lastDbCheck = Date.now();
      await initLocalDb();
      return await localQuery(sql, params);
    }
  };
  const exec = async (sql: string, params: any[] = []) => {
    await checkDbHealth();
    if (useLocalFallback) {
      return await localExecute(sql, params);
    }
    try {
      const [result] = await pool.execute(sql, params);
      return result;
    } catch (e: any) {
      console.warn("MySQL Execute failed, using local fallback. Error:", e?.message || e);
      useLocalFallback = true;
      lastDbCheck = Date.now();
      await initLocalDb();
      return await localExecute(sql, params);
    }
  };

  // --- Cache Helper ---
  const cache: Record<string, { data: any, expiry: number }> = {};
  const CACHE_TTL = 3600000; // 1 hour (highly optimized as admin actions clear the cache)
  
  const getCached = (key: string) => {
    const item = cache[key];
    if (item && item.expiry > Date.now()) return item.data;
    return null;
  };
  
  const setCache = (key: string, data: any) => {
    cache[key] = { data, expiry: Date.now() + CACHE_TTL };
  };
  
  const clearCache = (keyPrefix?: string) => {
    if (!keyPrefix) {
      Object.keys(cache).forEach(k => delete cache[k]);
    } else {
      Object.keys(cache).forEach(k => { 
        if (k.startsWith(keyPrefix)) delete cache[k]; 
      });
    }
  };

  const getOrSetCache = async <T>(key: string, queryFn: () => Promise<T>): Promise<T> => {
    const cached = getCached(key);
    if (cached !== null) return cached as T;
    const data = await queryFn();
    setCache(key, data);
    return data;
  };

  // Reusable High-Performance Cache/Authorization GET Helper
  const handleCachedGet = async (req: express.Request, res: Response, cacheKey: string, dbQuery: () => Promise<any>) => {
    try {
      const isAuthorized = !!req.headers['authorization'];
      if (isAuthorized) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
      }
      
      const data = await getOrSetCache(cacheKey, dbQuery);
      res.json(data);
    } catch (e: any) {
      console.error(`Get ${cacheKey} error:`, e);
      res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } });
    }
  };

  // --- Initial Data Load (Optimized via multi-key cache composition) ---
  app.get('/api/init', async (req, res) => {
    try {
      const isAuthorized = !!req.headers['authorization'];
      if (isAuthorized) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
      }

      const [offers, destinations, visas, socialLinks, contactInfo] = await Promise.all([
        getOrSetCache('offers', () => q('SELECT * FROM offers ORDER BY sort_order ASC, id DESC')),
        getOrSetCache('destinations', () => q('SELECT * FROM destinations ORDER BY sort_order ASC, id DESC')),
        getOrSetCache('visas', () => q('SELECT * FROM visas ORDER BY sort_order ASC, id DESC')),
        getOrSetCache('social_links', () => q('SELECT * FROM social_links ORDER BY id ASC')),
        getOrSetCache('contact_info', async () => {
          const rows = await q('SELECT * FROM contact_info WHERE id = 1');
          return rows[0] || null;
        })
      ]);

      res.json({
        offers: offers || [],
        destinations: destinations || [],
        visas: visas || [],
        socialLinks: socialLinks || [],
        contactInfo: contactInfo || null
      });
    } catch (e: any) {
      console.error("Init API error:", e);
      res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } });
    }
  });

  // --- Bulk Sort Update ---
  app.post('/api/sort-order', authenticateToken, async (req, res) => {
    try {
      const { table, items } = req.body; // items: [{id, sort_order}, ...]
      const allowedTables = ['offers', 'visas', 'destinations'];
      if (!allowedTables.includes(table)) return res.status(400).json({ error: 'Invalid table' });
      if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Items must be an array' });
      
      await checkDbHealth();
      
      if (useLocalFallback) {
        for (const item of items) {
          if (item && typeof item === 'object' && 'sort_order' in item && 'id' in item) {
            await localExecute(`UPDATE ${table} SET sort_order = ? WHERE id = ?`, [item.sort_order, item.id]);
          }
        }
      } else {
        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();
          for (const item of items) {
            if (item && typeof item === 'object' && 'sort_order' in item && 'id' in item) {
              await connection.execute(`UPDATE \`${table}\` SET sort_order = ? WHERE id = ?`, [item.sort_order, item.id]);
            }
          }
          await connection.commit();
        } catch (err) {
          await connection.rollback();
          throw err;
        } finally {
          connection.release();
        }
      }
      
      clearCache(table);
      res.json({ success: true });
    } catch (e: any) { 
      console.error(e); 
      res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); 
    }
  });

  // --- Offers ---
  app.get('/api/offers', async (req, res) => {
    await handleCachedGet(req, res, 'offers', () => q('SELECT * FROM offers ORDER BY sort_order ASC, id DESC'));
  });
  app.post('/api/offers', authenticateToken, async (req, res) => {
    try {
      const p = req.body;
      if (!p || typeof p !== 'object') {
        return res.status(400).json({ error: { message: "بيانات غير صالحة" } });
      }
      if (!p.title || typeof p.title !== 'string' || !p.title.trim()) {
        return res.status(400).json({ error: { message: "العنوان مطلوب" } });
      }
      const result: any = await exec(
        'INSERT INTO offers (title, description, descriptionTitle, destination, image, badgeText, urgencyText, price, oldPrice, currency, duration, status, features, notIncluded, category) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [p.title||null, p.description||null, p.descriptionTitle||null, p.destination||null, p.image||null, p.badgeText||null, p.urgencyText||null, p.price||null, p.oldPrice||null, p.currency||null, p.duration||null, p.status||'نشط', JSON.stringify(p.features||[]), JSON.stringify(p.notIncluded||[]), p.category||null]
      );
      clearCache('offers');
      res.json([{ id: result.insertId, ...p, status: p.status||'نشط' }]);
    } catch (e: any) { console.error(e); res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); }
  });
  app.put('/api/offers/:id', authenticateToken, async (req, res) => {
    try {
      const p = req.body;
      if (!p || typeof p !== 'object') {
        return res.status(400).json({ error: { message: "بيانات غير صالحة" } });
      }
      if (!p.title || typeof p.title !== 'string' || !p.title.trim()) {
        return res.status(400).json({ error: { message: "العنوان مطلوب" } });
      }
      await exec(
        'UPDATE offers SET title=?, description=?, descriptionTitle=?, destination=?, image=?, badgeText=?, urgencyText=?, price=?, oldPrice=?, currency=?, duration=?, status=?, features=?, notIncluded=?, category=? WHERE id=?',
        [p.title||null, p.description||null, p.descriptionTitle||null, p.destination||null, p.image||null, p.badgeText||null, p.urgencyText||null, p.price||null, p.oldPrice||null, p.currency||null, p.duration||null, p.status||null, JSON.stringify(p.features||[]), JSON.stringify(p.notIncluded||[]), p.category||null, req.params.id]
      );
      clearCache('offers');
      res.json([{ id: req.params.id, ...p }]);
    } catch (e: any) { console.error(e); res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); }
  });
  app.delete('/api/offers/:id', authenticateToken, async (req, res) => {
    try {
      await exec('DELETE FROM offers WHERE id=?', [req.params.id]);
      clearCache('offers');
      res.json({ success: true });
    } catch (e: any) { console.error(e); res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); }
  });

  // --- Visas ---
  app.get('/api/visas', async (req, res) => {
    await handleCachedGet(req, res, 'visas', () => q('SELECT * FROM visas ORDER BY sort_order ASC, id DESC'));
  });
  app.post('/api/visas', authenticateToken, async (req, res) => {
    try {
      const p = req.body;
      if (!p || typeof p !== 'object') {
        return res.status(400).json({ error: { message: "بيانات غير صالحة" } });
      }
      if (!p.title || typeof p.title !== 'string' || !p.title.trim()) {
        return res.status(400).json({ error: { message: "العنوان مطلوب" } });
      }
      const result: any = await exec(
        'INSERT INTO visas (title, description, descriptionTitle, image, price, currency, status, processingTime, duration, features) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [p.title||null, p.description||null, p.descriptionTitle||null, p.image||null, p.price||null, p.currency||null, p.status||'نشط', p.processingTime||null, p.duration||null, JSON.stringify(p.features||[])]
      );
      clearCache('visas');
      res.json([{ id: result.insertId, ...p, status: p.status||'نشط' }]);
    } catch (e: any) { console.error(e); res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); }
  });
  app.put('/api/visas/:id', authenticateToken, async (req, res) => {
    try {
      const p = req.body;
      if (!p || typeof p !== 'object') {
        return res.status(400).json({ error: { message: "بيانات غير صالحة" } });
      }
      if (!p.title || typeof p.title !== 'string' || !p.title.trim()) {
        return res.status(400).json({ error: { message: "العنوان مطلوب" } });
      }
      await exec(
        'UPDATE visas SET title=?, description=?, descriptionTitle=?, image=?, price=?, currency=?, status=?, processingTime=?, duration=?, features=? WHERE id=?',
        [p.title||null, p.description||null, p.descriptionTitle||null, p.image||null, p.price||null, p.currency||null, p.status||null, p.processingTime||null, p.duration||null, JSON.stringify(p.features||[]), req.params.id]
      );
      clearCache('visas');
      res.json([{ id: req.params.id, ...p }]);
    } catch (e: any) { console.error(e); res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); }
  });
  app.delete('/api/visas/:id', authenticateToken, async (req, res) => {
    try {
      await exec('DELETE FROM visas WHERE id=?', [req.params.id]);
      clearCache('visas');
      res.json({ success: true });
    } catch (e: any) { console.error(e); res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); }
  });

  // --- Destinations ---
  app.get('/api/destinations', async (req, res) => {
    await handleCachedGet(req, res, 'destinations', () => q('SELECT * FROM destinations ORDER BY sort_order ASC, id DESC'));
  });
  app.post('/api/destinations', authenticateToken, async (req, res) => {
    try {
      const p = req.body;
      if (!p || typeof p !== 'object') {
        return res.status(400).json({ error: { message: "بيانات غير صالحة" } });
      }
      if (!p.name || typeof p.name !== 'string' || !p.name.trim()) {
        return res.status(400).json({ error: { message: "الاسم مطلوب" } });
      }
      const result: any = await exec(
        'INSERT INTO destinations (name, description, image, category) VALUES (?,?,?,?)',
        [p.name||null, p.description||null, p.image||null, p.category||null]
      );
      clearCache('destinations');
      res.json([{ id: result.insertId, ...p }]);
    } catch (e: any) { console.error(e); res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); }
  });
  app.put('/api/destinations/:id', authenticateToken, async (req, res) => {
    try {
      const p = req.body;
      if (!p || typeof p !== 'object') {
        return res.status(400).json({ error: { message: "بيانات غير صالحة" } });
      }
      if (!p.name || typeof p.name !== 'string' || !p.name.trim()) {
        return res.status(400).json({ error: { message: "الاسم مطلوب" } });
      }
      await exec(
        'UPDATE destinations SET name=?, description=?, image=?, category=? WHERE id=?',
        [p.name||null, p.description||null, p.image||null, p.category||null, req.params.id]
      );
      clearCache('destinations');
      res.json([{ id: req.params.id, ...p }]);
    } catch (e: any) { console.error(e); res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); }
  });
  app.delete('/api/destinations/:id', authenticateToken, async (req, res) => {
    try {
      await exec('DELETE FROM destinations WHERE id=?', [req.params.id]);
      clearCache('destinations');
      res.json({ success: true });
    } catch (e: any) { console.error(e); res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); }
  });

  // --- Bookings ---
  app.get('/api/bookings', authenticateToken, async (req, res) => {
    await handleCachedGet(req, res, 'bookings_list', () =>
      q('SELECT id, user_id, name, phone, email, passportNumber, service, serviceType, date, status, amount, details, preferredContact, preferredContactTime, created_at FROM bookings ORDER BY created_at DESC')
    );
  });
  app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
      const rows: any = await q('SELECT * FROM bookings WHERE id=?', [req.params.id]);
      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (e: any) { console.error(e); res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); }
  });
  app.post('/api/bookings', bookingLimiter, optionalAuthenticateToken, async (req: any, res) => {
    try {
      const p = req.body;
      
      // Input Validation & Defense-in-depth sanitization
      if (!p || typeof p !== 'object') {
        return res.status(400).json({ error: { message: "بيانات الطلب غير صالحة" } });
      }
      if (!p.name || typeof p.name !== 'string' || !p.name.trim()) {
        return res.status(400).json({ error: { message: "الاسم مطلوب وبصيغة صحيحة" } });
      }
      if (!p.phone || typeof p.phone !== 'string' || !p.phone.trim()) {
        return res.status(400).json({ error: { message: "رقم الهاتف مطلوب وبصيغة صحيحة" } });
      }
      if (p.name.length > 255) {
        return res.status(400).json({ error: { message: "الاسم طويل جداً (الحد الأقصى 255 حرفاً)" } });
      }
      if (p.phone.length > 100) {
        return res.status(400).json({ error: { message: "رقم الهاتف طويل جداً (الحد الأقصى 100 حرفاً)" } });
      }
      if (p.email && (typeof p.email !== 'string' || p.email.length > 255)) {
        return res.status(400).json({ error: { message: "البريد الإلكتروني طويل جداً (الحد الأقصى 255 حرفاً)" } });
      }
      if (p.passportNumber && (typeof p.passportNumber !== 'string' || p.passportNumber.length > 100)) {
        return res.status(400).json({ error: { message: "رقم جواز السفر طويل جداً (الحد الأقصى 100 حرفاً)" } });
      }
      if (p.service && (typeof p.service !== 'string' || p.service.length > 255)) {
        return res.status(400).json({ error: { message: "اسم الخدمة طويل جداً" } });
      }
      if (p.serviceType && (typeof p.serviceType !== 'string' || p.serviceType.length > 255)) {
        return res.status(400).json({ error: { message: "نوع الخدمة طويل جداً" } });
      }
      if (p.date && (typeof p.date !== 'string' || p.date.length > 100)) {
        return res.status(400).json({ error: { message: "التاريخ طويل جداً" } });
      }
      
      // Image size validation (roughly limit to 7MB base64) to prevent DB exhaustion DoS
      let documentsLength = 0;
      if (Array.isArray(p.documents)) {
        documentsLength = p.documents.reduce((acc: number, doc: string) => acc + (doc ? doc.length : 0), 0);
      }
      
      if ((p.passportImage && p.passportImage.length > 8 * 1024 * 1024) || 
          (p.personalPhoto && p.personalPhoto.length > 8 * 1024 * 1024) ||
          documentsLength > 8 * 1024 * 1024) {
        return res.status(400).json({ error: { message: "حجم الصورة أو المرفقات يتجاوز الحد المسموح به" } });
      }

      // Ensure that unauthenticated users cannot set arbitrary user_id, 
      // but authenticated users inherit their own user_id.
      // If a user is not logged in, user_id remains null.
      const userId = req.user?.id || null;

      const result: any = await exec(
        'INSERT INTO bookings (user_id, name, phone, email, passportNumber, service, serviceType, date, status, amount, details, passportImage, personalPhoto, documents, preferredContact, preferredContactTime) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [userId, p.name||null, p.phone||null, p.email||null, p.passportNumber||null, p.service||null, p.serviceType||null, p.date||null, 'قيد الانتظار', null, p.details||null, p.passportImage||null, p.personalPhoto||null, JSON.stringify(p.documents||[]), p.preferredContact||null, p.preferredContactTime||null]
      );
      
      const [newBooking]: any = await q('SELECT * FROM bookings WHERE id = ?', [result.insertId]);
      clearCache('bookings_list');
      res.json([newBooking]);
    } catch (e: any) { 
      console.error(e); 
      res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); 
    }
  });
  app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
      const p = req.body;
      const allowedKeys = [
        'user_id', 'name', 'phone', 'email', 'passportNumber', 'service', 
        'serviceType', 'date', 'status', 'amount', 'details', 
        'passportImage', 'personalPhoto', 'documents', 
        'preferredContact', 'preferredContactTime'
      ];
      
      let sql = 'UPDATE bookings SET ';
      const updates = [];
      const values = [];
      
      for (const key of Object.keys(p)) {
        if (allowedKeys.includes(key)) {
          updates.push(`\`${key}\`=?`);
          if (p[key] === null) {
            values.push(null);
          } else if (typeof p[key] === 'object') {
            values.push(JSON.stringify(p[key]));
          } else {
            values.push(p[key]);
          }
        }
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: { message: "لا توجد بيانات صالحة للتحديث" } });
      }
      
      values.push(req.params.id);
      sql += updates.join(', ') + ' WHERE id=?';
      
      await exec(sql, values);
      clearCache('bookings_list');
      res.json([{ id: req.params.id, ...p }]);
    } catch (e: any) { console.error(e); res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); }
  });
  app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
      await exec('DELETE FROM bookings WHERE id=?', [req.params.id]);
      clearCache('bookings_list');
      res.json({ success: true });
    } catch (e: any) { console.error(e); res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); }
  });

  // --- Social Links ---
  app.get('/api/social_links', async (req, res) => {
    await handleCachedGet(req, res, 'social_links', () => q('SELECT * FROM social_links ORDER BY id ASC'));
  });
  app.post('/api/social_links/bulk', authenticateToken, async (req, res) => {
    try {
      const links = req.body;
      if (!links || !Array.isArray(links)) {
        return res.status(400).json({ error: { message: "الروابط يجب أن تكون مصفوفة صالحة" } });
      }
      
      await checkDbHealth();
      
      if (useLocalFallback) {
        await localExecute('DELETE FROM social_links WHERE id != 0');
        if (links.length > 0) {
          for (const link of links) {
            if (link && typeof link === 'object') {
              await localExecute(
                'INSERT INTO social_links (platform, url, icon, visible) VALUES (?,?,?,?)',
                [link.platform||null, link.url||null, link.icon||null, (link.visible === false || link.visible === 0 || link.visible === '0') ? 0 : 1]
              );
            }
          }
        }
      } else {
        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();
          await connection.execute('DELETE FROM social_links WHERE id != 0');
          if (links.length > 0) {
            for (const link of links) {
              if (link && typeof link === 'object') {
                await connection.execute(
                  'INSERT INTO social_links (platform, url, icon, visible) VALUES (?,?,?,?)',
                  [link.platform||null, link.url||null, link.icon||null, (link.visible === false || link.visible === 0 || link.visible === '0') ? 0 : 1]
                );
              }
            }
          }
          await connection.commit();
        } catch (err) {
          await connection.rollback();
          throw err;
        } finally {
          connection.release();
        }
      }
      
      clearCache('social_links');
      res.json({ success: true });
    } catch (e: any) { 
      console.error(e); 
      res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); 
    }
  });

  // --- Contact Info ---
  app.get('/api/contact_info', async (req, res) => {
    await handleCachedGet(req, res, 'contact_info', async () => {
      const rows = await q('SELECT * FROM contact_info WHERE id=1');
      return rows[0] || null;
    });
  });
  app.post('/api/contact_info', authenticateToken, async (req, res) => {
    try {
      const p = req.body;
      await exec(
        'UPDATE contact_info SET phones=?, email=?, address=?, addressUrl=? WHERE id=1',
        [JSON.stringify(p.phones||[]), p.email||null, p.address||null, p.addressUrl||null]
      );
      clearCache('contact_info');
      res.json([{ id: 1, ...p }]);
    } catch (e: any) { console.error(e); res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); }
  });

  // --- Auth (MySQL based) ---
  app.post('/api/auth/logout', (req, res) => { res.json({ success: true }); });

  app.post('/api/auth/login', loginLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password.trim()) {
        return res.status(400).json({ error: { message: "البريد الإلكتروني وكلمة المرور مطلوبان وبصيغة صحيحة" } });
      }
      
      const users: any = await q('SELECT * FROM users WHERE email = ?', [email.trim()]);
      
      if (users.length > 0) {
        const isMatch = await bcrypt.compare(password, users[0].password);
        if (isMatch) {
          const userToken = { id: users[0].id, email: users[0].email };
          const token = jwt.sign(userToken, JWT_SECRET, { expiresIn: '24h' });
          res.json({ user: userToken, token });
        } else {
          res.status(401).json({ error: { message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" } });
        }
      } else {
        res.status(401).json({ error: { message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" } });
      }
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } });
    }
  });

  app.post('/api/auth/change-password', authenticateToken, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userEmail = req.user.email;
      
      if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || !currentPassword.trim() || !newPassword.trim()) {
        return res.status(400).json({ error: { message: "كلمة المرور الحالية والجديدة مطلوبتان وبصيغة صحيحة" } });
      }
      
      const users: any = await q('SELECT * FROM users WHERE email = ?', [userEmail]);
      if (users.length === 0) return res.status(404).json({ error: { message: "المستخدم غير موجود" } });

      const isMatch = await bcrypt.compare(currentPassword, users[0].password);
      if (!isMatch) return res.status(400).json({ error: { message: "كلمة المرور الحالية غير صحيحة" } });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await exec('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, userEmail]);
      res.json({ success: true });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } });
    }
  });

  // --- Subscribers ---
  app.get('/api/subscribers', authenticateToken, async (req, res) => {
    await handleCachedGet(req, res, 'subscribers_list', () =>
      q('SELECT * FROM subscribers ORDER BY created_at DESC')
    );
  });

  app.post('/api/subscribe', async (req, res) => {
    try {
      const { phone, name } = req.body;
      if (!phone || typeof phone !== 'string' || !phone.trim()) {
        return res.status(400).json({ error: { message: "رقم الهاتف مطلوب وبصيغة صحيحة" } });
      }
      if (phone.length > 100) {
        return res.status(400).json({ error: { message: "رقم الهاتف طويل جداً (الحد الأقصى 100 حرفاً)" } });
      }
      if (name && (typeof name !== 'string' || name.length > 255)) {
        return res.status(400).json({ error: { message: "الاسم طويل جداً (الحد الأقصى 255 حرفاً)" } });
      }
      
      await exec(
        'INSERT INTO subscribers (phone, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
        [phone.trim(), name ? name.trim() : null]
      );
      clearCache('subscribers_list');
      res.json({ success: true, message: "تم الاشتراك بنجاح في تنبيهات واتساب" });
    } catch (e: any) { 
      console.error(e); 
      res.status(500).json({ error: { message: "حدث خطأ أثناء الاشتراك، يرجى المحاولة لاحقاً" } }); 
    }
  });

  app.delete('/api/subscribers/:id', authenticateToken, async (req, res) => {
    try {
      await exec('DELETE FROM subscribers WHERE id=?', [req.params.id]);
      clearCache('subscribers_list');
      res.json({ success: true });
    } catch (e: any) { console.error(e); res.status(500).json({ error: { message: "حدث خطأ داخلي في الخادم." } }); }
  });

  // Meta Conversions API endpoint (disabled as per request)
  app.post('/api/meta-event', async (req, res) => {
    return res.status(200).json({ status: 'ignored', message: 'Meta CAPI credentials not configured' });
  });

  await initDb();

  // 404 handler for API routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: { message: "API endpoint not found" } });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist', 'client');
    
    // Reusable pre-compressed asset serving helper
    const servePrecompressed = (pattern: string, contentType: string) => {
      app.get(pattern, (req, res, next) => {
        const acceptEncoding = req.header('Accept-Encoding') || '';
        const brFile = path.join(distPath, req.path + '.br');
        const gzFile = path.join(distPath, req.path + '.gz');
        
        if (acceptEncoding.includes('br') && fs.existsSync(brFile)) {
          res.set('Content-Encoding', 'br');
          res.set('Content-Type', contentType);
          res.set('Cache-Control', 'public, max-age=31536000, immutable');
          return res.sendFile(brFile);
        } else if (acceptEncoding.includes('gzip') && fs.existsSync(gzFile)) {
          res.set('Content-Encoding', 'gzip');
          res.set('Content-Type', contentType);
          res.set('Cache-Control', 'public, max-age=31536000, immutable');
          return res.sendFile(gzFile);
        }
        next();
      });
    };

    servePrecompressed('*.js', 'application/javascript; charset=UTF-8');
    servePrecompressed('*.css', 'text/css; charset=UTF-8');

    // Set 1 year cache for static assets (js, css, images) with immutable option since Vite hashes them natively
    app.use(express.static(distPath, { 
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
