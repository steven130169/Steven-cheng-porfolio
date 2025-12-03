Feature: Events API
  As a public user
  I want to retrieve event information
  So that I can see what events are available

  Scenario: Retrieve all events
    Given the backend has seeded test events
    When I make a GET request to "/events"
    Then the response status code should be 200
    And the response body should contain the seeded events

  Scenario: Retrieve a single event by ID
    Given the backend has an event with ID "1" and title "DevOps Days"
    When I make a GET request to "/events/1"
    Then the response status code should be 200
    And the response body should contain the event with title "DevOps Days"

  Scenario: Handle non-existent event
    When I make a GET request to "/events/999"
    Then the response status code should be 404
    And the response body should contain an error message "Event not found"
