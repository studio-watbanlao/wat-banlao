import { fetchContentById, fetchContentList, postContentView } from './content';
import type { EditorialItem } from 'src/types/editorial';

export const fetchBlog = () => fetchContentList<EditorialItem>('blog');

export const fetchBlogById = (id?: string) => fetchContentById<EditorialItem>('blog', id);

export const postBlogById = (id: string) => postContentView<EditorialItem>('blog', id);
