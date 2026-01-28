import {NextRequest, NextResponse} from 'next/server';
import {createEventSchema} from '@/server/validators/event.schema';
import {createDraftEvent} from '@/server/services/event';


/**
 * Handles the HTTP POST request for creating a new draft event.
 *
 * This method parses the incoming request body, validates the input against a defined schema,
 * and attempts to create a draft event. It returns appropriate responses based on the outcome
 * of the operation, including validation and server errors.
 *
 * @param {NextRequest} request - The request object containing the HTTP POST data.
 * @return {Promise<NextResponse>} A response object with the status and payload:
 * - 201: Contains the successfully created draft event data.
 * - 400: Contains error details for validation or duplicate event title issues.
 * - 500: Contains a generic error message for unexpected server issues.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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
