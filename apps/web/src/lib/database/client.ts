import { PGlite } from '@electric-sql/pglite';
import { live } from '@electric-sql/pglite/live';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';

export const pgClient = await PGlite.create({
	dataDir: 'idb://haptic',
	extensions: {
		live
	}
});
export const db = drizzle(pgClient, { schema });
