import ArchitectureFormPage from 'src/pages/dashboard/architectures/new';
import AdminEditPageLoader from 'src/sections/admin/admin-edit-page-loader';
import type { ArchitectureItem } from 'src/types/architecture';

export default function EditArchitecturePage() {
  return (
    <AdminEditPageLoader<ArchitectureItem>
      endpoint="/api/admin/architectures"
      collectionKey="architectures"
      title="ข้อมูลสถาปัตย์"
      renderForm={(architecture) => <ArchitectureFormPage architecture={architecture} />}
    />
  );
}
