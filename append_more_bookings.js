const fs = require('fs');
const content = fs.readFileSync('src/components/dashboard/DashboardTabs.tsx', 'utf8');
const replacement = `      </div>
      {filteredBookings.length > limit && (
        <div className="mt-6 flex justify-center">
          <button onClick={() => setLimit(l => l + 30)} className="px-6 py-2 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer">عرض المزيد</button>
        </div>
      )}
    </>
  );
});`;
const newContent = content.replace(/      <\/div>\n    <\/>\n  \);\n\}\);/g, replacement);
fs.writeFileSync('src/components/dashboard/DashboardTabs.tsx', newContent);
