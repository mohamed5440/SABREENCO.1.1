const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardTabs.tsx', 'utf8');

// Replace map over filteredSubscribers to displayedSubscribers
content = content.replace(/\{filteredSubscribers\.map\(/g, '{displayedSubscribers.map(');

// Add Load More
content = content.replace(/          \{filteredSubscribers\.length === 0 && \(\n            <div className="p-8 text-center text-gray-400 font-medium text-sm">\n              \{subscribers\.length === 0 \? "لا يوجد مشتركون حالياً" : "لا توجد نتائج تطابق بحثك"\}\n            <\/div>\n          \)\}\n        <\/div>\n      <\/div>\n    <\/div>\n  \);\n\}\);/g, `          {filteredSubscribers.length === 0 && (
            <div className="p-8 text-center text-gray-400 font-medium text-sm">
              {subscribers.length === 0 ? "لا يوجد مشتركون حالياً" : "لا توجد نتائج تطابق بحثك"}
            </div>
          )}
        </div>
        {filteredSubscribers.length > limit && (
          <div className="p-4 flex justify-center border-t border-gray-100">
            <button onClick={() => setLimit(l => l + 30)} className="px-6 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer">عرض المزيد</button>
          </div>
        )}
      </div>
    </div>
  );
});`);

fs.writeFileSync('src/components/dashboard/DashboardTabs.tsx', content);
