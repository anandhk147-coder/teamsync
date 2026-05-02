# TeamSync - Project & Task Management App


A full-stack Project & Task Management application with Role-Based Access Control.

## Features
- **Auth**: JWT-based authentication (Access + Refresh tokens).
- **RBAC**: Admin and Member roles with specific permissions.
- **Projects**: Create, update, and manage projects (Admin only for creation).
- **Kanban Board**: Drag-and-drop style task management within projects.
- **Dashboard**: Real-time statistics and productivity overview.
- **Premium UI**: Dark mode, glassmorphism, and smooth animations using Tailwind CSS & Framer Motion.

## Tech Stack
- **Backend**: Node.js, Express.js, Sequelize ORM, PostgreSQL.
- **Frontend**: React, Vite, Tailwind CSS 4, Lucide Icons, Framer Motion.
- **Deployment**: Render (Backend Web Service + PostgreSQL + Frontend Static Site).

## Setup (Local)

### Backend
1. `cd backend`
2. `npm install`
3. Create `.env` file with `DATABASE_URL`, `JWT_SECRET`, and `PORT`.
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. Create `.env` file with `VITE_API_URL`.
4. `npm run dev`

## 🚀 Deploy to Render (One-Click Blueprint)

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) and log in.
3. Click **New → Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and prompt you to create:
   - PostgreSQL Database
   - Node.js Web Service (Backend)
   - Static Site (Frontend)
6. Click **Apply** and wait for deployment to finish!

## API Endpoints

### Auth
- `POST /api/auth/register`: Signup
- `POST /api/auth/login`: Login
- `GET /api/auth/me`: Current User (Protected)

### Projects
- `GET /api/projects`: List user's projects
- `POST /api/projects`: Create project (Admin only)
- `GET /api/projects/:id`: Project detail + members
- `PUT /api/projects/:id`: Update project (Admin/Project Owner)
- `DELETE /api/projects/:id`: Delete project (Admin only)

### Tasks
- `GET /api/tasks/project/:id`: List tasks for a project
- `POST /api/tasks/project/:id`: Create task (Admin only)
- `PUT /api/tasks/:id`: Update task (Status/All depending on role)
- `DELETE /api/tasks/:id`: Delete task (Admin only)

### Dashboard
- `GET /api/dashboard`: Summary stats
