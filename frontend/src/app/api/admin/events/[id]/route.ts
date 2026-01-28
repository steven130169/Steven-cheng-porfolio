import {NextRequest, NextResponse} from 'next/server';
import {updateEventSchema} from '@/server/validators/event.schema';
import {updateEvent} from '@/server/services/event';


/**
 * Handles an HTTP PATCH request to update an event based on the provided event ID and request body.
 *
 * @param {NextRequest} request - The incoming HTTP request containing the event data to update.
 * @param {Object} options - An object containing additional parameters.
 * @param {Promise<{ id: string }>} options.params - A promise resolving to an object containing the event ID as a string.
 * @return {Promise<NextResponse>} A response indicating the outcome of the operation:
 * - 200: Updated event data if the operation succeeds.
 * - 400: Validation or business logic error, such as invalid input or constraints violations.
 * - 404: Event not found.
 * - 500: Internal server error in case of unexpected issues.
 */
export async function PATCH(
    request: NextRequest,
    {params}: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        // Parse and validate event ID
        const {id} = await params;
        const eventId = Number.parseInt(id, 10);

        if (Number.isNaN(eventId)) {
            return NextResponse.json(
                {error: 'Invalid event ID'},
                {status: 400}
            );
        }

        // Parse and validate request body
        const body = await request.json() as unknown;
        const validatedData = updateEventSchema.parse(body);

        // Update event using service layer
        const event = await updateEvent(eventId, validatedData);

        return NextResponse.json(event, {status: 200});
    } catch (error) {
        // Zod validation error
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                {error: 'Validation failed', details: error},
                {status: 400}
            );
        }

        // Event not found
        if (error instanceof Error && error.message === 'Event not found') {
            return NextResponse.json(
                {error: error.message},
                {status: 404}
            );
        }

        // Business logic errors (capacity, slug, etc.)
        if (error instanceof Error && (
            error.message.includes('Cannot decrease capacity') ||
            error.message.includes('New capacity must be >=') ||
            error.message === 'Event with this title already exists'
        )) {
            return NextResponse.json(
                {error: error.message},
                {status: 400}
            );
        }

        // Database or other errors
        console.error('Error updating event:', error);
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}
