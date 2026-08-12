import AdminEditPageLoader from 'src/sections/admin/admin-edit-page-loader';
import TemplePageForm from 'src/sections/admin/temple-page-form';
import type { TemplePage } from 'src/types/temple-page';

export default function EditTemplePage() {
  return (
    <AdminEditPageLoader<TemplePage>
      endpoint="/api/admin/pages"
      collectionKey="pages"
      title="หน้าคงที่"
      renderForm={(page) => <TemplePageForm page={page} />}
    />
  );
}
