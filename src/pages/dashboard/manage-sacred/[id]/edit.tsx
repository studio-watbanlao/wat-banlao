import AdminEditPageLoader from 'src/sections/admin/admin-edit-page-loader';
import SacredFormPage from 'src/sections/admin/sacred-form-page';
import type { SacredItem } from 'src/types/sacred';

export default function EditSacredPage() {
  return (
    <AdminEditPageLoader<SacredItem>
      endpoint="/api/admin/sacred"
      collectionKey="items"
      title="วัตถุมงคล"
      renderForm={(item) => <SacredFormPage item={item} />}
    />
  );
}
