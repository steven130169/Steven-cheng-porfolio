import {db} from '@/server/db';
import {events} from '@/server/db/schema';
import {eq} from 'drizzle-orm';

export async function getPublishedEvents() {
    return db
        .select()
        .from(events)
        .where(eq(events.status, 'PUBLISHED'));
}
