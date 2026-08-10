import emailjs from '@emailjs/browser';
import { m } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useSnackbar } from 'notistack';
import { MotionViewport, varFade } from 'src/components/animate';
import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

type FormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactForm() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      await emailjs.send(
        CONFIG.emailjs.serviceKey,
        CONFIG.emailjs.templateKey,
        {
          name: data.name,
          email: data.email,
          subject: data.subject || 'ติดต่อจากเว็บไซต์',
          time: new Date(),
          message: data.message,
        },
        CONFIG.emailjs.puclicKey
      );

      enqueueSnackbar('ส่งข้อความสำเร็จ', { variant: 'success' });
      reset();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('ส่งไม่สำเร็จ', { variant: 'error' });
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
        <TextField
          label="ชื่อ"
          {...register('name', { required: 'กรุณากรอกชื่อ' })}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          label="อีเมล"
          {...register('email', {
            required: 'กรุณากรอกอีเมล',
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: 'รูปแบบอีเมลไม่ถูกต้อง',
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField label="หัวข้อ" {...register('subject')} />

        <TextField
          label="ข้อความ"
          multiline
          rows={4}
          {...register('message', {
            required: 'กรุณากรอกข้อความ',
          })}
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
