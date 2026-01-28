import { Given, When, Then } from '@cucumber/cucumber';
import { pageFixture } from './hooks.ts';
import { expect } from '@playwright/test';

/**
 * Event Ticketing BDD Steps
 * Uses real API calls to test reservation flow
 */

// --- Data setup ---
Given(
  'an event {string} exists with total capacity {int} and status {string}',
  async (eventTitle: string, totalCapacity: number, status: string) => {
    const page = pageFixture.page;

    // Create unique title to avoid slug conflicts
    const uniqueTitle = `${eventTitle} ${Date.now()}`;

    // Create event via admin API
    const createResponse = await page.request.post('/api/admin/events', {
      data: {title: uniqueTitle, totalCapacity},
      headers: {'Authorization': `Bearer ${process.env.ADMIN_API_KEY || 'test-admin-key'}`}
    });

    if (!createResponse.ok()) {
      const errorBody = await createResponse.text();
      console.error('API Error Response:', createResponse.status(), errorBody);
    }

    expect(createResponse.ok()).toBeTruthy();
    const createdEvent = await createResponse.json();

    // If status is PUBLISHED, we need to publish the event (requires ticket type first)
    if (status === 'PUBLISHED') {
      // Note: Ticket types will be added in subsequent Background steps
      // Status will be set to PUBLISHED after ticket types are added
      createdEvent.pendingStatus = 'PUBLISHED';
    }

    pageFixture.createdEvent = createdEvent;
    pageFixture.createdEvent.originalTitle = eventTitle;
  }
);

Given(
    'the event has an enabled ticket type {string} with price {int} and allocation {int}',
    async (ticketTypeName: string, price: number, allocation: number) => {
        if (pageFixture.createdEvent?.id) {
            const page = pageFixture.page;
            const event = pageFixture.createdEvent;

            const response = await page.request.post(
                `/api/admin/events/${event.id}/ticket-types`,
                {
                    data: {
                        name: ticketTypeName,
                        price: price,
                        allocation: allocation,
                        enabled: true,
                    },
                    headers: {
                        'Authorization': `Bearer ${process.env.ADMIN_API_KEY || 'test-admin-key'}`,
                    },
                }
            );
            expect(response.ok()).toBeTruthy();
            const ticketType = await response.json();

            if (!pageFixture.createdEvent.ticketTypes) {
                pageFixture.createdEvent.ticketTypes = [];
            }
            pageFixture.createdEvent.ticketTypes.push(ticketType);
        } else if (mockEventData) {
            mockEventData.ticketTypes.push({
                name: ticketTypeName,
                price,
                allocation,
            });
        }
    }
);

Given(
  'the event has an enabled ticket type {string} with price {int} and no allocation',
  async (ticketTypeName: string, price: number) => {
    if (pageFixture.createdEvent?.id) {
      const page = pageFixture.page;
      const event = pageFixture.createdEvent;

      const response = await page.request.post(
        `/api/admin/events/${event.id}/ticket-types`,
        {
          data: {
            name: ticketTypeName,
            price: price,
            allocation: null,
            enabled: true,
          },
          headers: {
            'Authorization': `Bearer ${process.env.ADMIN_API_KEY || 'test-admin-key'}`,
          },
        }
      );
      expect(response.ok()).toBeTruthy();
      const ticketType = await response.json();

      if (!pageFixture.createdEvent.ticketTypes) {
        pageFixture.createdEvent.ticketTypes = [];
      }
      pageFixture.createdEvent.ticketTypes.push(ticketType);

      // If this event should be PUBLISHED and has at least one ticket type, publish it now
      if (event.pendingStatus === 'PUBLISHED') {
        const publishResponse = await page.request.post(
          `/api/admin/events/${event.id}/publish`,
          {headers: {'Authorization': `Bearer ${process.env.ADMIN_API_KEY || 'test-admin-key'}`}}
        );
        expect(publishResponse.ok()).toBeTruthy();
        pageFixture.createdEvent.status = 'PUBLISHED';
        delete pageFixture.createdEvent.pendingStatus;
      }
    }
  }
);

