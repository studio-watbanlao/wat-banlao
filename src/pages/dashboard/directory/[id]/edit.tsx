import TempleDirectoryFormPage from 'src/pages/dashboard/directory/new';
import AdminEditPageLoader from 'src/sections/admin/admin-edit-page-loader';
import type { TempleDirectoryEntry } from 'src/types/temple-directory';

export default function EditTempleDirectoryPage() {
  return (
    <AdminEditPageLoader<TempleDirectoryEntry>
      endpoint="/api/admin/directory"
      collectionKey="entries"
      title="ทำเนียบวัด"
      renderForm={(entry) => <TempleDirectoryFormPage entry={entry} />}
    />
  );
}
