import { fetchContentById, fetchContentList, postContentView } from './content';

export const fetchFastival = () => fetchContentList('fastival');

export const fetchFastivalById = (id?: string) => fetchContentById('fastival', id);

export const postFastivalById = (id: string) => postContentView('fastival', id);
