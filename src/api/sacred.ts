import { fetchContentById, fetchContentList, postContentView } from './content';
import type { SacredItem } from 'src/types/sacred';

export const fetchSacred = () => fetchContentList<SacredItem>('sacred');

export const fetchSacredById = (id?: string) => fetchContentById<SacredItem>('sacred', id);

export const postSacredById = (id: string) => postContentView('sacred', id);
