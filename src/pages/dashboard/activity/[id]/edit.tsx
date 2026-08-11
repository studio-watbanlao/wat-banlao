import ActivityFormPage from 'src/pages/dashboard/activity/new';
import AdminEditPageLoader from 'src/sections/admin/admin-edit-page-loader';
import type { ActivityItem } from 'src/types/activity';

export default function EditActivityPage() {
  return (
    <AdminEditPageLoader<ActivityItem>
      endpoint="/api/admin/activities"
      collectionKey="activities"
      title="กิจกรรม"
      renderForm={(activity) => <ActivityFormPage activity={activity} />}
    />
  );
}
