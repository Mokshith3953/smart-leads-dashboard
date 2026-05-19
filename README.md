# Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack and TypeScript.

## Tech Stack

**Frontend:** React 18, TypeScript, TailwindCSS, Vite, React Router v6  
**Backend:** Node.js, Express.js, TypeScript, MongoDB, Mongoose  
**Auth:** JWT + bcrypt  
**DevOps:** Docker, Docker Compose  

## Features

- JWT-based authentication with role-based access control (Admin / Sales)
- Full CRUD for leads with field validation
- Advanced filtering: status, source, search (debounced), sort
- Backend pagination (10 per page) with metadata
- CSV export with active filters applied
- Admin dashboard with lead statistics by status and source
- Dark mode (system preference + manual toggle)
- Fully responsive design

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- npm

### Local Development

1. **Clone the repo and install dependencies:**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Configure environment:**

```bash
# backend/.env (copy from backend/.env.example)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-leads
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

3. **Run both servers:**

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

The app is available at `http://localhost:5173`.

### Docker

```bash
cp .env.example .env
# Edit .env and set JWT_SECRET

docker compose up --build
```

App: `http://localhost:5173` | API: `http://localhost:5000`

## API Documentation

Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login |
| GET | `/auth/me` | Yes | Get current user |

### Leads

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/leads` | Yes | Any | List leads (filters + pagination) |
| POST | `/leads` | Yes | Any | Create lead |
| GET | `/leads/export` | Yes | Any | Export leads as CSV |
| GET | `/leads/stats` | Yes | Admin | Lead statistics |
| GET | `/leads/:id` | Yes | Any | Get single lead |
| PUT | `/leads/:id` | Yes | Owner/Admin | Update lead |
| DELETE | `/leads/:id` | Yes | Owner/Admin | Delete lead |

### Query Parameters for GET /leads

| Param | Type | Description |
|-------|------|-------------|
| `status` | `New\|Contacted\|Qualified\|Lost` | Filter by status |
| `source` | `Website\|Instagram\|Referral` | Filter by source |
| `search` | string | Search name or email |
| `sort` | `latest\|oldest` | Sort order |
| `page` | number | Page number (default: 1) |
| `limit` | number | Records per page (default: 10) |

### Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Project Structure

```
├── backend/
│   └── src/
│       ├── config/       # DB connection
│       ├── controllers/  # Route handlers
│       ├── middleware/   # Auth, validation, error handling
│       ├── models/       # Mongoose models
│       ├── routes/       # Express routers
│       └── types/        # TypeScript interfaces
├── frontend/
│   └── src/
│       ├── api/          # Axios instance + service calls
│       ├── components/   # Reusable UI + feature components
│       ├── context/      # Auth + Theme context
│       ├── hooks/        # Custom hooks (useLeads, useDebounce)
│       ├── pages/        # Route-level components
│       └── types/        # TypeScript interfaces
├── docker-compose.yml
└── README.md
```

## Role Permissions

| Feature | Admin | Sales |
|---------|-------|-------|
| View leads | ✅ | ✅ |
| Create lead | ✅ | ✅ |
| Edit own lead | ✅ | ✅ |
| Edit any lead | ✅ | ❌ |
| Delete own lead | ✅ | ✅ |
| Delete any lead | ✅ | ❌ |
| View stats dashboard | ✅ | ❌ |
| View users list | ✅ | ❌ |
