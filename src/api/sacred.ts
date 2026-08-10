import { fetchContentById, fetchContentList, postContentView } from './content';

export const fetchSacred = () => fetchContentList('sacred');

export const fetchSacredById = (id?: string) => fetchContentById('sacred', id);

export const postSacredById = (id: string) => postContentView('sacred', id);
