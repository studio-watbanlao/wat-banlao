import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';

import Iconify from '../../iconify';

// ----------------------------------------------------------------------

type Props = {
  icons: string[];
  options: string[];
  value: string;
  onChange: (newValue: string) => void;
};

export default function BaseOptions({ icons, options, value, onChange }: Props) {
  return (
    <Stack direction="row" spacing={2}>
      {options.map((option, index) => {
        const selected = value === option;

        return (
          <ButtonBase
            key={option}
            onClick={() => onChange(option)}
            sx={{
              width: 1,
              height: 80,
              borderRadius: 1,
              border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.08)}`,
              ...(selected && {
                bgcolor: 'background.paper',
                boxShadow: (theme) =>
                  `-24px 8px 24px -4px ${alpha(
                    theme.palette.mode === 'light'
                      ? theme.palette.grey[500]
                      : theme.palette.common.black,
                    0.08
                  )}`,
              }),
              color: selected ? 'primary.main' : 'text.disabled',
            }}
          >
            <Iconify icon={icons[index]} width={28} />
          </ButtonBase>
        );
      })}
    </Stack>
  );
}
