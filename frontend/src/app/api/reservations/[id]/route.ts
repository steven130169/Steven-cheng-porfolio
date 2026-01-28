import {NextRequest, NextResponse} from 'next/server';
import {getReservationById} from '@/server/services/reservation';

/**
 * GET /api/reservations/[id]
 * Retrieves a reservation by its ID.
 */
export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    try {
        const {id} = await params;
        const reservationId = Number.parseInt(id, 10);

        if (Number.isNaN(reservationId)) {
            return NextResponse.json(
                {error: 'Invalid reservation ID'},
                {status: 400}
            );
        }

        const reservation = await getReservationById(reservationId);

        if (!reservation) {
            return NextResponse.json(
                {error: 'Reservation not found'},
                {status: 404}
            );
        }

        return NextResponse.json(reservation, {status: 200});
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                {error: error.message},
                {status: 500}
            );
        }

        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}
