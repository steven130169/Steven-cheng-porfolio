Feature: Event Ticketing Engine

  Background:
    Given the event "Tech Conf 2025" exists with ID "evt_123"
    And the ticket type "Early Bird" has 10 remaining seats

  Scenario: User successfully adds tickets to cart (Inventory Check)
    When I request to add 2 "Early Bird" tickets to my cart
    Then the system should lock 2 tickets temporarily
    And the ticket inventory for "Early Bird" should be 8
    And my cart should contain 2 "Early Bird" tickets

  Scenario: User tries to buy more tickets than available (Overselling Protection)
    When I request to add 15 "Early Bird" tickets to my cart
    Then the system should reject the request with error "Insufficient Inventory"
    And the ticket inventory for "Early Bird" should remain 10

  Scenario: Concurrent users compete for last ticket (Race Condition)
    Given the ticket type "VIP" has 1 remaining seat
    When User A requests to add 1 "VIP" ticket
    And User B requests to add 1 "VIP" ticket simultaneously
    Then only one user should succeed
    And the other user should receive "Insufficient Inventory" error
