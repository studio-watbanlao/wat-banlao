import { fetchContentById, fetchContentList, postContentView } from './content';
import type { ActivityItem } from 'src/types/activity';

export const fetchActivity = () => fetchContentList<ActivityItem>('activity');

export const fetchActivityById = (id?: string) => fetchContentById<ActivityItem>('activity', id);

export const postActivityById = (id: string) => postContentView('activity', id);
