import {NextResponse} from 'next/server';
import {getPublishedEvents} from '@/server/services/public-event';


/**
 * Handles GET requests to retrieve published events.
 *
 * Fetches a list of published events from the underlying data source.
 * If successful, returns a JSON response containing the events with an HTTP status of 200.
 * In case of an error, logs the error and returns a JSON response with an error message
 * and an HTTP status of 500.
 *
 * @return {Promise<NextResponse>} A JSON response containing the published events or an error message.
 */
export async function GET(): Promise<NextResponse> {
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
