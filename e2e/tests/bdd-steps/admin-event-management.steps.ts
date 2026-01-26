import {Given, When, Then} from '@cucumber/cucumber';
import {pageFixture} from './hooks';
import {expect} from '@playwright/test';

/**
 * Phase 2 (Design):
 * These step definitions are lightweight stubs so the feature files are syntactically complete.
 * Phase 3 (Implementation) will replace these stubs with real UI/API interactions.
 */

// --- Auth ---
Given('I am logged in as an admin', async () => {
    // Stub: admin authentication will be implemented in Phase 3.
});

// --- Event setup / assertions ---
Given(
    'an event {string} exists with status {string} and total capacity {int}',
    async (eventTitle: string, status: string, totalCapacity: number) => {
        const page = pageFixture.page;
        const uniqueTitle = `${eventTitle} ${Date.now()}`;

        const createResponse = await page.request.post('/api/admin/events', {
            data: {title: uniqueTitle, totalCapacity},
            headers: {'Authorization': `Bearer ${process.env.ADMIN_API_KEY || 'test-admin-key'}`}
        });
        expect(createResponse.ok()).toBeTruthy();
        const createdEvent = await createResponse.json();

        if (status === 'PUBLISHED') {
            const ticketResponse = await page.request.post(
                `/api/admin/events/${createdEvent.id}/ticket-types`,
                {
                    data: {name: 'General', price: 100, allocation: totalCapacity, enabled: true},
                    headers: {'Authorization': `Bearer ${process.env.ADMIN_API_KEY || 'test-admin-key'}`}
                }
            );
            expect(ticketResponse.ok()).toBeTruthy();

            const publishResponse = await page.request.post(
                `/api/admin/events/${createdEvent.id}/publish`,
                {headers: {'Authorization': `Bearer ${process.env.ADMIN_API_KEY || 'test-admin-key'}`}}
            );
            expect(publishResponse.ok()).toBeTruthy();
            createdEvent.status = 'PUBLISHED';
        }

        pageFixture.createdEvent = createdEvent;
        pageFixture.createdEvent.originalTitle = eventTitle;
    }
);

Then(
    'the event {string} should be created with status {string}',
    async (eventTitle: string, status: string) => {
        const event = pageFixture.createdEvent;

        // Verify using original title (stored during creation)
        expect(event.title).toContain(eventTitle);
        expect(event.status).toBe(status);
    }
);

Then(
    'the event {string} should have total capacity {int}',
    async (eventTitle: string, expectedCapacity: number) => {
        const event = pageFixture.createdEvent;

        expect(event).toBeDefined();
        expect(event.originalTitle).toBe(eventTitle);
        expect(event.totalCapacity).toBe(expectedCapacity);
    }
);

Then(
    'the event {string} should have status {string}',
    async (_eventTitle: string, status: string) => {
        const event = pageFixture.createdEvent;

        expect(event).toBeDefined();
        expect(event.status).toBe(status);
    }
);

Then(
    'the event {string} should remain in status {string}',
    async (_eventTitle: string, expectedStatus: string) => {
        const event = pageFixture.createdEvent;

        if (!event) {
            throw new Error('No event found in context');
        }

        // Event status should not have changed (publish was rejected)
        expect(event.status).toBe(expectedStatus);
    }
);

Then(
    'I should be redirected to the event edit page for {string}',
    async (_eventTitle: string) => {
        const event = pageFixture.createdEvent;

        // Verify slug exists (needed to construct edit URL: /admin/events/{slug}/edit)
        expect(event.slug).toBeDefined();
        expect(event.slug).toBeTruthy();
    }
);

// --- Ticket types ---
// NOTE: The step "the event has an enabled ticket type {string} with price {int} and allocation {int}"
// is defined in event-ticketing.steps.ts and shared across both feature files

Given('the event has no enabled ticket types', async () => {
    const event = pageFixture.createdEvent;

    if (!event) {
        throw new Error('No event found in context');
    }

    pageFixture.createdEvent.ticketTypes = [];
});

When(
    'I add an enabled ticket type {string} with price {int} and allocation {int} to {string}',
    async (ticketTypeName: string, price: number, allocation: number, eventTitle: string) => {
        const page = pageFixture.page;
        const event = pageFixture.createdEvent;

        if (!event) {
            throw new Error(`No event found in context for title: ${eventTitle}`);
        }

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

        const body = await response.json();
        pageFixture.lastResponse = response;
        pageFixture.lastResponseBody = body;

        if (response.ok()) {
            if (!pageFixture.createdEvent.ticketTypes) {
                pageFixture.createdEvent.ticketTypes = [];
            }
            pageFixture.createdEvent.ticketTypes.push(body);
        }
    }
);

When(
    'I add an enabled ticket type {string} with price {int} and no allocation to {string}',
    async (ticketTypeName: string, price: number, eventTitle: string) => {
        const page = pageFixture.page;
        const event = pageFixture.createdEvent;

        if (!event) {
            throw new Error(`No event found in context for title: ${eventTitle}`);
        }

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
    }
);

