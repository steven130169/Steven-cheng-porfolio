Feature: Event Management System (活動管理系統)

  As a community organizer (Steven),
  I want to add new events via a web form,
  So that I can showcase my latest community activities to visitors.

  Background:
    Given I am on the homepage
    And I scroll to the "Events & Community" section

  Scenario: View existing events list
    Then I should see a list of existing events
    And I should see event details like "Cloud Native Taiwan Study Group"

  Scenario: Successfully add a new event
    When I click the "Add Event" button
    And I fill in the event form with:
      | Title       | React 19 Launch Party          |
      | Role        | Speaker                        |
      | Date        | Dec 2025                       |
      | Description | Deep dive into server actions. |
      | Tags        | React, Frontend                |
      | Status      | Upcoming                       |
    And I submit the form
    Then I should see "React 19 Launch Party" added to the event list
    And I should see the role "Speaker" displayed for the new event

  Scenario: Cancel adding an event
    When I click the "Add Event" button
    And I click the "Cancel" button
    Then the event form should be closed
    And I should not see "React 19 Launch Party" in the event list
