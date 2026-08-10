import Layout from 'src/pages/dashboard/layout';
import EditorialManagementView from 'src/sections/admin/editorial/editorial-management-view';

export default function BlogManagementPage() {
  return (
    <Layout>
      <EditorialManagementView
        resource="blog"
        title="บทความ"
        description="ข้อมูลที่แสดงในหน้าบทความของเว็บไซต์"
      />
    </Layout>
  );
}
