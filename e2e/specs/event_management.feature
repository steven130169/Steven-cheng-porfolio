Feature: Event Management System (活動管理系統)

  As a community organizer (Steven),
  I want to add new events via a web form,
  So that I can showcase my latest community activities to visitors.

  Background:
    Given the portfolio website is loaded
    And I scroll to the "Events & Community" section

  Scenario: View existing events list
    Then I should see a list of existing events
    And I should see event details like "DevOps Days"

  Scenario: Successfully add a new event
    When I click the "Add Event" button
    And I fill in the event form with:
      | Field       | Value                          |
      | Title       | Playwright E2E Workshop        |
      | Role        | Lead Instructor                |
      | Date        | Jan 2026                       |
      | Description | Learning E2E testing best practices. |
    And I submit the form
    Then I should see "Playwright E2E Workshop" added to the event list
    And I should see the role "Lead Instructor" displayed for the new event

  Scenario: Cancel adding an event
    When I click the "Add Event" button
    And I click the "Cancel" button
    Then the event form should be closed
    And I should not see "React 19 Launch Party" in the event list

  # 新增的 Scenario: 限制活動顯示數量
  Scenario: Display only the first 3 events with a "View All Events" button
    Given there are more than 3 events available
    When I view the "Event" section
    Then I should see exactly 3 events displayed
    And I should see a "View All Events" button
    And I should not see the 4th event or subsequent events directly in the list