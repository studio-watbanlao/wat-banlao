import FestivalFormPage from 'src/pages/dashboard/festivals/new';
import AdminEditPageLoader from 'src/sections/admin/admin-edit-page-loader';
import type { FestivalItem } from 'src/types/festival';

export default function EditFestivalPage() {
  return (
    <AdminEditPageLoader<FestivalItem>
      endpoint="/api/admin/festivals"
      collectionKey="festivals"
      title=" Festival"
      renderForm={(festival) => <FestivalFormPage festival={festival} />}
    />
  );
}
