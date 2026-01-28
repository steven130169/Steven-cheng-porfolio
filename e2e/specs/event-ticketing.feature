Feature: Event Ticketing Engine
  As a customer
  I want to reserve and buy event tickets
  So that I can attend events without overselling issues

  Background:
    Given an event "Tech Conf 2025" exists with total capacity 10 and status "PUBLISHED"
    And the event has an enabled ticket type "Early Bird" with price 100 and allocation 10
    And the event has an enabled ticket type "General" with price 150 and no allocation

  Scenario: Browse upcoming events
    When I browse events
    Then I should see "Tech Conf 2025"

  Scenario: View ticket types and current availability
    When I view the event "Tech Conf 2025"
    Then I should see ticket type "Early Bird" with availability 10
    And I should see ticket type "General" with availability 10

  Scenario: Reserve tickets at checkout (soft lock)
    When I request a reservation for 2 "Early Bird" tickets for "Tech Conf 2025"
    Then the reservation should be created
    And the reservation should expire in 15 minutes
    And the availability for "Early Bird" should be 8
    And the availability for "General" should be 8

  Scenario: Reject reservation when requested quantity exceeds availability (insufficient inventory)
    Given there are 9 active "Early Bird" reservations for "Tech Conf 2025"
    When I request a reservation for 2 "Early Bird" tickets for "Tech Conf 2025"
    Then the request should be rejected with error "Insufficient Inventory"

  Scenario: Concurrent reservations compete for the last ticket (no overselling)
    Given there are 9 active "Early Bird" reservations for "Tech Conf 2025"
    When User A requests a reservation for 1 "Early Bird" ticket for "Tech Conf 2025"
    And User B requests a reservation for 1 "Early Bird" ticket for "Tech Conf 2025" at the same time
    Then only one reservation request should succeed
    And the other request should be rejected with error "Insufficient Inventory"

  Scenario: Show reservation timer during checkout
    Given I have an active reservation for 1 "Early Bird" ticket for "Tech Conf 2025"
    When I open the checkout page for my reservation
    Then I should see the reservation expiry time

  Scenario: Complete payment and receive confirmation (ticket issued)
    Given I have an active reservation for 1 "Early Bird" ticket for "Tech Conf 2025"
    When my payment succeeds for the reservation
    Then an order should be created for "Tech Conf 2025"
    And the reservation should be marked as consumed
    And the order status should be "pending"

  Scenario: Payment failure allows retry while reservation is still active
    Given I have an active reservation for 1 "Early Bird" ticket for "Tech Conf 2025"
    When my payment fails for the reservation
    Then I should be allowed to retry payment
    And the reservation should remain active

  Scenario: Reservation expires after 15 minutes and inventory is released
    Given I have an active reservation for 2 "Early Bird" tickets for "Tech Conf 2025"
    When 15 minutes pass
    Then the reservation should be expired
    And the availability for "Early Bird" should be 10
    And the availability for "General" should be 10