Given(
  'there are {int} active {string} reservations for {string}',
  async (count: number, ticketTypeName: string, _eventTitle: string) => {
    const page = pageFixture.page;
    const event = pageFixture.createdEvent;

    if (!event?.ticketTypes) {
      throw new Error('No ticket types found for event');
    }

    const ticketType = event.ticketTypes.find((tt) => tt.name === ticketTypeName);
    if (!ticketType) {
      throw new Error(`Ticket type "${ticketTypeName}" not found`);
    }

    // Create multiple reservations to simulate existing bookings
    for (let i = 0; i < count; i++) {
      await page.request.post('/api/reservations', {
        data: {
          eventId: Number.parseInt(event.id, 10),
          ticketTypeId: ticketType.id,
          quantity: 1,
          customerEmail: `user${i}@example.com`,
        },
      });
    }
  }
);

Given(
  'I have an active reservation for {int} {string} ticket for {string}',
  async (qty: number, ticketTypeName: string, eventTitle: string) => {
    const page = pageFixture.page;
    const event = pageFixture.createdEvent;

    if (!event?.ticketTypes) {
      throw new Error('No ticket types found for event');
    }

    const ticketType = event.ticketTypes.find((tt) => tt.name === ticketTypeName);
    if (!ticketType) {
      throw new Error(`Ticket type "${ticketTypeName}" not found`);
    }

    const response = await page.request.post('/api/reservations', {
      data: {
        eventId: Number.parseInt(event.id, 10),
        ticketTypeId: ticketType.id,
        quantity: qty,
        customerEmail: 'test@example.com',
      },
    });

    expect(response.ok()).toBeTruthy();
    pageFixture.createdReservation = await response.json();
  }
);

Given(
  'I have an active reservation for {int} {string} tickets for {string}',
  async (_qty: number, _ticketTypeName: string, _eventTitle: string) => {
    // Stub: create reservation in Phase 3.
  }
);

// --- Browse / view ---
When('I browse events', async () => {
  const page = pageFixture.page;

  // Navigate to homepage which contains the events section
  await page.goto('/');

  // Wait for the events section to be visible
  await page.locator('#event').waitFor({ state: 'visible' });
});

When('I view the event {string}', async (_eventTitle: string) => {
  // Stub: open event detail page in Phase 3.
});

Then(
  'I should see ticket type {string} with availability {int}',
  async (_ticketTypeName: string, _availability: number) => {
    // Stub: assert UI availability in Phase 3.
  }
);

// --- Reservation ---
When(
  'I request a reservation for {int} {string} tickets for {string}',
  async (qty: number, ticketTypeName: string, _eventTitle: string) => {
    const page = pageFixture.page;
    const event = pageFixture.createdEvent;

    if (!event?.ticketTypes) {
      throw new Error('No ticket types found for event');
    }

    const ticketType = event.ticketTypes.find((tt) => tt.name === ticketTypeName);
    if (!ticketType) {
      throw new Error(`Ticket type "${ticketTypeName}" not found`);
    }

    const response = await page.request.post('/api/reservations', {
      data: {
        eventId: Number.parseInt(event.id, 10),
        ticketTypeId: ticketType.id,
        quantity: qty,
        customerEmail: 'test@example.com',
      },
    });

    pageFixture.lastResponse = response;
    pageFixture.lastResponseBody = await response.json();

    if (response.ok()) {
      pageFixture.createdReservation = pageFixture.lastResponseBody;
    }
  }
);

When(
  'User A requests a reservation for {int} {string} ticket for {string}',
  async (qty: number, ticketTypeName: string, _eventTitle: string) => {
    const page = pageFixture.page;
    const event = pageFixture.createdEvent;

    if (!event?.ticketTypes) {
      throw new Error('No ticket types found for event');
    }

    const ticketType = event.ticketTypes.find((tt) => tt.name === ticketTypeName);
    if (!ticketType) {
      throw new Error(`Ticket type "${ticketTypeName}" not found`);
    }

    // Store request data for concurrent execution
    if (!pageFixture.concurrentRequests) {
      pageFixture.concurrentRequests = [];
    }

    pageFixture.concurrentRequests.push({
      user: 'A',
      data: {
        eventId: Number.parseInt(event.id, 10),
        ticketTypeId: ticketType.id,
        quantity: qty,
        customerEmail: 'userA@example.com',
      },
    });
  }
);

