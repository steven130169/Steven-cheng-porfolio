import {NextResponse} from 'next/server';
import {getPublishedEvents} from '@/server/services/public-event';

/**
 * GET /api/events
 * Public endpoint - returns only published events
 */
export async function GET() {
    try {
        const publishedEvents = await getPublishedEvents();

        return NextResponse.json(publishedEvents, {status: 200});
    } catch (error) {
        console.error('Error fetching published events:', error);
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}
