Feature: Admin Event Management
  As an admin
  I want to create and publish events and configure ticket types
  So that customers can purchase tickets safely within capacity

  Background:
    Given I am logged in as an admin

  Scenario: Create a new draft event
    When I create an event with title "Tech Conf 2025" and total capacity 10
    Then the event "Tech Conf 2025" should be created with status "DRAFT"
    And I should be redirected to the event edit page for "Tech Conf 2025"

  Scenario: Set event total capacity
    Given an event "Tech Conf 2025" exists with status "DRAFT" and total capacity 10
    When I update the total capacity for "Tech Conf 2025" to 30
    Then the event "Tech Conf 2025" should have total capacity 30

  Scenario: Create an enabled ticket type with allocation
    Given an event "Tech Conf 2025" exists with status "DRAFT" and total capacity 10
    When I add an enabled ticket type "Early Bird" with price 100 and allocation 10 to "Tech Conf 2025"
    Then the event "Tech Conf 2025" should have ticket type "Early Bird" with allocation 10

  Scenario: Create an enabled ticket type without allocation (only event cap applies)
    Given an event "Tech Conf 2025" exists with status "DRAFT" and total capacity 10
    When I add an enabled ticket type "General" with price 150 and no allocation to "Tech Conf 2025"
    Then the event "Tech Conf 2025" should have ticket type "General" with no allocation

  Scenario: Reject saving ticket type allocations that exceed total capacity
    Given an event "Tech Conf 2025" exists with status "DRAFT" and total capacity 10
    And the event has an enabled ticket type "Early Bird" with price 100 and allocation 8
    When I add an enabled ticket type "VIP" with price 300 and allocation 5 to "Tech Conf 2025"
    Then the request should be rejected with error "Allocations exceed total capacity"
    And the event "Tech Conf 2025" should not include ticket type "VIP"

  Scenario: Allow saving ticket types when allocations are partially defined
    Given an event "Tech Conf 2025" exists with status "DRAFT" and total capacity 10
    And the event has an enabled ticket type "Early Bird" with price 100 and allocation 8
    When I add an enabled ticket type "General" with price 150 and no allocation to "Tech Conf 2025"
    Then the event "Tech Conf 2025" should have ticket type "General" with no allocation

  Scenario: Prevent publishing when no enabled ticket types exist
    Given an event "Tech Conf 2025" exists with status "DRAFT" and total capacity 10
    And the event has no enabled ticket types
    When I publish the event "Tech Conf 2025"
    Then the request should be rejected with error "At least one enabled ticket type is required"
    And the event "Tech Conf 2025" should remain in status "DRAFT"

  Scenario: Publish an event when prerequisites are met
    Given an event "Tech Conf 2025" exists with status "DRAFT" and total capacity 10
    And the event has an enabled ticket type "Early Bird" with price 100 and allocation 10
    When I publish the event "Tech Conf 2025"
    Then the event "Tech Conf 2025" should have status "PUBLISHED"

  Scenario: Customers can only browse published events
    Given an event "Draft Event" exists with status "DRAFT" and total capacity 10
    And an event "Published Event" exists with status "PUBLISHED" and total capacity 10
    When a customer browses events
    Then the customer should see "Published Event"
    And the customer should not see "Draft Event"

