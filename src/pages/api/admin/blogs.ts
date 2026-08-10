import { createEditorialAdminHandler } from 'src/lib/editorial-admin-api';

export const config = { api: { bodyParser: { sizeLimit: '16mb' } } };

export default createEditorialAdminHandler('blog');
