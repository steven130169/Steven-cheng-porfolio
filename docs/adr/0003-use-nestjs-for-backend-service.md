# 3. Use NestJS for Backend Service

* Status: Accepted
* Date: 2025-12-03
* Deciders: Steven Cheng, Gemini Agent

## Context and Problem Statement
We need a robust backend framework to serve API requests for the portfolio application. The user (Steven) is a Senior Architect experienced with Node.js and NestJS. We need a framework that provides structure, strong typing (TypeScript), and scalability.

## Decision Drivers
* User preference and expertise (Senior Node.js/NestJS Architect).
* Need for strong TypeScript support.
* Need for a structured, opinionated framework to ensure code quality and maintainability.
* Requirement for dependency injection and testability.

## Considered Options
* Express.js (Minimalist, but requires manual structure setup).
* NestJS (Structured, TypeScript-first, opinionated).
* Fastify (High performance, can be used with NestJS).
* Koa (Minimalist).

## Decision Outcome
Chosen option: "NestJS", because:
1.  It aligns perfectly with the user's expertise.
2.  It provides an "Angular-like" modular architecture which scales well.
3.  It has excellent TypeScript integration out of the box.
4.  It simplifies testing (DI container makes mocking dependencies easy).

## Consequences
* Good, because development speed will be high due to user familiarity.
* Good, because the code will be uniform and follow best practices.
* Bad, because NestJS has a steeper learning curve for newcomers (though not an issue here).
* Bad, because it introduces more boilerplate code than a simple Express app.
