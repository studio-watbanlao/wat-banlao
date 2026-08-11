import AdminEditPageLoader from 'src/sections/admin/admin-edit-page-loader';
import EditorialFormPage from 'src/sections/admin/editorial/editorial-form-page';
import type { EditorialItem } from 'src/types/editorial';

export default function EditDharmaPage() {
  return (
    <AdminEditPageLoader<EditorialItem>
      endpoint="/api/admin/dharmas"
      collectionKey="dharmas"
      title="ธรรมะ"
      renderForm={(item) => <EditorialFormPage resource="dharma" title="ธรรมะ" item={item} />}
    />
  );
}
