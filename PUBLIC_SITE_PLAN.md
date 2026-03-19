# CHO2 Public Announcement Platform — Plan

## Overview

A simple public-facing website for **City Health Office II (CHO2)** in Dasmariñas City.
Addresses the lack of online presence by providing a platform to showcase CHO2's services
and post announcements/milestones.

**Developed by:** Separate collaborator team
**Location:** `/public` folder inside the `capstone-hsms` monorepo
**Backend:** Shared with the existing HSMS backend (FastAPI)

---

## Goals

- Give CHO2 a public online presence
- Allow CHO2 staff to post and manage announcements
- Showcase CHO2 services and information
- Simple and maintainable — no over-engineering

---

## Folder Structure

```
capstone-hsms/
├── backend/                              ← existing (add announcement module)
├── frontend/                             ← existing (add announcement admin panel)
├── public/                               ← NEW: public-facing website
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── AnnouncementCard.tsx
│   │   │   └── ServiceCard.tsx
│   │   ├── pages/
│   │   │   ├── index.tsx                 ← landing / home
│   │   │   ├── announcements.tsx         ← public announcements feed
│   │   │   ├── services.tsx              ← CHO2 services
│   │   │   └── about.tsx                 ← about CHO2
│   │   ├── lib/
│   │   │   └── api.ts                    ← fetch from /api/public/*
│   │   └── types/
│   │       └── announcement.ts
│   ├── public/
│   │   └── assets/                       ← logos, images, CHO2 branding
│   ├── .env.example                      ← VITE_API_URL=https://...
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml                    ← public added as a service
```

---

## Tech Stack

Same as the existing `frontend/` — no new technologies introduced.

| Concern | Choice |
|---|---|
| Framework | React + Vite + TypeScript |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS |
| Data fetching | axios |
| Routing | React Router v6 |

---

## Backend Changes (inside existing HSMS backend)

### New files

```
backend/app/
├── models/announcement.py                ← Announcement ORM model
├── schemas/announcement.py               ← Pydantic schemas (public + admin)
├── routers/
│   ├── public/announcements.py           ← public GET endpoints (no auth)
│   └── admin/announcements.py            ← staff CRUD (auth required)
├── services/announcement_service.py      ← business logic
└── repositories/announcement_repository.py ← DB queries
```

### Public API endpoints (no auth)

```
GET  /api/public/announcements            ← list published announcements
GET  /api/public/announcements/{id}       ← single announcement
GET  /api/public/services                 ← CHO2 services info
```

### Admin API endpoints (auth required)

```
POST    /api/admin/announcements          ← create announcement
PATCH   /api/admin/announcements/{id}     ← edit announcement
DELETE  /api/admin/announcements/{id}     ← soft delete (per existing pattern)
```

---

## Internal Frontend Changes (staff admin panel)

```
frontend/src/features/announcements/
├── api.ts                                ← axios calls to admin endpoints
├── types.ts                              ← TypeScript types
├── AnnouncementList.tsx                  ← table with CRUD controls
└── AnnouncementForm.tsx                  ← create/edit form
```

Staff with appropriate roles can create, edit, and delete announcements from
within the existing HSMS frontend.

---

## docker-compose Addition

```yaml
public:
  build: ./public
  ports:
    - "3001:3001"
  environment:
    - VITE_API_URL=http://backend:8000
  depends_on:
    - backend
```

---

## Pages (Public Site)

| Page | Path | Description |
|---|---|---|
| Home / Landing | `/` | CHO2 intro, hero, quick links |
| Announcements | `/announcements` | Feed of published announcements |
| Services | `/services` | List of CHO2 health services |
| About | `/about` | About CHO2, location, contact |

---

## Responsibility Split

| Area | Owner |
|---|---|
| Backend announcement module | Main team |
| Staff admin panel (internal frontend) | Main team |
| Public website (`/public`) | Collaborator team |

Collaborators only work inside `/public`. They consume the public API endpoints
and do not touch any clinical backend logic or internal frontend code.

---

## CORS Configuration

The backend must allow the public site's origin:

```python
# backend/app/core/config.py
ALLOWED_ORIGINS = [
    "https://cho2-public.example.com",    # production
    "http://localhost:3001",              # collaborator local dev
]
```

---

## Notes

- Announcements follow the existing **soft delete** pattern (`deleted_at TIMESTAMPTZ`) per RA 10173 compliance
- No PII is exposed through public endpoints
- The public site is read-only — no user accounts, no forms beyond a contact section
