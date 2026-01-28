import {db} from '@/server/db';
import {events} from '@/server/db/schema';
import {eq} from 'drizzle-orm';

/**
 * Retrieves a list of events with a status of "PUBLISHED" from the database.
 *
 * @return {Promise<Array<Object>>} A promise that resolves to an array of event objects that are in the "PUBLISHED" state.
 */
export async function getPublishedEvents(): Promise<Array<typeof events.$inferSelect>> {
    return db
        .select()
        .from(events)
        .where(eq(events.status, 'PUBLISHED'));
}
