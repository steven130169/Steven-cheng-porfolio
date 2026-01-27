import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { pushSchema } from 'drizzle-kit/api';
import * as schema from '../schema';

export async function createTestDb() {
    const client = new PGlite();
    const db = drizzle(client, { schema });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any -- pushSchema typings don't match PGlite drizzle instance
    const { apply } = await pushSchema(schema, db as any);
    await apply();

    return { db };
}
