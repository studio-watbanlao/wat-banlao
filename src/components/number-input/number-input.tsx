import type { ChangeEvent } from 'react';
import type { TextFieldProps } from '@mui/material/TextField';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export type NumberInputProps = Omit<TextFieldProps, 'type' | 'value' | 'onChange'> & {
  value?: number | null;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (event: ChangeEvent<HTMLInputElement>, value: number | null) => void;
};

export function NumberInput({ value, min, max, step, onChange, slotProps, ...other }: NumberInputProps) {
  return (
    <TextField
      {...other}
      type="number"
      value={value ?? ''}
      onChange={(event) => {
        const nextValue = event.target.value === '' ? null : Number(event.target.value);
        onChange?.(event as ChangeEvent<HTMLInputElement>, nextValue);
      }}
      slotProps={{
        ...slotProps,
        htmlInput: {
          min,
          max,
          step,
          ...slotProps?.htmlInput,
        },
      }}
    />
  );
}
