import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { request, APIRequestContext } from '@playwright/test';
import { API_URL } from './hooks';

let apiContext: APIRequestContext;
let response: any;
let responseBody: any;

// Store events added by Given steps for later retrieval
const seededEvents: any[] = [];

Given('the backend has the following events:', async function (dataTable) {
  apiContext = await request.newContext({ baseURL: API_URL });
  await apiContext.delete('events/test/reset'); // Ensure backend is clean
  seededEvents.length = 0; // Clear previous seeds (client side)
  for (const row of dataTable.hashes()) {
    const eventData = { ...row, tags: ['test'], status: 'Upcoming', role: 'test' }; 
    const res = await apiContext.post('events', { data: eventData });
    const createdEvent = await res.json();
    seededEvents.push(createdEvent);
  }
});

Given('the backend has an event with ID {string} and title {string}', async function (id, title) {
    apiContext = await request.newContext({ baseURL: API_URL });
    // Ensure all required fields for Event interface are present
    const eventData = { title, role: 'test', date: '2024-01-01', description: 'test', tags: ['test'], status: 'Upcoming' };
    await apiContext.post('events', { data: eventData });
});

When('I make a GET request to {string}', async function (endpoint) {
  apiContext = await request.newContext({ baseURL: API_URL });
  const sanitizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  response = await apiContext.get(sanitizedEndpoint);
  try {
      responseBody = await response.json();
  } catch (e) {
      responseBody = null;
  }
});

Then('the response status code should be {int}', async function (statusCode) {
  expect(response.status()).toBe(statusCode);
});

Then('the response body should contain {int} events', async function (count) {
  expect(Array.isArray(responseBody)).toBeTruthy();
  expect(responseBody.length).toBe(count);
});

Then('the first event title should be {string}', async function (title) {
  expect(responseBody[0].title).toBe(title);
});

Then('the response body should contain the event with title {string}', async function (title) {
    expect(responseBody.title).toBe(title);
});

Then('the response body should contain an error message {string}', async function (message) {
    expect(responseBody.message).toBe(message);
});