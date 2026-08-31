import { getStore, type Store } from '@netlify/blobs';

export const getBlobStore = (name: string): Store => getStore({ name, consistency: 'strong' });
