import {NextRequest, NextResponse} from 'next/server';
import {createEventSchema} from '@/server/validators/event.schema';
import {createDraftEvent} from '@/server/services/event';

/**
 * POST /api/admin/events
 * Create a new draft event
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as unknown;

        // Validate input
        const validatedData = createEventSchema.parse(body);

        // Create draft event using service layer
        const event = await createDraftEvent(validatedData);

        return NextResponse.json(event, {status: 201});
    } catch (error) {
        // Zod validation error
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                {error: 'Validation failed', details: error},
                {status: 400}
            );
        }

        // Duplicate slug error
        if (error instanceof Error && error.message === 'Event with this title already exists') {
            return NextResponse.json(
                {error: error.message},
                {status: 400}
            );
        }

        // Database or other errors
        console.error('Error creating event:', error);
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}
