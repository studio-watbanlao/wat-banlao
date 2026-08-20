import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuthContext } from 'src/auth/hooks';
import { Field, Form } from 'src/components/hook-form';
import Layout from 'src/pages/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { profileFormSchema, type ProfileFormValues } from 'src/schemas/profile';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { zodResolver } from 'src/utils/zod-resolver';

export default function DashboardProfilePage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      penName: user?.penName || '',
    },
  });

  const save = methods.handleSubmit(async (values) => {
    try {
      setError('');
      setSuccess('');
      await axios.patch('/api/auth/profile', values);
      setSuccess('บันทึกโปรไฟล์เรียบร้อยแล้ว');
      router.refresh();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'บันทึกโปรไฟล์ไม่สำเร็จ'));
    }
  });

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <div>
            <Typography variant="h4">โปรไฟล์ของฉัน</Typography>
            <Typography variant="body2" color="text.secondary">
              แก้ไขชื่อที่แสดงและนามปากกาสำหรับใช้สร้างเนื้อหา
            </Typography>
          </div>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <Card>
            <CardContent>
              <Form methods={methods} onSubmit={save}>
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      src={user?.photoURL}
                      alt={user?.displayName || 'ผู้ใช้งาน'}
                      sx={{ width: 72, height: 72 }}
                    >
                      {(user?.displayName || user?.email || 'ผ').charAt(0)}
                    </Avatar>
                    <Stack sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" noWrap>
                        {user?.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        รูปโปรไฟล์เชื่อมต่อจากบัญชี Google
                      </Typography>
                    </Stack>
                  </Stack>

                  <Field.Text name="displayName" label="ชื่อที่แสดง" required />
                  <Field.Text
                    name="penName"
                    label="นามปากกา"
                    helperText="ระบบจะใช้ชื่อนี้เป็นชื่อผู้เขียนเมื่อสร้างบทความหรือธรรมะใหม่ หากไม่กรอกจะใช้ชื่อที่แสดง"
                  />

                  <Stack direction="row" justifyContent="flex-end">
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      loading={methods.formState.isSubmitting}
                    >
                      บันทึกโปรไฟล์
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Form>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Layout>
  );
}
