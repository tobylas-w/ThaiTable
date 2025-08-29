# ThaiTable Documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Git

### Development Setup

1. **Clone and Install**
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

4. **Database Setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   ```

## 📁 Project Structure

```
ThaiTable/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── config/         # Environment & app config
│   │   ├── middleware/     # Auth & validation middleware
│   │   ├── routes/         # API route handlers
│   │   └── index.ts        # Server entry point
│   ├── prisma/             # Database schema & migrations
│   └── package.json
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── pages/          # React components
│   │   ├── styles/         # Global CSS & Tailwind
│   │   └── main.tsx        # App entry point
│   └── package.json
├── .github/                # CI/CD workflows
└── docs/                   # Documentation
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

## 🗄️ Database Schema

### Core Entities
- **Restaurant**: Multi-tenant restaurant data
- **User**: Staff accounts with role-based access
- **Menu**: Food items with Thai/English names
- **Order**: Order tracking and status management

### Key Features
- Multi-tenant data isolation
- Thai language support (UTF-8)
- Audit trails and soft deletes
- Optimized indexing for search

## 🔐 Authentication

### JWT Flow
1. User login → bcrypt password verification
2. Generate JWT with user ID and role
3. Refresh token for session management
4. Middleware validates tokens on protected routes

### Role-Based Access
- **OWNER**: Full restaurant management
- **MANAGER**: Staff and menu management
- **STAFF**: Order taking and basic operations
- **ADMIN**: System administration

## 🌐 API Endpoints

### Base URL
- Development: `http://localhost:3000`
- Production: `https://api.thaitable.com`

### Core Routes
- `GET /health` - Service health check
- `POST /auth/login` - User authentication
- `GET /auth/me` - Current user info
- `POST /auth/refresh` - Token refresh

### Menu Management
- `GET /api/menus` - List menu items
- `POST /api/menus` - Create menu item
- `PUT /api/menus/:id` - Update menu item
- `DELETE /api/menus/:id` - Delete menu item

## 🚀 Deployment

### Railway (Backend)
1. Connect GitHub repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically on push

### Vercel (Frontend)
1. Import GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy automatically on push

## 📊 Development Workflow

### Daily Process
1. **Morning Planning** (30 min)
   - Review yesterday's progress
   - Plan today's tasks
   - Update project status

2. **Development Sessions** (8 hours)
   - Backend API development
   - Frontend UI implementation
   - Integration testing
   - Code review and polish

3. **Evening Review** (30 min)
   - Commit and push changes
   - Update documentation
   - Plan next day's priorities

### AI-Assisted Development
- **Cursor IDE**: Primary coding environment
- **Claude**: Complex logic and architecture
- **V0.dev**: UI component generation
- **GitHub Copilot**: Code completion

## 🧪 Testing Strategy

### Backend Testing
- Unit tests for business logic
- Integration tests for API endpoints
- Database migration testing
- Authentication flow testing

### Frontend Testing
- Component unit tests
- User interaction testing
- Responsive design testing
- Cross-browser compatibility

### Thai Market Testing
- Thai language rendering
- Local payment method testing
- Cultural UX validation
- Performance on Thai networks

## 📈 Monitoring & Analytics

### Application Monitoring
- **Sentry**: Error tracking and performance
- **UptimeRobot**: Service availability
- **Railway Metrics**: Infrastructure monitoring

### Business Analytics
- **Mixpanel**: User behavior tracking
- **Google Analytics**: Traffic analysis
- **Custom Dashboards**: Restaurant-specific metrics

## 🔒 Security

### Data Protection
- **PDPA Compliance**: Thai data protection laws
- **Encryption**: Data at rest and in transit
- **Access Control**: Role-based permissions
- **Audit Logging**: All data access tracked

### API Security
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize all inputs
- **CORS Configuration**: Secure cross-origin requests
- **HTTPS Only**: Encrypted communication

## 🌍 Localization

### Thai Language Support
- **UTF-8 Encoding**: Full Thai character support
- **Thai Fonts**: Google Fonts integration
- **Date/Time**: Buddhist calendar support
- **Currency**: Thai Baht formatting

### Cultural Adaptations
- **Color Scheme**: Thai cultural preferences
- **Navigation**: Local UX patterns
- **Workflow**: Thai restaurant processes
- **Holidays**: Buddhist calendar integration

## 📞 Support

### Documentation
- **API Docs**: Swagger/OpenAPI
- **User Manual**: Thai and English
- **Video Tutorials**: Staff training
- **FAQ**: Common questions

### Contact
- **Email**: support@thaitable.com
- **LINE**: @ThaiTableSupport
- **Phone**: +66-2-XXX-XXXX
- **Hours**: 24/7 support available

---

**Made with ❤️ for Thai restaurants worldwide**
