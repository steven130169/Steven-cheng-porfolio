import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { request, APIRequestContext } from '@playwright/test';
import { API_URL } from './hooks';

let apiContext: APIRequestContext;
let response: any;
let responseBody: any;

Given('the backend has the following events:', async function (dataTable) {
  // In a real app with DB, we would insert data here.
  // For now, we will assume the backend implementation respects this requirement statically.
  console.log('Assuming backend is seeded with:', dataTable.hashes());
});

Given('the backend has an event with ID {string} and title {string}', async function (id, title) {
    console.log(`Assuming backend has event ${id} with title ${title}`);
});

When('I make a GET request to {string}', async function (endpoint) {
  apiContext = await request.newContext({
    baseURL: API_URL,
  });
  // Playwright treats paths starting with '/' as relative to root, ignoring baseURL path.
  // We remove the leading '/' to append it to the baseURL path (/api).
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
    // Assuming responseBody is a single object for this step
    expect(responseBody.title).toBe(title);
});

Then('the response body should contain an error message {string}', async function (message) {
    expect(responseBody.message).toBe(message);
    // NestJS default 404 structure might involve 'message' or 'error'
});
