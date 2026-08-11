
import { Controller, useFormContext } from 'react-hook-form';
import FormLabel from '@mui/material/FormLabel';

import type { EditorProps } from '../editor';
import { Editor } from '../editor';

// ----------------------------------------------------------------------

export type RHFEditorProps = EditorProps & {
  name: string;
  label?: React.ReactNode;
};

export function RHFEditor({ name, label, helperText, ...other }: RHFEditorProps) {
  const {
    control,
    formState: { isSubmitSuccessful },
  } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          {label && <FormLabel sx={{ mb: 1 }}>{label}</FormLabel>}
          <Editor
            {...field}
            error={!!error}
            helperText={error?.message ?? helperText}
            resetValue={isSubmitSuccessful}
            {...other}
          />
        </>
      )}
    />
  );
}
