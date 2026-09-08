const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardTabs.tsx', 'utf8');

content = content.replace(/      <\/div>\n    <\/>\n  \);\n\}\);\n\n\/\/ ==========================================\n\/\/ 3\. GenericItemsTab/g, `      </div>
      {filteredBookings.length > limit && (
        <div className="mt-6 flex justify-center pb-4">
          <button onClick={() => setLimit(l => l + 30)} className="px-6 py-2 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer">عرض المزيد</button>
        </div>
      )}
    </>
  );
});

// ==========================================
// 3. GenericItemsTab`);

content = content.replace(/      <UniversalItemsView\n        items={displayedItems}/g, `      <UniversalItemsView\n        items={displayedItems}`);

content = content.replace(/      \/>\n    <\/>\n  \);\n\}\);/g, `      />
      {items.length > limit && (
        <div className="mt-6 flex justify-center pb-4">
          <button onClick={() => setLimit(l => l + 30)} className="px-6 py-2 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer">عرض المزيد</button>
        </div>
      )}
    </>
  );
});`);

content = content.replace(/        <\/div>\n      \)\ : \(\n        <div className="px-4 py-10 text-center text-gray-400 font-medium bg-white rounded-xl border border-gray-150">\n          لا يوجد مشتركين مطابقين للبحث\n        <\/div>\n      \)}\n    <\/div>\n  \);\n\}\);/g, `        </div>
      ) : (
        <div className="px-4 py-10 text-center text-gray-400 font-medium bg-white rounded-xl border border-gray-150">
          لا يوجد مشتركين مطابقين للبحث
        </div>
      )}
      {filteredSubscribers.length > limit && (
        <div className="mt-6 flex justify-center pb-4">
          <button onClick={() => setLimit(l => l + 30)} className="px-6 py-2 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer">عرض المزيد</button>
        </div>
      )}
    </div>
  );
});`);

fs.writeFileSync('src/components/dashboard/DashboardTabs.tsx', content);
