import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';

import Iconify from 'src/components/iconify';
import type { ManagedPublicTemplate } from 'src/public-templates/catalog';
import type { Temple } from 'src/types/temple';

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

type Props = {
  open: boolean;
  template: ManagedPublicTemplate | null;
  temples: Temple[];
  onClose: () => void;
};

const DEVICE_WIDTH: Record<PreviewDevice, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 390,
};

const DEVICE_OPTIONS: Array<{ value: PreviewDevice; label: string; icon: string }> = [
  { value: 'desktop', label: 'คอมพิวเตอร์', icon: 'solar:monitor-bold' },
  { value: 'tablet', label: 'แท็บเล็ต', icon: 'solar:tablet-bold' },
  { value: 'mobile', label: 'โทรศัพท์', icon: 'solar:smartphone-bold' },
];

export default function PublicTemplatePreviewDialog({ open, template, temples, onClose }: Props) {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [templeId, setTempleId] = useState('');

  useEffect(() => {
    if (!open) return;
    setDevice('desktop');
    setTempleId((current) =>
      temples.some((temple) => temple.id === current) ? current : temples[0]?.id || ''
    );
  }, [open, temples]);

  const previewUrl = useMemo(() => {
    if (!template || !templeId) return '';
    const params = new URLSearchParams({ template: template.key, templeId });
    return `/dashboard/templates/preview?${params.toString()}`;
  }, [template, templeId]);

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle sx={{ py: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6">Preview หน้าเว็บไซต์จริง</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {template?.name || '-'} · แสดง Header, หน้าแรก และ Footer จาก code จริง
            </Typography>
          </Box>
          <IconButton aria-label="ปิดหน้าตัวอย่าง" onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{ p: 0, display: 'flex', minHeight: 0, flexDirection: 'column', bgcolor: '#E9EDF2' }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ md: 'center' }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{
            px: 2.5,
            py: 1.5,
            bgcolor: 'background.paper',
            borderBlock: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Select
            size="small"
            value={templeId}
            onChange={(event) => setTempleId(event.target.value)}
            displayEmpty
            sx={{ minWidth: 260 }}
          >
            {temples.length ? (
              temples.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="">ไม่พบข้อมูลวัด</MenuItem>
            )}
          </Select>

          <Stack direction="row" spacing={1} alignItems="center">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={device}
              onChange={(_, value: PreviewDevice | null) => value && setDevice(value)}
              aria-label="เลือกขนาดหน้าจอ"
            >
              {DEVICE_OPTIONS.map((option) => (
                <ToggleButton key={option.value} value={option.value} aria-label={option.label}>
                  <Iconify icon={option.icon} width={18} sx={{ mr: { xs: 0, sm: 0.75 } }} />
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {option.label}
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Button
              component="a"
              href={previewUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              disabled={!previewUrl}
              variant="outlined"
              startIcon={<Iconify icon="solar:square-arrow-right-up-bold" />}
            >
              เปิดแท็บใหม่
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 1, md: 2 } }}>
          <Box
            sx={{
              width: DEVICE_WIDTH[device],
              maxWidth: device === 'desktop' ? '100%' : 'none',
              height: '100%',
              minHeight: 640,
              mx: 'auto',
              overflow: 'hidden',
              bgcolor: 'common.white',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
              transition: 'width 220ms ease',
            }}
          >
            {previewUrl ? (
              <Box
                key={previewUrl}
                component="iframe"
                src={previewUrl}
                title={`Preview ${template?.name || 'Public Template'}`}
                sx={{ display: 'block', width: '100%', height: '100%', minHeight: 640, border: 0 }}
              />
            ) : null}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
