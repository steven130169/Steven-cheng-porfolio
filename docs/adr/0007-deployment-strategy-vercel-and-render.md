# Use Vercel and Render for Zero-Cost Cloud Deployment

* Status: Accepted
* Date: 2025-12-04
* Deciders: Steven Cheng, Gemini Agent

## Context and Problem Statement
The project needs to be deployed to a cloud environment to be accessible publicly. As this is a personal portfolio project with a monorepo structure (React frontend + NestJS backend), we need a deployment strategy that minimizes costs (ideally $0/month) while supporting the specific technical requirements of both frameworks. We need to decide on the hosting providers for both the frontend and backend.

## Decision Drivers
* **Cost**: The solution must be free (Free Tier) for low-traffic personal use.
* **Tech Stack Support**: Must support React (Vite) for the frontend and Node.js/NestJS for the backend.
* **Monorepo Support**: The platform must handle deploying specific subdirectories (`frontend` and `backend`) from a single repository.
* **Ease of Use**: Continuous Deployment (CD) integration with GitHub is preferred.
* **Backend Persistence**: The backend needs to run as a web service (listening on a port), not just serverless functions, to support future WebSocket or stateful features easily, although the current implementation is in-memory.

## Considered Options
* **Option 1: Vercel (Frontend) + Render (Backend)**
    * Vercel provides excellent support for React/Vite.
    * Render provides a free "Web Service" tier capable of running a NestJS application 24/7 (with sleep after inactivity).
* **Option 2: Netlify (Frontend) + Railway (Backend)**
    * Railway recently changed its free tier model (trial usage), which might not be permanently free without credit consumption.
* **Option 3: Fly.io**
    * Good for Dockerized apps, but the free tier allowance is small and requires credit card entry.
* **Option 4: AWS Free Tier**
    * Powerful but complex to set up (EC2/Elastic Beanstalk). Free tier expires after 12 months for many services.

## Decision Outcome
Chosen option: **Option 1: Vercel (Frontend) + Render (Backend)**.

**Justification:**
* **Vercel** is the industry standard for deploying frontend frameworks like React and offers a generous free tier with global CDN.
* **Render** is one of the few remaining providers offering a free tier for "Web Services" (Node.js processes), which allows the NestJS backend to run as a traditional server rather than being forced into a serverless architecture.
* Both platforms support Monorepo setups by specifying `Root Directory` (e.g., `frontend` or `backend`).

## Implementation Details
* **Frontend (Vercel)**:
    * Root Directory: `frontend`
    * Build Command: `npm run build` (Vite default)
    * Env Vars: `VITE_API_URL` pointing to the Render backend URL.
* **Backend (Render)**:
    * Root Directory: `backend`
    * Build Command: `npm install && npm run build`
    * Start Command: `npm run start:prod`
    * Env Vars: `PORT` (provided by Render).
* **CORS**: The NestJS backend must update its CORS configuration to allow requests from the Vercel domain.

## Consequences
* **Good**: $0 monthly cost.
* **Good**: Automated deployments via Git push.
* **Good**: Separation of concerns; frontend serves static assets fast via CDN, backend runs logic.
* **Bad (Acceptable)**: The Render free tier service spins down after 15 minutes of inactivity. The first request after inactivity will have a "Cold Start" delay (approx. 30-60s).
* **Bad (Acceptable)**: Since the current backend uses in-memory storage, **data will be lost** whenever the Render instance sleeps or restarts. (Future mitigation: Connect to a free database like Neon or MongoDB Atlas).
