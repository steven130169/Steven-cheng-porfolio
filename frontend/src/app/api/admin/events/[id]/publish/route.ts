import {NextRequest, NextResponse} from 'next/server';
import {publishEvent} from '@/server/services/event';

/**
 * Handles the POST request to publish an event.
 *
 * @param {_request} _request - The incoming request object.
 * @param {Object} options - An object containing the route parameters.
 * @param {Promise<{ id: string }>} options.params - A promise resolving to an object with the route parameter `id`.
 * @return {Promise<NextResponse>} A response containing the event publishing status or an error message.
 */
export async function POST(
    _request: NextRequest,
    {params}: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const {id} = await params;
        const eventId = Number.parseInt(id, 10);

        if (Number.isNaN(eventId)) {
            return NextResponse.json(
                {error: 'Invalid event ID'},
                {status: 400}
            );
        }

        const event = await publishEvent(eventId);

        return NextResponse.json(
            {
                id: event.id,
                status: event.status,
                publishedAt: event.updatedAt,
            },
            {status: 200}
        );
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Event not found') {
                return NextResponse.json(
                    {error: error.message},
                    {status: 404}
                );
            }

            if (error.message === 'At least one enabled ticket type is required') {
                return NextResponse.json(
                    {error: error.message},
                    {status: 400}
                );
            }
        }

        console.error('Error publishing event:', error);
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}
