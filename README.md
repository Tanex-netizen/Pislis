# Darwin Education Platform

A modern educational course platform with manual enrollment verification and secure access links.

## Project Structure

```
Darwin Website/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/       # Next.js app router pages
│   │   └── components/ # Reusable React components
│   └── package.json
│
├── backend/           # Node.js/Express API server
│   ├── src/
│   │   ├── routes/    # API route handlers
│   │   ├── middleware/ # Auth middleware
│   │   └── config/    # Database & email config
│   ├── database/      # SQL schema for Supabase
│   └── package.json
│
└── README.md
```

## Features

### Frontend (Next.js)
- 🎨 Dark green aesthetic theme (responsive design)
- 📚 Course listing and filtering
- 📝 Enrollment form with payment proof upload
- 🔐 Secure course access via token links
- 👨‍💼 Admin dashboard for enrollment management
- 🔑 Password setup for first-time access

### Backend (Node.js/Express)
- 🔒 JWT-based authentication
- 📧 Email notifications (enrollment confirmation, access links)
- 🎫 Secure token generation for course access
- 📊 Admin API for enrollment management
- 🗄️ Supabase database integration

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:3000

### Backend Setup

1. Copy the environment file:
```bash
cd backend
cp .env.example .env
```

2. Update `.env` with your credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email
SMTP_PASS=your_app_password
```

3. Install dependencies and start:
```bash
npm install
npm run dev
```

The API will run on http://localhost:5000

### Database Setup (Supabase)

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the SQL in `backend/database/schema.sql`
4. Copy your Supabase URL and keys to `.env`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, featured courses, testimonials |
| `/courses` | Browse all courses with filters |
| `/enroll` | Enrollment form with payment upload |
| `/admin` | Admin dashboard for managing enrollments |
| `/access/[token]` | Course content access page |

## API Endpoints

### Public
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/enrollments` - Submit enrollment
- `GET /api/enrollments/verify/:token` - Verify access token

### Protected (Auth Required)
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Admin Only
- `GET /api/admin/enrollments` - List all enrollments
- `POST /api/admin/enrollments/:id/approve` - Approve enrollment
- `POST /api/admin/enrollments/:id/reject` - Reject enrollment
- `POST /api/admin/enrollments/:id/resend-link` - Resend access email
- `GET /api/admin/stats` - Dashboard statistics

## Security Features

1. **Token-Based Access**
   - Unique 32-character tokens per enrollment
   - Configurable expiration (default 1 year)
   - One-time password setup on first access

2. **Device/Session Management**
   - Device fingerprint tracking
   - Concurrent session limits (configurable)
   - Session activity logging

3. **Payment Verification**
   - Manual admin review of payment proofs
   - Transaction ID tracking (prevents duplicates)
   - Audit trail for all approvals/rejections

4. **Link Protection**
   - Email tied to specific token
   - Access revocation capability
   - Suspicious activity detection

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@darwin.edu
FROM_NAME=Darwin Education
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@darwin.edu
```

## Demo Credentials

Admin Dashboard:
- Email: `admin@darwin.edu`
- Password: `admin123`

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, JWT
- **Database**: Supabase (PostgreSQL)
- **Email**: Nodemailer

## License

MIT License
