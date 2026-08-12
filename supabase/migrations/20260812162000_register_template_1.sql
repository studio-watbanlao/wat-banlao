insert into public.public_templates
  (template_key, name, description, features, preview, status)
values
  (
    'template-1',
    'Temple Heritage',
    'รูปแบบเข้มสง่างาม เน้นภาพ Hero ขนาดใหญ่ ลายเส้นสีทอง และเนื้อหาที่อ่านง่าย',
    '["Header โทนเข้ม", "Hero เต็มพื้นที่", "Footer โทนเข้ม", "รองรับหน้าคงที่"]'::jsonb,
    '{"background":"#10291F","surface":"#F7F0DF","accent":"#D6AD5C","text":"#FFF8E8"}'::jsonb,
    'READY'
  )
on conflict (template_key) do update set
  features = excluded.features,
  preview = excluded.preview,
  status = 'READY';

notify pgrst, 'reload schema';
