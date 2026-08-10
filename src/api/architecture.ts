import { fetchContentById, fetchContentList, postContentView } from './content';

export const fetchArchitecture = () => fetchContentList('architecture');

export const fetchArchitectureById = (id?: string) => fetchContentById('architecture', id);

export const postArchitectureById = (id: string) => postContentView('architecture', id);
