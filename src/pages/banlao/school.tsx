import MataData from 'src/components/mata-data/mata-data';
import { MainLayout } from 'src/layouts/main';
import { BanlaoSchoolView } from 'src/sections/community/school/banlao-school-view';

export default function BanlaoSchoolPage() {
  return (
    <MainLayout>
      <MataData
        data={{
          title: 'โรงเรียนบ้านเหล่า',
          description: 'ข้อมูลโรงเรียนบ้านเหล่า (คุรุประชานุเคราะห์) และบทบาทของโรงเรียนในชุมชน',
          imageUrl: '/assets/images/school.png',
        }}
      />
      <BanlaoSchoolView />
    </MainLayout>
  );
}
