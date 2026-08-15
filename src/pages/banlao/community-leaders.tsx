import MataData from 'src/components/mata-data/mata-data';
import { MainLayout } from 'src/layouts/main';
import { CommunityLeadersView } from 'src/sections/community/leaders/community-leaders-view';

export default function CommunityLeadersPage() {
  return (
    <MainLayout>
      <MataData
        data={{
          title: 'ผู้นำชุมชน',
          description:
            'รายชื่อพร้อมรูปภาพผู้ใหญ่บ้าน ผู้ช่วยผู้ใหญ่บ้าน และสมาชิกสภาองค์การบริหารส่วนตำบล',
        }}
      />
      <CommunityLeadersView />
    </MainLayout>
  );
}
