import { fetchContentById, fetchContentList, postContentView } from './content';

export const fetchActivity = () => fetchContentList('activity');

export const fetchActivityById = (id?: string) => fetchContentById('activity', id);

export const postActivityById = (id: string) => postContentView('activity', id);
