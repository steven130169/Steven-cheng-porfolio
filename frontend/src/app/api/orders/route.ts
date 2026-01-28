import {NextRequest, NextResponse} from 'next/server';
import {createOrderFromReservation} from '@/server/services/order';

/**
 * POST /api/orders
 * Creates an order from an existing reservation (simulates payment completion).
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { reservationId: number };

        const order = await createOrderFromReservation(body.reservationId);

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
