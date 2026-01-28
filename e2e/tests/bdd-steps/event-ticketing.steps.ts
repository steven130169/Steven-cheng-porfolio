import { Given, When, Then } from '@cucumber/cucumber';
import { pageFixture } from './hooks.ts';
import { expect } from '@playwright/test';

/**
 * Event Ticketing BDD Steps
 * Uses Playwright route mocking to intercept API calls
 */

// Store mock data in World context
interface EventData {
  id: string;
  title: string;
  totalCapacity: number;
  status: string;
  ticketTypes: Array<{
    name: string;
    price: number;
    allocation: number | null;
  }>;
}

export let mockEventData: EventData | null = null;

// --- Data setup ---
Given(
  'an event {string} exists with total capacity {int} and status {string}',
  async (eventTitle: string, totalCapacity: number, status: string) => {
    mockEventData = {
      id: '1',
      title: eventTitle,
      totalCapacity,
      status,
      ticketTypes: [],
    };
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
    if (mockEventData) {
      mockEventData.ticketTypes.push({
        name: ticketTypeName,
        price,
        allocation: null,
      });
    }
  }
);

Given(
  'there are {int} active {string} reservations for {string}',
  async (_count: number, _ticketTypeName: string, _eventTitle: string) => {
    // Stub: seed reservations in Phase 3.
  }
);

Given(
  'I have an active reservation for {int} {string} ticket for {string}',
  async (_qty: number, _ticketTypeName: string, _eventTitle: string) => {
    // Stub: create reservation in Phase 3.
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

  // Mock the /api/events endpoint
  await page.route('**/api/events', async (route) => {
    if (route.request().method() === 'GET') {
      const events = mockEventData ? [
        {
          id: mockEventData.id,
          title: mockEventData.title,
          role: 'Conference',
          date: '2025',
          description: `A ${mockEventData.status.toLowerCase()} event with ${mockEventData.totalCapacity} capacity`,
          tags: ['Tech'],
          status: mockEventData.status,
        }
      ] : [];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(events),
      });
    } else {
      await route.continue();
    }
  });

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
  async (_qty: number, _ticketTypeName: string, _eventTitle: string) => {
    // Stub: call reservation endpoint in Phase 3.
    // Set mock response so shared Then steps don't crash
    pageFixture.lastResponse = { ok: () => false, status: () => 400 };
    pageFixture.lastResponseBody = { error: 'Insufficient Inventory' };
  }
);

When(
  'User A requests a reservation for {int} {string} ticket for {string}',
  async (_qty: number, _ticketTypeName: string, _eventTitle: string) => {
    // Stub: concurrency test in Phase 3.
  }
);

When(
  'User B requests a reservation for {int} {string} ticket for {string} at the same time',
  async (_qty: number, _ticketTypeName: string, _eventTitle: string) => {
    // Stub: concurrency test in Phase 3.
  }
);

Then('the reservation should be created', async () => {
  // Stub: verify reservation exists in Phase 3.
});

Then('the reservation should expire in {int} minutes', async (_minutes: number) => {
  // Stub: verify expiresAt in Phase 3.
});

Then('only one reservation request should succeed', async () => {
  // Stub: verify concurrency behavior in Phase 3.
});

Then('the other request should be rejected with error {string}', async (_message: string) => {
  // Stub: verify failure in Phase 3.
});

Then('the availability for {string} should be {int}', async (_ticketType: string, _avail: number) => {
  // Stub: verify availability in Phase 3.
});

// --- Checkout / payment ---
When('I open the checkout page for my reservation', async () => {
  // Stub
});

Then('I should see the reservation expiry time', async () => {
  // Stub
});

When('my payment succeeds for the reservation', async () => {
  // Stub
});

When('my payment fails for the reservation', async () => {
  // Stub
});

Then('an order should be created for {string}', async (_eventTitle: string) => {
  // Stub
});

Then('the reservation should be marked as consumed', async () => {
  // Stub
});

Then('the order status should be {string}', async (_status: string) => {
  // Stub
});

Then('I should be allowed to retry payment', async () => {
  // Stub
});

Then('the reservation should remain active', async () => {
  // Stub
});

// --- Time ---
When('{int} minutes pass', async (_minutes: number) => {
  // Stub
});

Then('the reservation should be expired', async () => {
  // Stub
});

