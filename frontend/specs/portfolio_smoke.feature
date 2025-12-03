Feature: Portfolio Smoke Test (作品集網站冒煙測試)

  As a visitor,
  I want to view the portfolio website and navigate through its sections,
  So that I can learn about Steven Cheng's skills and experience.

  Background:
    Given I open the portfolio homepage

  Scenario: Verify website metadata
    Then the page title should be "Steven Cheng (鄭棋文) | Senior Cloud Architect"

  Scenario: Render all major sections
    Then I should see the "Navbar" section
    And I should see the "Hero" section with text "Architecting High Availability Cloud Systems."
    And I should see the "About" section
    And I should see the "Blog" section
    And I should see the "Events & Community" section
    And I should see the "Speaking" section
    And I should see the "Footer" section

  Scenario: Navigate using navbar links
    When I click the "Blog" link in the navbar
    Then the URL should contain "#blog"
    When I click the "Contact" link in the navbar
    Then the URL should contain "#contact"
