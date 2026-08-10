import { fetchContentById, fetchContentList, postContentView } from './content';

export const fetchBlog = () => fetchContentList('blog');

export const fetchBlogById = (id?: string) => fetchContentById('blog', id);

export const postBlogById = (id: string) => postContentView('blog', id);
