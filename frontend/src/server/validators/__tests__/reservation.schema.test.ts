import { describe, it, expect } from 'vitest';
import { createReservationSchema } from '../reservation.schema';

describe('createReservationSchema', () => {
  it('should validate valid reservation input', () => {
    const input = {
      eventId: 1,
      ticketTypeId: 1,
      quantity: 2,
      customerEmail: 'test@example.com',
    };
    
    expect(() => createReservationSchema.parse(input)).not.toThrow();
  });

  it('should reject invalid email', () => {
    const input = {
      eventId: 1,
      ticketTypeId: 1,
      quantity: 2,
      customerEmail: 'invalid-email',
    };
    
    expect(() => createReservationSchema.parse(input)).toThrow();
  });

  it('should reject quantity <= 0', () => {
    const input = {
      eventId: 1,
      ticketTypeId: 1,
      quantity: 0,
      customerEmail: 'test@example.com',
    };
    
    expect(() => createReservationSchema.parse(input)).toThrow();
  });

  it('should reject quantity > 10', () => {
    const input = {
      eventId: 1,
      ticketTypeId: 1,
      quantity: 11,
      customerEmail: 'test@example.com',
    };
    
    expect(() => createReservationSchema.parse(input)).toThrow();
  });
});
