import {NextRequest, NextResponse} from 'next/server';
import {getPayload} from 'payload';
import config from '@payload-config';

/**
 * POST /api/orders
 * Creates an order from an existing reservation (simulates payment completion).
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { reservationId: string };
        const payload = await getPayload({config});

        // Get reservation
        const reservation = await payload.findByID({
            collection: 'reservations',
            id: body.reservationId,
        });

        if (!reservation) {
            return NextResponse.json(
                {error: 'Reservation not found'},
                {status: 404}
            );
        }

        // Check if reservation is already consumed or expired
        if (reservation.status === 'CONSUMED' || reservation.status === 'EXPIRED') {
            return NextResponse.json(
                {error: 'Reservation already consumed or expired'},
                {status: 400}
            );
        }

        // Check if reservation time has passed
        const now = new Date();
        if (new Date(reservation.expiresAt) < now) {
            return NextResponse.json(
                {error: 'Reservation has expired'},
                {status: 400}
            );
        }

        // Get event to find ticket type price
        const eventId: string = typeof reservation.event === 'string'
            ? reservation.event
            : String((reservation.event as { id: string }).id);

        const event = await payload.findByID({
            collection: 'events',
            id: eventId,
        });

        if (!event) {
            return NextResponse.json(
                {error: 'Event not found'},
                {status: 404}
            );
        }

        // Find ticket type price
        type TicketType = {
            name: string;
            price: number;
            allocation?: number;
            enabled?: boolean;
        };
        const ticketType = (event.ticketTypes as TicketType[] | undefined)?.find(
            (tt) => tt.name === reservation.ticketTypeName
        );

        if (!ticketType) {
            return NextResponse.json(
                {error: 'Ticket type not found'},
                {status: 404}
            );
        }

        // Create order
        const order = await payload.create({
            collection: 'orders',
            data: {
                customerEmail: reservation.customerEmail,
                items: [
                    {
                        event: eventId,
                        ticketTypeName: reservation.ticketTypeName,
                        quantity: reservation.quantity,
                        price: ticketType.price,
                    },
                ],
                status: 'pending',
                // totalAmount will be auto-calculated by Payload hook
            },
        });

        // Mark reservation as consumed
        await payload.update({
            collection: 'reservations',
            id: body.reservationId,
            data: {
                status: 'CONSUMED',
            },
        });

        return NextResponse.json(order, {status: 201});
    } catch (error) {
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
