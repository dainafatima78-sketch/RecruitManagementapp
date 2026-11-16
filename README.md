# RecruitAI – AI-Powered Recruitment Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![AgentRouter AI](https://img.shields.io/badge/AgentRouter-ChatGPT_6_Astra-8B5CF6?style=for-the-badge)](https://agentrouter.org/)

**RecruitAI** is an enterprise-grade recruitment management platform (ATS) featuring job pipeline tracking, candidate profiles, resume document processing, AI-powered candidate-to-job matching, and intelligent interview question generation powered by **AgentRouter (ChatGPT 6 Astra)**.

---

## 🚀 Key Features

- **📊 Recruitment Dashboard**: Pipeline overview, hiring velocity metrics, application distribution charts, and real-time activity audit trails.
- **💼 Job Requisitions Management**: Create, edit, monitor, and filter open requisitions with detailed required vs. preferred skill requirements.
- **👥 Candidate Management**: Candidate profiles, experience level tracking, status transitions (`New`, `In Review`, `Shortlisted`, `Rejected`), and resume previewing.
- **📄 Resume Document Processing**: Automated PDF and DOCX resume parsing extracting candidate identities, work histories, education, skills, and certifications.
- **🎯 AI Candidate Matching**: Evaluates candidate resumes against open requisitions with multidimensional score breakdowns (`overallScore`, `skillsScore`, `experienceScore`, `educationScore`), verified strengths, and missing skill gap analysis.
- **💬 AI Interview Generator**: Generate tailored interview question sets (General, Technical, Behavioral, Situational, HR) across Beginner, Intermediate, and Advanced difficulties with scoring rubrics.
- **🐘 PostgreSQL Enterprise Storage**: Native PostgreSQL database support with schema migration automation and per-user data tenancy isolation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, TanStack Query, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript, tsx, cookie-parser, CORS |
| **Database** | PostgreSQL (`pg`), automated schema migrations, zero-credential hardcoding |
| **AI Engine** | AgentRouter API (`https://agentrouter.org`) with **ChatGPT 6 Astra** (`gpt-6-astra`) |
| **Deployment** | Vercel (Frontend SPA) + Render (Node.js Backend & Managed PostgreSQL) |

---

## 📦 Project Architecture

```
candidate-management-main/
├── dist/                      # Production client build artifacts
├── public/                    # Static assets & brand icons
├── src/
│   ├── api/                   # REST API client & TanStack query wrappers
│   ├── components/            # Reusable UI component library (candidates, matching, layout)
│   ├── context/               # AuthContext & ToastContext providers
│   ├── pages/                 # Route pages (Dashboard, Jobs, Candidates, Matching, Interviews)
│   ├── server/                # Express backend controllers, routes, storage & AI services
│   │   ├── routes/            # auth, candidate, job, matching, interview, aiAssistant routes
│   │   ├── agentRouterClient  # AgentRouter ChatGPT 6 Astra API service
│   │   ├── postgres.ts        # PostgreSQL connection pool & automatic table schema migrations
│   │   └── storage.ts         # User-isolated data storage layer
│   └── types/                 # Shared TypeScript interfaces
├── backend.env.example        # Backend environment variables template
├── frontend.env.example       # Frontend environment variables template
├── render.yaml                # Render Blueprint infrastructure specification
├── vercel.json                # Vercel SPA routing configuration
└── server.ts                  # Backend server entrypoint & Vite middleware integration
```

---

## ⚙️ Local Installation & Development

### 1. Prerequisites
- Node.js `v20.x` or `v24.x`
- npm `v10+`
- (Optional) PostgreSQL server or cloud database (Render, Neon, Supabase)

### 2. Clone and Install
```bash
git clone https://github.com/dainafatima78/RecruitManagementapp.git
cd RecruitManagementapp
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables
Create `.env` in the root directory:
```env
PORT=3000
NODE_ENV=development

# AgentRouter AI Configuration
AGENTROUTER_API_KEY="your-agentrouter-api-key"
AGENTROUTER_BASE_URL="https://agentrouter.org"
AGENTROUTER_MODEL="gpt-6-astra"

# Optional PostgreSQL (defaults to persistent local database if omitted)
DATABASE_URL="postgresql://user:password@localhost:5432/recruitai"
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Deployment Guide

### A. Backend & PostgreSQL Deployment on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Blueprint** (or connect this repository).
2. Render reads `render.yaml` and provisions:
   - **PostgreSQL Database**: Free tier managed PostgreSQL database.
   - **Web Service**: Node.js backend executing `npm install && npm run build` and `npm start`.
3. Add your private environment variables in the Render Dashboard:
   - `AGENTROUTER_API_KEY`: Your AgentRouter secret key.
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://recruit-managementapp.vercel.app`).
4. Note your live backend URL (e.g., `https://recruitai-backend.onrender.com`).

### B. Frontend Deployment on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new) and import the GitHub repository: `RecruitManagementapp`.
2. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_BASE_URL`: Your deployed Render backend URL (`https://recruitai-backend.onrender.com`).
4. Click **Deploy**. Vercel will build the frontend and serve all SPA routes via `vercel.json`.

---

## 🔒 Security & Best Practices

- **Zero Secret Exposure**: `.env` is ignored via `.gitignore`. API keys and credentials are never shipped to client bundles.
- **JWT & HTTP Authentication**: User passwords hashed using PBKDF2 with unique cryptographic salts.
- **Multi-Tenant Scoping**: All jobs, candidate records, matches, and questions enforce explicit `userId` database isolation.
- **CORS Protection**: Backend restricts origin requests to authorized production domains.

---

## 📄 License
This project is licensed under the MIT License.
