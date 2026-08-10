import { ActivityView } from "src/sections/admin/activity/view";
import Layout from "../layout";

export const metadata = {
  title: "Dashboard: manage sacred",
};

const ManageSacredPage = () => {
  return (
    <Layout>
      <ActivityView />
    </Layout>
  );
};

export default ManageSacredPage;
