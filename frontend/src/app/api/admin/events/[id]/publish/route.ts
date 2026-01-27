import {NextRequest, NextResponse} from 'next/server';
import {publishEvent} from '@/server/services/event';

/**
 * POST /api/admin/events/:id/publish
 * Publish an event (change status from DRAFT to PUBLISHED)
 */
export async function POST(
    _request: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
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
