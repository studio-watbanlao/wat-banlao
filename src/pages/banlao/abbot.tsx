import MataData from 'src/components/mata-data/mata-data';
import { MainLayout } from 'src/layouts/main';
import { AbbotView } from 'src/sections/monks/abbot/abbot-view';

export default function AbbotPage() {
  return (
    <MainLayout>
      <MataData
        data={{
          title: 'เจ้าอาวาสวัดบ้านเหล่า',
          description: 'ประวัติ การศึกษา สมณศักดิ์ และบทบาทของเจ้าอาวาสวัดบ้านเหล่า สุขธัมมาราม',
          imageUrl: '/assets/background/overlay_4.jpg',
        }}
      />
      <AbbotView />
    </MainLayout>
  );
}
