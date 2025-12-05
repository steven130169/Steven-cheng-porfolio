# Integrate Lightweight CRM & Marketing Module

* Status: Accepted
* Date: 2025-12-06
* Deciders: Steven Cheng, Context 7 Agent

## Context and Problem Statement
The user wants to leverage the event ticketing system to build long-term relationships with attendees. Simply selling tickets is transactional; the goal is to retain user data for future marketing (e.g., "Send email to everyone who attended the DevOps Workshop"). The system currently handles Users (Auth) and Orders, but lacks a "Customer" entity that aggregates interaction history and supports marketing segmentation (CRM features).

## Decision Drivers
*   **Data Ownership**: Full control over customer data and segmentation logic is required.
*   **Cost**: Avoid paying for expensive external CRMs (HubSpot/Salesforce) for basic needs.
*   **Integration**: The CRM must be tightly integrated with the Ticketing (Orders) and Auth systems.
*   **Privacy**: PII (Personally Identifiable Information) must be handled securely within the existing Firestore infrastructure.

## Considered Options
*   **Option 1 (Chosen)**: **Custom "CRM-Lite" Module in NestJS**.
*   **Option 2**: Integrate external CRM (HubSpot/Salesforce).
*   **Option 3**: Use Firebase Extensions (Mailchimp Sync).

## Decision Outcome
Chosen option: **Option 1**.

**Reasoning**:
1.  **Seamless Integration**: We can automatically link "Guest Checkout" emails to registered Users, and aggregate "Total Spend" or "Attendance History" in real-time using Firestore/NestJS, which is harder to sync with external CRMs.
2.  **Cost**: Free (part of existing Firestore usage).
3.  **Simplicity**: We only need basic features (Contact List, Tagging, Order History), not a full Sales Pipeline.

## Detailed Design (CRM-Lite)
*   **New Entity**: `Customer` (Firestore Collection).
    *   Distinct from `User` (Auth). A `Customer` profile can exist without a login account (e.g., a guest buyer).
*   **Key Features**:
    *   **Auto-Link**: Automatically associate Orders with Customers based on Email.
    *   **Tagging System**: API to apply tags (e.g., `VIP`, `2024-Attendee`).
    *   **Segmentation**: Ability to query customers by tags for Newsletter targeting.

## Consequences
*   **Good, because**: It turns transactional data (Orders) into marketing assets (Customer Profiles).
*   **Good, because**: It adds zero monthly cost.
*   **Bad, because**: We must implement "Merge Logic" (what happens if a user changes email?) and GDPR/Privacy compliance features (Export/Delete data) manually.
