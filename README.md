# ThaiTable Restaurant Management System

This repository contains the source code for **ThaiTable**, a multi-tenant restaurant management platform built specifically for the Thai market.

## 🚀 Current Status

### ✅ Completed (Phase 1 - Week 1)
- [x] **Monorepo Structure**: Backend + Frontend directories
- [x] **Backend Scaffold**: Express.js + TypeScript + Prisma
- [x] **Frontend Scaffold**: React + Vite + Tailwind CSS
- [x] **Development Environment**: Cursor IDE + AI integration
- [x] **Code Quality**: ESLint + Prettier configuration
- [x] **Database Schema**: Prisma schema with Thai market entities
- [x] **Authentication**: JWT + bcrypt skeleton
- [x] **Environment Config**: dotenv setup with Thai-specific variables
- [x] **GitHub Repository**: CI/CD workflow with GitHub Actions
- [x] **Documentation**: Comprehensive project docs
- [x] **Beautiful Landing Page**: ThaiTable marketing site

### 🔄 In Progress
- [ ] **Railway Setup**: PostgreSQL database + backend deployment
- [ ] **Vercel Frontend**: Automatic deployment pipeline
- [ ] **Menu Management**: CRUD API + React UI

### 📋 Next Steps (Phase 1 - Week 2)
- [ ] **Menu CRUD API**: Complete backend endpoints
- [ ] **S3 Image Upload**: AWS integration for menu photos
- [ ] **Menu Management UI**: React components for restaurant staff
- [ ] **Order Management**: Basic order flow
- [ ] **Table Management**: Restaurant floor plan

## 🏗️ Monorepo Structure

```
ThaiTable/
├── backend/                 # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/         # Environment & app config
│   │   ├── middleware/     # Auth & validation middleware
│   │   └── index.ts        # Server entry point
│   ├── prisma/             # Database schema & migrations
│   └── package.json
├── frontend/               # React + Vite + TypeScript web dashboard
│   ├── src/
│   │   ├── pages/          # React components
│   │   ├── styles/         # Global CSS & Tailwind
│   │   └── main.tsx        # App entry point
│   └── package.json
├── .github/                # CI/CD workflows
├── .vscode/                # Cursor IDE configuration
└── docs/                   # Project documentation
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20 + TypeScript 5
- **Framework**: Express.js 4.18
- **Database**: PostgreSQL 15 + Prisma ORM
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **File Storage**: AWS S3

### Frontend
- **Framework**: React 18 + TypeScript 5
- **Build Tool**: Vite 4
- **Styling**: Tailwind CSS 3
- **State**: Zustand 4
- **Forms**: React Hook Form + Zod

### Infrastructure
- **Hosting**: Railway (backend) + Vercel (frontend)
- **Database**: Railway PostgreSQL
- **CDN**: CloudFlare
- **Monitoring**: Sentry + UptimeRobot

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Git
- Cursor IDE (recommended)

### Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/tobylas-w/ThaiTable.git
   cd ThaiTable
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your database URL and JWT secret
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Database Setup** (when Railway is configured)
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   ```

## 🎯 Development Workflow

### AI-Assisted Development
- **Cursor IDE**: Primary development environment
- **Claude Integration**: Complex logic and architecture
- **V0.dev**: UI component generation
- **GitHub Copilot**: Code completion

### Daily Process
1. **Morning Planning** (30 min) - Review progress, plan tasks
2. **Development Sessions** (8 hours) - Backend API, Frontend UI, Integration
3. **Evening Review** (30 min) - Commit changes, update docs

## 🌐 Live Previews

- **GitHub Repository**: https://github.com/tobylas-w/ThaiTable
- **Frontend Preview**: Coming soon (Vercel deployment)
- **API Preview**: Coming soon (Railway deployment)

## 📊 Project Phases

### Phase 1: Foundation (Weeks 1-3) ✅ 80% Complete
- [x] Week 1: Infrastructure & Authentication
- [ ] Week 2: Menu Management & Order System
- [ ] Week 3: Frontend Foundation & Mobile Testing

### Phase 2: Thai Localization (Weeks 4-5)
- [ ] Week 4: Advanced Thai Localization
- [ ] Week 5: Payment Integration (PromptPay, TrueMoney)

### Phase 3: Multi-Restaurant (Weeks 6-8)
- [ ] Week 6: Multi-Tenancy Architecture
- [ ] Week 7: Advanced Restaurant Operations
- [ ] Week 8: Inventory Management System

### Phase 4: Delivery Integration (Weeks 9-10)
- [ ] Week 9: GrabFood, FoodPanda, LINE MAN APIs
- [ ] Week 10: Advanced Delivery Management

### Phase 5: Analytics & AI (Weeks 11-12)
- [ ] Week 11: Advanced Analytics & Reporting
- [ ] Week 12: AI-Powered Features

### Phase 6: Production (Weeks 13-14)
- [ ] Week 13: Mobile Applications
- [ ] Week 14: Production Readiness & Launch

## 🔒 Security & Compliance

- **PDPA Compliance**: Thai data protection laws
- **Encryption**: Data at rest and in transit
- **Access Control**: Role-based permissions
- **Audit Logging**: All data access tracked

## 🌍 Thai Market Features

- **Language Support**: Thai/English bilingual interface
- **Payment Methods**: PromptPay, TrueMoney, SCB Easy
- **Delivery Integration**: GrabFood, FoodPanda, LINE MAN
- **Cultural UX**: Thai restaurant workflow optimization
- **Local Compliance**: VAT, tax reporting, labor laws

## 📞 Support

- **Documentation**: `/docs` folder
- **GitHub Issues**: Bug reports and feature requests
- **Email**: support@thaitable.com (future)

---

**Made with ❤️ for Thai restaurants worldwide**

*Last updated: August 29, 2024*
