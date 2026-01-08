import {NextRequest, NextResponse} from 'next/server';
import {createTicketTypeSchema} from '@/server/validators/event.schema';
import {createTicketType} from '@/server/services/ticket-type';

/**
 * POST /api/admin/events/:id/ticket-types
 * Add a ticket type to an event
 */
export async function POST(
    request: NextRequest,
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
