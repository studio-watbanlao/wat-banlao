alter table public.temple_directory_entries
  add column if not exists entry_type text not null default 'MONK',
  add column if not exists term_start text,
  add column if not exists term_end text;

alter table public.temple_directory_entries
  drop constraint if exists temple_directory_entries_entry_type_check;

alter table public.temple_directory_entries
  add constraint temple_directory_entries_entry_type_check
  check (entry_type in ('CURRENT_ABBOT', 'FORMER_ABBOT', 'MONK', 'NOVICE'));

insert into public.temple_directory_entries (
  id,
  temple_id,
  full_name,
  display_title,
  entry_type,
  image_url,
  birth,
  ordination,
  temple_name,
  province,
  affiliation,
  education,
  administrative_positions,
  monastic_rank,
  biography,
  sources,
  sort_order,
  status
)
select
  person.id,
  temple.id,
  person.full_name,
  person.display_title,
  person.entry_type,
  person.image_url,
  person.birth,
  person.ordination,
  person.temple_name,
  person.province,
  person.affiliation,
  person.education,
  person.administrative_positions,
  person.monastic_rank,
  person.biography,
  person.sources,
  person.sort_order,
  'PUBLIC'
from public.temples temple
cross join (
  values
    (
      '10000000-0000-0000-0000-000000000001'::uuid,
      'พระอธิการน้อย',
      '',
      'FORMER_ABBOT',
      '/assets/background/overlay_4.jpg',
      '', '', '', '', '', '', '', '', '',
      '<p>รายงานสืบเนื่องจากการประชุมวิชาการระดับชาติ ครั้งที่ 5 มหาวิทยาลัยมหามกุฏราชวิทยาลัย</p>',
      1
    ),
    (
      '10000000-0000-0000-0000-000000000002'::uuid,
      'พระอธิการสาธุ์ สุขธมฺโม',
      '(สรรพสอน) หลวงปู่สาธุ์',
      'FORMER_ABBOT',
      '/assets/background/overlay_4.jpg',
      '', '', '', '', '', '', '', '', '',
      '<p>รายงานสืบเนื่องจากการประชุมวิชาการระดับชาติ ครั้งที่ 5 มหาวิทยาลัยมหามกุฏราชวิทยาลัย</p>',
      2
    ),
    (
      '10000000-0000-0000-0000-000000000003'::uuid,
      'พระอธิการบุญเหลือ สุขธมฺโม',
      '',
      'FORMER_ABBOT',
      '/assets/background/overlay_4.jpg',
      '', '', '', '', '', '', '', '', '',
      '<p>รายงานสืบเนื่องจากการประชุมวิชาการระดับชาติ ครั้งที่ 5 มหาวิทยาลัยมหามกุฏราชวิทยาลัย</p>',
      3
    ),
    (
      '10000000-0000-0000-0000-000000000004'::uuid,
      'พระอธิการดำรง กวิสฺสโร',
      '(จันทะกา) อดีตเจ้าคณะตำบลเม็กดำ',
      'FORMER_ABBOT',
      '/assets/background/overlay_4.jpg',
      '', '', '', '', '', '', '', '', '',
      '<p>รายงานสืบเนื่องจากการประชุมวิชาการระดับชาติ ครั้งที่ 5 มหาวิทยาลัยมหามกุฏราชวิทยาลัย</p>',
      4
    ),
    (
      '10000000-0000-0000-0000-000000000005'::uuid,
      'พระอธิการบัวลา อิสโร',
      '(แสงอรุณ)',
      'FORMER_ABBOT',
      '/assets/background/overlay_4.jpg',
      '', '', '', '', '', '', '', '', '',
      '<p>รายงานสืบเนื่องจากการประชุมวิชาการระดับชาติ ครั้งที่ 5 มหาวิทยาลัยมหามกุฏราชวิทยาลัย</p>',
      5
    ),
    (
      '10000000-0000-0000-0000-000000000006'::uuid,
      'พระอธิการเส็ง สุธีโร',
      '',
      'FORMER_ABBOT',
      '/assets/background/overlay_4.jpg',
      '', '', '', '', '', '', '', '', '',
      '<p>รายงานสืบเนื่องจากการประชุมวิชาการระดับชาติ ครั้งที่ 5 มหาวิทยาลัยมหามกุฏราชวิทยาลัย</p>',
      6
    ),
    (
      '10000000-0000-0000-0000-000000000007'::uuid,
      'พระสมุห์บุญถม อภิวํโส',
      'เจ้าอาวาสวัดบ้านเหล่า สุขธัมมาราม',
      'CURRENT_ABBOT',
      '/assets/images/img-boontom.png',
      '10 เมษายน พ.ศ. 2529',
      '27 เมษายน พ.ศ. 2550',
      'วัดบ้านเหล่า สุขธัมมาราม',
      'มหาสารคาม',
      'คณะสงฆ์มหานิกาย',
      '<ol><li>สำเร็จชั้นมัธยมศึกษาปีที่ 3 จากโรงเรียนบ้านเหล่า (คุรุประชานุเคราะห์)</li><li>สอบได้นักธรรมชั้นเอก สำนักเรียนวัดบ้านตาลอก</li></ol>',
      '<p>เจ้าอาวาสวัดบ้านเหล่า สุขธัมมาราม</p>',
      '<p>พระสมุห์</p>',
      '<p>สถานะเดิมชื่อ บุญถม รอดสุโข เกิด ณ บ้านเหล่า ตำบลเม็กดำ อำเภอพยัคฆภูมิพิสัย จังหวัดมหาสารคาม</p>',
      '<p>รายงานสืบเนื่องจากการประชุมวิชาการระดับชาติ ครั้งที่ 5 มหาวิทยาลัยมหามกุฏราชวิทยาลัย</p>',
      7
    )
) as person (
  id,
  full_name,
  display_title,
  entry_type,
  image_url,
  birth,
  ordination,
  temple_name,
  province,
  affiliation,
  education,
  administrative_positions,
  monastic_rank,
  biography,
  sources,
  sort_order
)
where temple.slug = 'wat-banlao'
  and not exists (
    select 1
    from public.temple_directory_entries existing
    where existing.temple_id = temple.id
      and existing.full_name = person.full_name
  );

update public.temple_directory_entries entry
set entry_type = 'FORMER_ABBOT'
from public.temples temple
where entry.temple_id = temple.id
  and temple.slug = 'wat-banlao'
  and entry.full_name in (
    'พระอธิการน้อย',
    'พระอธิการสาธุ์ สุขธมฺโม',
    'พระอธิการบุญเหลือ สุขธมฺโม',
    'พระอธิการดำรง กวิสฺสโร',
    'พระอธิการบัวลา อิสโร',
    'พระอธิการเส็ง สุธีโร'
  );

with current_abbot as (
  select entry.id
  from public.temple_directory_entries entry
  join public.temples temple on temple.id = entry.temple_id
  where temple.slug = 'wat-banlao'
    and entry.full_name in ('พระสมุห์บุญถม อภิวํโส', 'พระอธิการบุญถม อภิวํโส')
  order by entry.created_at asc
  limit 1
)
update public.temple_directory_entries entry
set entry_type = 'CURRENT_ABBOT'
from current_abbot
where entry.id = current_abbot.id;

create unique index if not exists temple_directory_entries_one_current_abbot_idx
on public.temple_directory_entries (temple_id)
where entry_type = 'CURRENT_ABBOT';

create index if not exists temple_directory_entries_type_sort_idx
on public.temple_directory_entries (temple_id, entry_type, sort_order);

notify pgrst, 'reload schema';