When(
  'User B requests a reservation for {int} {string} ticket for {string} at the same time',
  async (qty: number, ticketTypeName: string, _eventTitle: string) => {
    const page = pageFixture.page;
    const event = pageFixture.createdEvent;

    if (!event?.ticketTypes) {
      throw new Error('No ticket types found for event');
    }

    const ticketType = event.ticketTypes.find((tt) => tt.name === ticketTypeName);
    if (!ticketType) {
      throw new Error(`Ticket type "${ticketTypeName}" not found`);
    }

    if (!pageFixture.concurrentRequests) {
      pageFixture.concurrentRequests = [];
    }

    pageFixture.concurrentRequests.push({
      user: 'B',
      data: {
        eventId: Number.parseInt(event.id, 10),
        ticketTypeId: ticketType.id,
        quantity: qty,
        customerEmail: 'userB@example.com',
      },
    });

    // Execute all concurrent requests simultaneously
    const results = await Promise.allSettled(
      pageFixture.concurrentRequests.map((req) =>
        page.request.post('/api/reservations', {data: req.data})
      )
    );

    pageFixture.concurrentResults = results;
  }
);

Then('the reservation should be created', async () => {
  const response = pageFixture.lastResponse;
  expect(response.ok()).toBeTruthy();
  expect(pageFixture.createdReservation).toBeDefined();
  expect(pageFixture.createdReservation.status).toBe('ACTIVE');
});

Then('the reservation should expire in {int} minutes', async (minutes: number) => {
  const reservation = pageFixture.createdReservation;
  expect(reservation).toBeDefined();

  const expiresAt = new Date(reservation.expiresAt);
  const now = new Date();
  const expectedExpiry = new Date(now.getTime() + minutes * 60 * 1000);

  // Allow 5-second tolerance
  const diff = Math.abs(expiresAt.getTime() - expectedExpiry.getTime());
  expect(diff).toBeLessThan(5000);
});

Then('only one reservation request should succeed', async () => {
  const results = pageFixture.concurrentResults;
  expect(results).toBeDefined();
  expect(results.length).toBe(2);

  const succeeded = results.filter((r: any) => r.status === 'fulfilled' && r.value.ok());
  const failed = results.filter((r: any) => r.status === 'fulfilled' && !r.value.ok());

  expect(succeeded.length).toBe(1);
  expect(failed.length).toBe(1);
});

Then('the other request should be rejected with error {string}', async (message: string) => {
  const results = pageFixture.concurrentResults;
  const failed = results.filter((r: any) => r.status === 'fulfilled' && !r.value.ok());

  expect(failed.length).toBe(1);
  const errorBody = await failed[0].value.json();
  expect(errorBody.error).toContain(message);
});

Then('the availability for {string} should be {int}', async (_ticketType: string, _avail: number) => {
  // Stub: verify availability in Phase 3.
});

// --- Checkout / payment ---
When('I open the checkout page for my reservation', async () => {
  // Stub: UI page not implemented yet
});

Then('I should see the reservation expiry time', async () => {
  // Stub: UI page not implemented yet
});

When('my payment succeeds for the reservation', async () => {
  const page = pageFixture.page;
  const reservation = pageFixture.createdReservation;

  if (!reservation) {
    throw new Error('No reservation found');
  }

  // Create order from reservation (simulating payment success)
  const response = await page.request.post('/api/orders', {
    data: {
      reservationId: reservation.id,
    },
  });

  pageFixture.lastResponse = response;
  pageFixture.lastResponseBody = await response.json();

  if (response.ok()) {
    pageFixture.createdOrder = pageFixture.lastResponseBody;
  }
});

When('my payment fails for the reservation', async () => {
  // Stub: simulate payment failure
});

Then('an order should be created for {string}', async (_eventTitle: string) => {
  expect(pageFixture.createdOrder).toBeDefined();
  expect(pageFixture.createdOrder.id).toBeDefined();
});

Then('the reservation should be marked as consumed', async () => {
  const page = pageFixture.page;
  const reservation = pageFixture.createdReservation;

  const response = await page.request.get(`/api/reservations/${reservation.id}`);
  expect(response.ok()).toBeTruthy();

  const updatedReservation = await response.json();
  expect(updatedReservation.status).toBe('CONSUMED');
});

Then('the order status should be {string}', async (status: string) => {
  expect(pageFixture.createdOrder.status).toBe(status);
});

Then('I should be allowed to retry payment', async () => {
  // Stub: UI retry flow not implemented yet
});

Then('the reservation should remain active', async () => {
  const page = pageFixture.page;
  const reservation = pageFixture.createdReservation;

  const response = await page.request.get(`/api/reservations/${reservation.id}`);
  expect(response.ok()).toBeTruthy();

  const updatedReservation = await response.json();
  expect(updatedReservation.status).toBe('ACTIVE');
});

// --- Time ---
When('{int} minutes pass', async (_minutes: number) => {
  // Stub
});

Then('the reservation should be expired', async () => {
  // Stub
});

