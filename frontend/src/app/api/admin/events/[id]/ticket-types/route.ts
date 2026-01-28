import {NextRequest, NextResponse} from 'next/server';
import {createTicketTypeSchema} from '@/server/validators/event.schema';
import {createTicketType} from '@/server/services/ticket-type';

/**
 * Handles the creation of a new ticket type for a specific event.
 *
 * @param {NextRequest} request - The incoming HTTP request object containing the body of the request.
 * @param {Object} context - The context object containing route parameters.
 * @param {Promise<{ id: string }>} context.params - A promise resolving to an object with the `id` parameter representing the event ID.
 * @return {Promise<NextResponse>} A JSON response indicating the result of the operation.
 * The response includes the created ticket type on success (status 201), an error message for invalid inputs or failed validations (status 400),
 * or an internal server error message in case of unexpected errors (status 500). Specific error messages are provided for "Event not found" (status 404)
 * or "Allocations exceed total capacity" (status 400).
 */
export async function POST(
    request: NextRequest,
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

        const body = await request.json() as unknown;

        // Validate input
        const validatedData = createTicketTypeSchema.parse(body);

        // Create ticket type using service
        const ticketType = await createTicketType({
            eventId,
            name: validatedData.name,
            price: validatedData.price,
            allocation: validatedData.allocation ?? null,
            enabled: validatedData.enabled,
        });

        return NextResponse.json(ticketType, {status: 201});
    } catch (error) {
        // Zod validation error
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                {error: 'Validation failed', details: error},
                {status: 400}
            );
        }

        // Service layer errors (Event not found, Allocations exceed total capacity)
        if (error instanceof Error) {
            if (error.message === 'Event not found') {
                return NextResponse.json(
                    {error: error.message},
                    {status: 404}
                );
            }

            if (error.message === 'Allocations exceed total capacity') {
                return NextResponse.json(
                    {error: error.message},
                    {status: 400}
                );
            }
        }

        // Database or other errors
        console.error('Error creating ticket type:', error);
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}
