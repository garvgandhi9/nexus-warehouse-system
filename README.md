# Nexus Warehouse System

A full-stack warehouse marketplace platform that connects warehouse owners with businesses looking for logistics and storage solutions across India.

## Live Demo

- **Frontend:** [nexus-warehouse-system.vercel.app](https://nexus-warehouse-system.vercel.app)
- **Backend:** [nexus-warehouse-system-production.up.railway.app](https://nexus-warehouse-system-production.up.railway.app)

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- MapLibre GL + react-map-gl
- Firebase Authentication (Google Sign-In)

### Backend
- Node.js + Express
- PostgreSQL (via Railway)
- JWT Authentication
- Cloudinary (image uploads)
- Firebase Admin SDK

### Deployment
- Frontend: Vercel (auto-deploy on push)
- Backend + Database: Railway (auto-deploy on push)

## Project Structure

```
Nexus-Warehouse-System/
├── database/
│   └── schema.sql
├── nexusvc-main/          ← React/TypeScript Frontend
│   ├── src/
│   │   ├── components/    ← Navbar, Footer, WarehouseMap, etc.
│   │   ├── pages/         ← All page components
│   │   ├── hooks/         ← Custom hooks
│   │   ├── lib/           ← API config, Firebase config
│   │   └── data/          ← Mock data
│   └── ...
└── warehouse-backend/     ← Node.js/Express Backend
    ├── controllers/       ← Business logic
    ├── middleware/        ← Auth middleware
    ├── models/            ← Database queries
    ├── routes/            ← API routes
    └── index.js
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Cloudinary account
- Firebase project

### Environment Variables

#### Backend (`warehouse-backend/.env`)
```
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
ADMIN_TOKEN=your_admin_token
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_SERVICE_ACCOUNT=your_firebase_service_account_json
PORT=3001
```

#### Frontend (`nexusvc-main/.env`)
```
VITE_API_URL=http://localhost:3001
VITE_MAPTILER_API_KEY=your_maptiler_key
```

### Running Locally

```bash
# Terminal 1 - Backend (port 3001)
cd warehouse-backend
npm install
npm start

# Terminal 2 - Frontend (port 5173)
cd nexusvc-main
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

### Public
- Browse warehouse listings with search, filter, and map view
- Filter by city, price range, capacity, and property type
- View detailed warehouse pages with photos, specs, amenities, and location map
- Contact form for enquiries
- Submit warehouse listing

### Authentication
- Email/password signup and login
- Google Sign-In via Firebase
- Forgot password via Firebase

### User Dashboard
- View and manage your submitted listings
- Track listing status (pending/approved/rejected)

### Admin Panel
- Approve or reject submitted listings
- Edit listing details via Command Panel
- Delete listings
- View and manage contact messages

### Nexus Prime
- Premium 3PL membership page
- Build-to-suit enquiry form

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/warehouses` | Get all approved listings |
| GET | `/public/warehouses/featured` | Get featured listings |
| GET | `/public/warehouses/:id` | Get single listing |
| GET | `/public/cities` | Get available cities |
| POST | `/public/submit` | Submit new listing |
| POST | `/public/contact` | Submit contact message |
| POST | `/public/upload` | Upload image to Cloudinary |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/signup` | User signup |
| POST | `/auth/admin/login` | Admin login |
| POST | `/auth/google` | Google Sign-In |

### User (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/warehouses` | Get user's listings |
| PUT | `/user/warehouses/:id` | Update user's listing |

### Admin (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/warehouses` | Get all listings |
| GET | `/admin/messages` | Get all messages |
| PUT | `/admin/approve/:id` | Approve listing |
| DELETE | `/admin/delete/:id` | Delete listing |
| DELETE | `/admin/messages/:id` | Delete message |

## Database Schema

### Tables
- `warehouses` — All listing data (35+ columns)
- `users` — Registered users
- `messages` — Contact form submissions
- `cities` — Available cities (auto-populated from warehouses)

## Deployment

### Frontend (Vercel)
- Auto-deploys on push to `main`
- Add environment variables in Vercel dashboard
- `vercel.json` handles SPA routing rewrites

### Backend (Railway)
- Auto-deploys on push to `main`
- Add environment variables in Railway dashboard
- PostgreSQL database hosted on Railway

## Contributing

After every change:
```bash
git add . && git commit -m "your message" && git push
```

## License

Private — Bismarck Group. All rights reserved.