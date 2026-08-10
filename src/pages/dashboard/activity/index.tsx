import { ActivityView } from "src/sections/admin/activity/view";
import Layout from "../layout";

export const metadata = {
  title: "Dashboard: Activity",
};

const ActivityPage = () => {
  return (
    <Layout>
      <ActivityView />
    </Layout>
  );
};

export default ActivityPage;
