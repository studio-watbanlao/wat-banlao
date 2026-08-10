import type { EditorialItem } from 'src/types/editorial';
import { fetchContentById, fetchContentList, postContentView } from './content';

export const fetchDharma = () => fetchContentList<EditorialItem>('dharma');

export const fetchDharmaById = (id?: string) => fetchContentById<EditorialItem>('dharma', id);

export const postDharmaById = (id: string) => postContentView<EditorialItem>('dharma', id);
