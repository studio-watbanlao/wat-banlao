import AdminEditPageLoader from 'src/sections/admin/admin-edit-page-loader';
import EditorialFormPage from 'src/sections/admin/editorial/editorial-form-page';
import type { EditorialItem } from 'src/types/editorial';

export default function EditBlogPage() {
  return (
    <AdminEditPageLoader<EditorialItem>
      endpoint="/api/admin/blogs"
      collectionKey="blogs"
      title="บทความ"
      renderForm={(item) => <EditorialFormPage resource="blog" title="บทความ" item={item} />}
    />
  );
}
