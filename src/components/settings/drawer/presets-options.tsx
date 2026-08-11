import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';

import { primaryColorPresets } from 'src/theme/with-settings/color-presets';

// ----------------------------------------------------------------------

type PresetsOptionsProps = {
  value: string;
  onChange: (newValue: string) => void;
};

export default function PresetsOptions({ value, onChange }: PresetsOptionsProps) {
  const presetOptions = [
    { name: 'default', value: primaryColorPresets.default.main },
    { name: 'cyan', value: primaryColorPresets.preset1.main },
    { name: 'purple', value: primaryColorPresets.preset2.main },
    { name: 'blue', value: primaryColorPresets.preset3.main },
    { name: 'orange', value: primaryColorPresets.preset4.main },
    { name: 'red', value: primaryColorPresets.preset5.main },
  ];

  return (
    <Box columnGap={2} rowGap={1.5} display="grid" gridTemplateColumns="repeat(3, 1fr)">
      {presetOptions.map((option) => {
        const selected = value === option.name;

        return (
          <ButtonBase
            key={option.name}
            onClick={() => onChange(option.name)}
            sx={{
              height: 56,
              borderRadius: 1,
              border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.08)}`,
              ...(selected && {
                borderColor: 'transparent',
                bgcolor: alpha(option.value, 0.08),
              }),
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: option.value,
                transition: (theme) =>
                  theme.transitions.create(['transform'], {
                    duration: theme.transitions.duration.shorter,
                  }),
                ...(selected && {
                  transform: 'scale(2)',
                }),
              }}
            />
          </ButtonBase>
        );
      })}
    </Box>
  );
}
