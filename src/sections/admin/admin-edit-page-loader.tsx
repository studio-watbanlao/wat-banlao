import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';
import { type ReactNode, useEffect, useState } from 'react';

import Layout from 'src/pages/dashboard/layout';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

type Props<T extends { id: string }> = {
  endpoint: string;
  collectionKey: string;
  title: string;
  renderForm: (item: T) => ReactNode;
};

export default function AdminEditPageLoader<T extends { id: string }>({
  endpoint,
  collectionKey,
  title,
  renderForm,
}: Props<T>) {
  const router = useRouter();
  const [item, setItem] = useState<T | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady || typeof router.query.id !== 'string') return;

    const loadItem = async () => {
      try {
        setError('');
        const response = await axios.get(endpoint);
        const items = response.data[collectionKey] as T[];
        const selectedItem = items.find((entry) => entry.id === router.query.id);

        if (!selectedItem) throw new Error(`ไม่พบข้อมูล ${title}`);
        setItem(selectedItem);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      }
    };

    loadItem();
  }, [collectionKey, endpoint, router.isReady, router.query.id, title]);

  if (item) return renderForm(item);

  return (
    <Layout>
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">แก้ไข{title}</Typography>
          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Typography color="text.secondary">กำลังโหลด...</Typography>
          )}
        </Stack>
      </Container>
    </Layout>
  );
}
