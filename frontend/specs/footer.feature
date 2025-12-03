Feature: Footer Information (頁尾資訊)

  As a visitor,
  I want to see the correct contact and location information in the footer,
  So that I can know where Steven Cheng is based and how to contact him.

  Background:
    Given I am on the portfolio homepage
    And I scroll to the "Footer" section

  Scenario: Verify location information
    Then I should see "Taiwan Taipei" displayed as the location
    And I should see "Steven Cheng (鄭棋文)" in the copyright notice
