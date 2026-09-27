# HireFlow — Full Stack Recruitment Platform

A complete portfolio-ready Applicant Tracking System built with React, TypeScript, Node.js and Express. The included JSON datastore makes the project run immediately without installing a database, while keeping a clean REST architecture that can later be migrated to PostgreSQL.

## Features
- Recruiter registration, login and JWT authentication
- Protected application routes
- Dashboard analytics
- Create, edit and delete jobs
- Add, edit and delete candidates
- Search/filter candidates
- Move candidates through Applied, Screening, Interview, Offered, Hired and Rejected stages
- Persistent server-side data
- Responsive SaaS-style UI
- Form validation and API error states

## Run locally
Requires Node.js 18+.

```bash
npm install
npm run install:all
npm run dev
```

Open http://localhost:5173. API runs on http://localhost:5000.

You can also run `client` and `server` separately with `npm install && npm run dev` in each folder.

## Demo
Register any account from the Sign Up page. Your account, jobs and candidates persist in `server/data/hireflow.json`.

## Stack
React, TypeScript, Vite, React Router, Axios, Node.js, Express, JWT, bcryptjs.

## Production note
For production, replace the file datastore with PostgreSQL, set a strong `JWT_SECRET`, use HTTPS, secure cookies if desired, and deploy the API and client separately.
