import {db} from '@/server/db';
import {events} from '@/server/db/schema';
import {createEventSchema, type CreateEventInput} from '@/server/validators/event.schema';
import slugify from 'slugify';
import {eq} from 'drizzle-orm';

export async function createDraftEvent(input: CreateEventInput) {
    // Validate input
    const validatedData = createEventSchema.parse(input);

    // Generate slug
    const slug = slugify(validatedData.title, {lower: true, strict: true});

    // Check slug uniqueness
    const existing = await db
        .select({id: events.id})
        .from(events)
        .where(eq(events.slug, slug))
        .limit(1);

    if (existing.length > 0) {
        throw new Error('Event with this title already exists');
    }

    // Create event
    const [event] = await db
        .insert(events)
        .values({
            slug,
            title: validatedData.title,
            description: validatedData.description,
            status: 'DRAFT',
            totalCapacity: validatedData.totalCapacity,
            eventDate: validatedData.eventDate ? new Date(validatedData.eventDate) : null,
        })
        .returning();

    return event;
}
