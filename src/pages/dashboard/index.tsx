import { DashboardAppView } from "src/sections/admin/dashboard/view";
import Layout from "./layout";

export const metadata = {
  title: "Dashboard: App",
};

const DashboardViewPage = () => {
  return (
    <Layout>
      <DashboardAppView />
    </Layout>
  );
};

export default DashboardViewPage;
