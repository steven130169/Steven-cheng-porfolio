import { Given, When, Then } from '@cucumber/cucumber';

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
  async (_eventTitle: string, _status: string, _totalCapacity: number) => {
    // Stub: create/seed event in Phase 3.
  }
);

Then(
  'the event {string} should be created with status {string}',
  async (_eventTitle: string, _status: string) => {
    // Stub: verify event state in Phase 3.
  }
);

Then(
  'the event {string} should have total capacity {int}',
  async (_eventTitle: string, _totalCapacity: number) => {
    // Stub: verify event capacity in Phase 3.
  }
);

Then(
  'the event {string} should have status {string}',
  async (_eventTitle: string, _status: string) => {
    // Stub: verify event status in Phase 3.
  }
);

Then(
  'the event {string} should remain in status {string}',
  async (_eventTitle: string, _status: string) => {
    // Stub: verify no status change in Phase 3.
  }
);

Then(
  'I should be redirected to the event edit page for {string}',
  async (_eventTitle: string) => {
    // Stub: verify navigation in Phase 3.
  }
);

// --- Ticket types ---
Given(
  'the event has an enabled ticket type {string} with price {int} and allocation {int}',
  async (_ticketTypeName: string, _price: number, _allocation: number) => {
    // Stub: create ticket type in Phase 3.
  }
);

Given('the event has no enabled ticket types', async () => {
  // Stub: ensure no enabled ticket types in Phase 3.
});

When(
  'I add an enabled ticket type {string} with price {int} and allocation {int} to {string}',
  async (_ticketTypeName: string, _price: number, _allocation: number, _eventTitle: string) => {
    // Stub: add ticket type in Phase 3.
  }
);

When(
  'I add an enabled ticket type {string} with price {int} and no allocation to {string}',
  async (_ticketTypeName: string, _price: number, _eventTitle: string) => {
    // Stub: add ticket type in Phase 3.
  }
);

Then(
  'the event {string} should have ticket type {string} with allocation {int}',
  async (_eventTitle: string, _ticketTypeName: string, _allocation: number) => {
    // Stub: verify ticket type allocation in Phase 3.
  }
);

Then(
  'the event {string} should have ticket type {string} with no allocation',
  async (_eventTitle: string, _ticketTypeName: string) => {
    // Stub: verify ticket type without allocation in Phase 3.
  }
);

Then(
  'the event {string} should not include ticket type {string}',
  async (_eventTitle: string, _ticketTypeName: string) => {
    // Stub: verify ticket type absence in Phase 3.
  }
);

// --- Publishing ---
When('I publish the event {string}', async (_eventTitle: string) => {
  // Stub: publish event in Phase 3.
});

// --- Generic requests/errors ---
Then('the request should be rejected with error {string}', async (_message: string) => {
  // Stub: verify error response in Phase 3.
});

// --- Customer browse visibility ---
When('a customer browses events', async () => {
  // Stub: browse published events in Phase 3.
});

Then('the customer should see {string}', async (_eventTitle: string) => {
  // Stub: verify event visible in Phase 3.
});

Then('the customer should not see {string}', async (_eventTitle: string) => {
  // Stub: verify event hidden in Phase 3.
});

// --- Creation / update actions ---
When(
  'I create an event with title {string} and total capacity {int}',
  async (_title: string, _totalCapacity: number) => {
    // Stub: create event in Phase 3.
  }
);

When(
  'I update the total capacity for {string} to {int}',
  async (_eventTitle: string, _totalCapacity: number) => {
    // Stub: update event total capacity in Phase 3.
  }
);
