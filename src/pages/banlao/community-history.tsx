import MataData from 'src/components/mata-data/mata-data';
import { MainLayout } from 'src/layouts/main';
import { CommunityHistoryView } from 'src/sections/community/history/community-history-view';

export default function CommunityHistoryPage() {
  return (
    <MainLayout>
      <MataData
        data={{
          title: 'ประวัติบ้านเหล่า',
          description: 'ประวัติความเป็นมา วิถีชีวิต และพัฒนาการของชุมชนบ้านเหล่า',
          imageUrl: '/assets/images/house.png',
        }}
      />
      <CommunityHistoryView />
    </MainLayout>
  );
}
