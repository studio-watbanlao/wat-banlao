import Layout from 'src/pages/dashboard/layout';
import EditorialManagementView from 'src/sections/admin/editorial/editorial-management-view';

export default function DharmaManagementPage() {
  return (
    <Layout>
      <EditorialManagementView
        resource="dharma"
        title="ธรรมะ"
        description="ข้อมูลที่แสดงในหน้าธรรมะของเว็บไซต์"
      />
    </Layout>
  );
}
