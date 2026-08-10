import { AxiosResponseHelper, axiosAuthInstance } from 'src/lib/axios';
import { Example } from 'src/types/example';

export const fetchExample = async () => {
  const { data } = await axiosAuthInstance<AxiosResponseHelper<Example>>({
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts',
  });
  if (data) {
    return data;
  }
  throw new Error('Data is undefined');
};
