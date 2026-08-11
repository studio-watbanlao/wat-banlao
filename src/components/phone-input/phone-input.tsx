import type { TextFieldProps } from '@mui/material/TextField';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export type PhoneInputProps = Omit<TextFieldProps, 'type'>;

export function PhoneInput({ slotProps, ...other }: PhoneInputProps) {
  return (
    <TextField
      {...other}
      type="tel"
      slotProps={{
        ...slotProps,
        htmlInput: {
          inputMode: 'tel',
          autoComplete: 'tel',
          ...slotProps?.htmlInput,
        },
      }}
    />
  );
}
