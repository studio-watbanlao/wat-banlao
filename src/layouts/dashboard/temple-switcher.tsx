import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { useAuthContext } from 'src/auth/hooks';
import type { TempleAccess } from 'src/types/temple';
import axios from 'src/utils/axios';

const ROLE_LABEL: Record<TempleAccess['role'], string> = {
  super_admin: 'ผู้ดูแลระบบสูงสุด',
  temple_admin: 'ผู้ดูแลวัด',
  temple_editor: 'บรรณาธิการ',
  temple_contributor: 'ผู้เขียนเนื้อหา',
};

export function TempleSwitcher() {
  const { user } = useAuthContext();
  const [switching, setSwitching] = useState(false);
  const accesses = (user?.templeAccesses || []) as TempleAccess[];
  const currentId = String(user?.currentTempleId || accesses[0]?.temple.id || '');
  const current = accesses.find((access) => access.temple.id === currentId) || accesses[0];

  if (!current) return null;

  const changeTemple = async (templeId: string) => {
    if (templeId === currentId) return;
    try {
      setSwitching(true);
      await axios.post('/api/admin/temple-context', { templeId });
      window.location.reload();
    } finally {
      setSwitching(false);
    }
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
      <Avatar
        src={current.temple.branding.logoUrl}
        alt={current.temple.name}
        sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
      >
        {current.temple.name.slice(0, 1)}
      </Avatar>
      {accesses.length > 1 ? (
        <Select
          size="small"
          value={currentId}
          disabled={switching}
          onChange={(event) => changeTemple(String(event.target.value))}
          sx={{ minWidth: { xs: 150, sm: 220 }, maxWidth: 280 }}
        >
          {accesses.map((access) => (
            <MenuItem key={access.temple.id} value={access.temple.id}>
              {access.temple.name}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="subtitle2" noWrap>
            {current.temple.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {ROLE_LABEL[current.role]}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
