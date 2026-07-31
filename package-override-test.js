const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.overrides = {
  ...pkg.overrides,
  "rollup": "npm:@rollup/wasm-node@^4.28.1"
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
