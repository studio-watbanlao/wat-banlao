import MataData from 'src/components/mata-data/mata-data';
import { MainLayout } from 'src/layouts/main';
import { MonkDirectoryView } from 'src/sections/monks/directory/monk-directory-view';

export default function MonksPage() {
  return (
    <MainLayout>
      <MataData
        data={{
          title: 'ทำเนียบพระสงฆ์วัดบ้านเหล่า',
          description: 'รายนามและข้อมูลพระภิกษุสามเณรประจำวัดบ้านเหล่า สุขธัมมาราม',
          imageUrl: '/assets/background/overlay_4.jpg',
        }}
      />
      <MonkDirectoryView />
    </MainLayout>
  );
}
