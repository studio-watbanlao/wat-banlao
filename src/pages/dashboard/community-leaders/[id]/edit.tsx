import CommunityLeaderFormPage from 'src/pages/dashboard/community-leaders/new';
import AdminEditPageLoader from 'src/sections/admin/admin-edit-page-loader';
import type { CommunityLeader } from 'src/types/community-leader';

export default function EditCommunityLeaderPage() {
  return (
    <AdminEditPageLoader<CommunityLeader>
      endpoint="/api/admin/community-leaders"
      collectionKey="leaders"
      title="ผู้นำชุมชน"
      renderForm={(leader) => <CommunityLeaderFormPage leader={leader} />}
    />
  );
}
