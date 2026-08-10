import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import { useGetDharmaById } from 'src/queries/article/dharma';
import { usePostDharma } from 'src/queries/article/dharma/mutation';
import { paths } from 'src/routes/paths';
import EditorialDetailContent from '../editorial-detail-content';

const DharmaDetailsView = () => {
  const params = useParams();
  const id = params?.id as string;
  const { data, isLoading } = useGetDharmaById(id);
  const { mutate } = usePostDharma();

  useEffect(() => {
    if (id) mutate(id);
  }, [id, mutate]);

  return (
    <EditorialDetailContent
      data={data}
      isLoading={isLoading}
      sectionName="ธรรมะ"
      sectionPath={paths.article.dharma.root}
    />
  );
};

export default DharmaDetailsView;
