import {NextRequest, NextResponse} from 'next/server';
import {createReservation} from '@/server/services/reservation';
import {ZodError} from 'zod';

/**
 * POST /api/reservations
 * Creates a new reservation for an event ticket type.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as unknown;
        const reservation = await createReservation(body as {
            eventId: number;
            ticketTypeId: number;
            quantity: number;
            customerEmail: string;
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
            // Business logic errors (e.g., "Insufficient Inventory")
            return NextResponse.json(
                {error: error.message},
                {status: 400}
            );
        }

        // Unexpected errors
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}
