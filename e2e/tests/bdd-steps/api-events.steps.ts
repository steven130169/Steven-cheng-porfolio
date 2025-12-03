import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { request, APIRequestContext } from '@playwright/test';
import { API_URL } from './hooks';

let apiContext: APIRequestContext;
let response: any;
let responseBody: any;

const uniqueTag = `bdd-test-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const seededTitles: string[] = [];

Given('the backend has seeded test events', async function () {
  apiContext = await request.newContext({ baseURL: API_URL });
  seededTitles.length = 0;
  
  const eventsToSeed = [
      { title: `DevOps Days ${uniqueTag}`, date: '2023-09-01', description: 'A tech conference' },
      { title: `Tech Meetup ${uniqueTag}`, date: '2023-10-15', description: 'Monthly gathering' }
  ];

  for (const row of eventsToSeed) {
    const eventData = { ...row, tags: [uniqueTag], status: 'Upcoming', role: 'test' }; 
    const res = await apiContext.post('events', { data: eventData });
    seededTitles.push(eventData.title);
  }
});

Given('the backend has an event with ID {string} and title {string}', async function (id, title) {
    apiContext = await request.newContext({ baseURL: API_URL });
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

Then('the response body should contain the seeded events', async function () {
  expect(Array.isArray(responseBody)).toBeTruthy();
  // Filter events by our unique tag
  const myEvents = responseBody.filter((e: any) => e.tags && e.tags.includes(uniqueTag));
  expect(myEvents.length).toBe(seededTitles.length);
  // Verify titles match
  const myTitles = myEvents.map((e: any) => e.title).sort();
  const expectedTitles = [...seededTitles].sort();
  expect(myTitles).toEqual(expectedTitles);
});

Then('the response body should contain the event with title {string}', async function (title) {
    // For single event fetch, body is object
    expect(responseBody.title).toBe(title);
});

Then('the response body should contain an error message {string}', async function (message) {
    expect(responseBody.message).toBe(message);
});
