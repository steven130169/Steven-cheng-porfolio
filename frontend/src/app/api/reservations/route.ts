import {NextRequest, NextResponse} from 'next/server';
import {getPayload} from 'payload';
import config from '@payload-config';
import {ZodError, z} from 'zod';

const createReservationSchema = z.object({
    eventId: z.string(),
    ticketTypeName: z.string(),
    quantity: z.number().int().positive(),
    customerEmail: z.email(),
});

/**
 * POST /api/reservations
 * Creates a new reservation for an event ticket type.
 *
 * Note: Inventory checking is performed here to prevent race conditions.
 * Payload hooks handle auto-expiry (15 minutes).
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as unknown;
        const validatedData = createReservationSchema.parse(body);

        const payload = await getPayload({config});

        // Get event with ticket types
        const event = await payload.findByID({
            collection: 'events',
            id: validatedData.eventId,
        });

        if (!event) {
            return NextResponse.json(
                {error: 'Event not found'},
                {status: 404}
            );
        }

        // Find the ticket type
        type TicketType = {
            name: string;
            price: number;
            allocation?: number;
            enabled?: boolean;
        };
        const ticketType = (event.ticketTypes as TicketType[] | undefined)?.find(
            (tt) => tt.name === validatedData.ticketTypeName && tt.enabled
        );

        if (!ticketType) {
            return NextResponse.json(
                {error: 'Ticket type not found or not enabled'},
                {status: 404}
            );
        }

        // Check inventory
        const {docs: activeReservations} = await payload.find({
            collection: 'reservations',
            where: {
                and: [
                    {event: {equals: validatedData.eventId}},
                    {ticketTypeName: {equals: validatedData.ticketTypeName}},
                    {status: {equals: 'ACTIVE'}},
                    {expiresAt: {greater_than: new Date().toISOString()}},
                ],
            },
        });

        const totalReserved = activeReservations.reduce(
            (sum, r) => sum + (r.quantity || 0),
            0
        );

        const capacity = ticketType.allocation ?? event.totalCapacity;
        const available = Math.max(0, capacity - totalReserved);

        if (available < validatedData.quantity) {
            return NextResponse.json(
                {error: 'Insufficient Inventory', available},
                {status: 400}
            );
        }

        // Create reservation
        const reservation = await payload.create({
            collection: 'reservations',
            data: {
                event: validatedData.eventId,
                ticketTypeName: validatedData.ticketTypeName,
                quantity: validatedData.quantity,
                customerEmail: validatedData.customerEmail,
                status: 'ACTIVE',
                // expiresAt will be auto-set by Payload hook
            },
        });

        return NextResponse.json(reservation, {status: 201});
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {error: 'Validation failed', details: error.issues},
                {status: 400}
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                {error: error.message},
                {status: 400}
            );
        }

        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}
