const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardTabs.tsx', 'utf8');

// 1. Fix BookingsTab
content = content.replace(/}: BookingsTabProps\) \{\n  return \(/g, `}: BookingsTabProps) {
  const [limit, setLimit] = React.useState(30);
  const displayedBookings = filteredBookings.slice(0, limit);
  return (`);

// 2. Fix GenericItemsTab
content = content.replace(/}: GenericItemsTabProps\) \{\n  return \(/g, `}: GenericItemsTabProps) {
  const [limit, setLimit] = React.useState(30);
  const displayedItems = items.slice(0, limit);
  return (`);

// 3. Fix SubscribersTab
content = content.replace(/}: SubscribersTabProps\) \{\n  const handleRefresh/g, `}: SubscribersTabProps) {
  const [limit, setLimit] = React.useState(30);
  const displayedSubscribers = filteredSubscribers.slice(0, limit);
  const handleRefresh`);

fs.writeFileSync('src/components/dashboard/DashboardTabs.tsx', content);
