# Anchor — Customer Relationship Management System

Anchor is a full-stack CRM system for managing customers, leads, sales
opportunities, follow-ups, and team performance in one place. Built to be a
portfolio-grade, production-style application.

## Tech Stack

**Frontend:** React (Vite), React Router, Axios, Recharts, @dnd-kit/core
**Backend:** Node.js, Express.js
**Database:** MongoDB (Mongoose)
**Auth:** JWT + bcrypt, role-based access control (Admin / Sales Manager / Sales Executive)
**Deployment target:** Vercel (client) + Render/Railway (server) + MongoDB Atlas

## Monorepo Structure

```
anchor-crm/
├── server/          Express API, MongoDB models, auth, business logic
└── client/          React SPA (Vite)
```

## Core Features

- JWT authentication with role-based access control
- Lead management (create, assign, convert, track source/status, duplicate-email prevention)
- Customer management with search, notes, purchase history, pagination
- Visual sales pipeline with real drag-and-drop (New Lead → Contacted → Qualified → Proposal Sent → Negotiation → Won/Lost)
- Follow-up & task scheduling with status tracking
- Dashboard with live KPIs (customers, leads, deals won/lost, monthly revenue, upcoming follow-ups) and a revenue trend chart
- Reports: lead conversion rate, employee performance, customer growth (via MongoDB aggregation pipelines)

## Getting Started

```bash
# 1. Backend
cd server
npm install
cp .env.example .env      # set MONGO_URI + JWT_SECRET
node seed.js               # optional: creates demo admin + sample data
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Demo login (after seeding): `admin@anchor.crm` / `password123`

See `server/README.md` and `client/README.md` for full setup, API reference,
and deployment instructions.

## Troubleshooting

**Server exits immediately with no error ("clean exit") when running `npm run dev`.**
Almost always means `connectDB()` never resolved. Confirm MongoDB is
actually running (`mongosh` should connect), and that `MONGO_URI` in
`server/.env` is correct. Run `node server.js` directly (bypassing nodemon)
to see the raw output if nodemon is swallowing errors.

**`404` on `/api/...` requests from the frontend.**
Usually a missing `client/.env` or a Vite dev server that hasn't picked up
a proxy change — restart `npm run dev` in `client/` after any config edit.

**`400`/`500` errors on creating/updating leads, customers, or opportunities.**
Check that the Mongoose schema's `enum` values (e.g. opportunity `stage`,
lead `status`/`source`) exactly match what the frontend sends — casing
matters (`"New Lead"` vs `"new lead"`). If you've edited a model's enum
values, any existing documents in MongoDB with the old values can fail
re-validation on update; drop the affected collection in MongoDB Compass
and reseed rather than trying to migrate old data by hand.

**`leads.map is not a function` (or similar `.map` crash) in the console.**
The backend's response shape doesn't match what the frontend expects. Some
endpoints (e.g. `GET /leads`) must return a plain array; others (e.g. `GET
/customers`) return a paginated `{ items, total, page, pages }` object.
Check the controller's `res.json(...)` shape against what the page's
`.then(({ data }) => ...)` assumes.

**Route file throws `Route.get() requires a callback function but got
undefined` on startup.**
A routes file is importing a controller function that no longer exists
(usually after a controller file was edited/regenerated). Compare the
`require(...)` destructuring at the top of the routes file against the
`exports.xxx` names actually defined in the controller.

**Screenshots of Live Demo**
[<img width="1901" height="900" alt="Screenshot 2026-08-14 082449" src="https://github.com/user-attachments/assets/d915b827-4c70-444e-af92-4eea2a11ae3e" />]
<br>
<br>
[<img width="1901" height="900" alt="Screenshot 2026-08-14 082449" src="https://github.com/user-attachments/assets/d142a576-7bec-4bc7-821e-ee12bb92402b" />]




## Roadmap / Bonus Features

- Dark mode
- AI lead scoring
- Email integration
- Real-time notifications (WebSockets)
- Multi-tenant support
- Sales forecasting
- Automated tests (API integration tests + component tests)

---
