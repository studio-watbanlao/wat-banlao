import { m } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';

import { zodResolver } from 'src/utils/zod-resolver';
import { MotionViewport, varFade } from 'src/components/animate';
import { contactPublicFormSchema, type ContactPublicFormValues } from 'src/schemas/contact';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

// ----------------------------------------------------------------------

export default function ContactForm() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactPublicFormValues>({
    resolver: zodResolver(contactPublicFormSchema),
    mode: 'onChange',
    defaultValues: { name: '', email: '', subject: '', message: '', company: '' },
  });

  const onSubmit = async (data: ContactPublicFormValues) => {
    try {
      setLoading(true);

      await axios.post('/api/contact', data);

      enqueueSnackbar('ส่งข้อความสำเร็จ', { variant: 'success' });
      reset();
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, 'ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'), {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack component={MotionViewport} spacing={5}>
      <m.div variants={varFade().inUp}>
        <Typography variant="h3">
          ติดต่อเรา <br />
          เรายินดีรับฟังความคิดเห็นจากคุณ
        </Typography>
      </m.div>

      <Stack spacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          {...register('company')}
          style={{ display: 'none' }}
        />
        <TextField
          label="ชื่อ"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          label="อีเมล"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField label="หัวข้อ" {...register('subject')} />

        <TextField
          label="ข้อความ"
          multiline
          rows={4}
          {...register('message')}
          error={!!errors.message}
          helperText={errors.message?.message}
        />

        <Button
          type="submit"
          size="large"
          variant="contained"
          disabled={!isValid || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'กำลังส่ง...' : 'ส่งข้อความ'}
        </Button>
      </Stack>
    </Stack>
  );
}