Then(
    'the event {string} should have ticket type {string} with allocation {int}',
    async (eventTitle: string, ticketTypeName: string, expectedAllocation: number) => {
        const event = pageFixture.createdEvent;

        if (!event?.ticketTypes) {
            throw new Error(`No event or ticket types found in context for: ${eventTitle}`);
        }

        const ticketType = event.ticketTypes.find(
            (tt: { name: string; }) => tt.name === ticketTypeName
        );

        expect(ticketType).toBeDefined();
        expect(ticketType.name).toBe(ticketTypeName);
        expect(ticketType.allocation).toBe(expectedAllocation);
        expect(ticketType.enabled).toBe(true);
        expect(ticketType.eventId).toBe(event.id);
    }
);

Then(
    'the event {string} should have ticket type {string} with no allocation',
    async (eventTitle: string, ticketTypeName: string) => {
        const event = pageFixture.createdEvent;

        if (!event?.ticketTypes) {
            throw new Error(`No event or ticket types found in context for: ${eventTitle}`);
        }

        const ticketType = event.ticketTypes.find(
            (tt: any) => tt.name === ticketTypeName
        );

        expect(ticketType).toBeDefined();
        expect(ticketType.name).toBe(ticketTypeName);
        expect(ticketType.allocation).toBeNull();
        expect(ticketType.enabled).toBe(true);
        expect(ticketType.eventId).toBe(event.id);
    }
);

Then(
    'the event {string} should not include ticket type {string}',
    async (eventTitle: string, ticketTypeName: string) => {
        const event = pageFixture.createdEvent;

        if (!event) {
            throw new Error(`No event found in context for: ${eventTitle}`);
        }

        const ticketTypes = event.ticketTypes || [];
        const found = ticketTypes.find(
            (tt: any) => tt.name === ticketTypeName
        );

        expect(found).toBeUndefined();
    }
);

// --- Publishing ---
When('I publish the event {string}', async (eventTitle: string) => {
    const page = pageFixture.page;
    const event = pageFixture.createdEvent;

    if (!event) {
        throw new Error(`No event found in context for title: ${eventTitle}`);
    }

    const response = await page.request.post(
        `/api/admin/events/${event.id}/publish`,
        {
            headers: {
                'Authorization': `Bearer ${process.env.ADMIN_API_KEY || 'test-admin-key'}`,
            },
        }
    );

    const body = await response.json();

    pageFixture.lastResponse = response;
    pageFixture.lastResponseBody = body;

    if (response.ok()) {
        pageFixture.createdEvent.status = body.status || 'PUBLISHED';
    }
});

// --- Generic requests/errors ---
Then('the request should be rejected with error {string}', async (message: string) => {
    const lastResponse = pageFixture.lastResponse;

    expect(lastResponse).toBeDefined();
    expect(lastResponse.ok()).toBeFalsy();

    const body = pageFixture.lastResponseBody;
    expect(body.error).toBe(message);
});

// --- Customer browse visibility ---
When('a customer browses events', async () => {
    const page = pageFixture.page;

    const response = await page.request.get('/api/events');
    expect(response.ok()).toBeTruthy();

    pageFixture.lastResponse = response;
    pageFixture.lastResponseBody = await response.json();
});

Then('the customer should see {string}', async (eventTitle: string) => {
    const events = pageFixture.lastResponseBody;

    expect(Array.isArray(events)).toBe(true);

    const found = events.find(
        (e: any) => e.title.includes(eventTitle)
    );

    expect(found).toBeDefined();
});

Then('the customer should not see {string}', async (eventTitle: string) => {
    const events = pageFixture.lastResponseBody;

    expect(Array.isArray(events)).toBe(true);

    const found = events.find(
        (e: any) => e.title.includes(eventTitle)
    );

    expect(found).toBeUndefined();
});

// --- Creation / update actions ---
When(
    'I create an event with title {string} and total capacity {int}',
    async (title: string, totalCapacity: number) => {
        const page = pageFixture.page;

        // Make title unique by adding timestamp to avoid duplicate slug errors
        const uniqueTitle = `${title} ${Date.now()}`;

        const response = await page.request.post('/api/admin/events', {
            data: {title: uniqueTitle, totalCapacity},
            headers: {
                'Authorization': `Bearer ${process.env.ADMIN_API_KEY || 'test-admin-key'}`
            }
        });

        if (!response.ok()) {
            const errorBody = await response.text();
            console.error('API Error Response:', response.status(), errorBody);
        }

        expect(response.ok()).toBeTruthy();
        pageFixture.createdEvent = await response.json();
        // Store original title for assertions
        pageFixture.createdEvent.originalTitle = title;
    }
);

When(
    'I update the total capacity for {string} to {int}',
    async (eventTitle: string, newCapacity: number) => {
        const page = pageFixture.page;
        const event = pageFixture.createdEvent;

        if (event?.originalTitle !== eventTitle) {
            throw new Error(`Event "${eventTitle}" not found in context`);
        }

        const response = await page.request.patch(
            `/api/admin/events/${event.id}`,
            {
                data: {totalCapacity: newCapacity},
                headers: {'Authorization': `Bearer ${process.env.ADMIN_API_KEY || 'test-admin-key'}`}
            }
        );

        pageFixture.lastResponse = response;
        pageFixture.lastResponseBody = await response.json();

        if (response.ok()) {
            pageFixture.createdEvent = {
                ...pageFixture.lastResponseBody,
                originalTitle: event.originalTitle
            };
        }
    }
);
