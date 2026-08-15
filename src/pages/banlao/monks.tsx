import MataData from 'src/components/mata-data/mata-data';
import { MainLayout } from 'src/layouts/main';
import { MonkDirectoryView } from 'src/sections/monks/directory/monk-directory-view';

export default function MonksPage() {
  return (
    <MainLayout>
      <MataData
        data={{
          title: 'ทำเนียบพระสงฆ์',
          description: 'รายนามและข้อมูลพระภิกษุสามเณรประจำวัด',
        }}
      />
      <MonkDirectoryView />
    </MainLayout>
  );
}
