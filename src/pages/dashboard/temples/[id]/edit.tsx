import AdminEditPageLoader from 'src/sections/admin/admin-edit-page-loader';
import TempleFormPage from 'src/sections/admin/temple-form-page';
import type { Temple } from 'src/types/temple';

export default function EditTemplePage() {
  return (
    <AdminEditPageLoader<Temple>
      endpoint="/api/admin/temples"
      collectionKey="temples"
      title="วัด"
      renderForm={(temple) => <TempleFormPage temple={temple} />}
    />
  );
}
