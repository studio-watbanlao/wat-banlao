import { fetchContentById, fetchContentList, postContentView } from './content';
import type { ArchitectureItem } from 'src/types/architecture';

export const fetchArchitecture = () => fetchContentList<ArchitectureItem>('architecture');

export const fetchArchitectureById = (id?: string) =>
  fetchContentById<ArchitectureItem>('architecture', id);

export const postArchitectureById = (id: string) => postContentView('architecture', id);
