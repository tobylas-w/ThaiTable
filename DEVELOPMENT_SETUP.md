# ThaiTable Development Setup Guide

## 🚀 Current Status

### ✅ Completed Setup
- **Backend**: Express.js + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Internationalization**: Thai/English support with react-i18next
- **Authentication**: JWT-based auth system
- **API Structure**: Complete REST API with routes for auth, menu, orders, restaurants
- **Database Schema**: Prisma schema with Thai market considerations
- **Basic UI**: Layout, Dashboard, Login pages with Thai language support

### 🔧 Development Environment Ready
- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:5173`
- **Database**: PostgreSQL (configure in backend/.env)
- **API Base**: `http://localhost:3000/api/v1`

## 📋 Next Steps for Claude

### 1. **Complete Frontend Pages** (Priority: High)
**Files to implement:**
- `frontend/src/pages/MenuManagement.tsx` - Full CRUD interface for menu items
- `frontend/src/pages/OrderManagement.tsx` - Order tracking and management
- `frontend/src/pages/RestaurantSetup.tsx` - Restaurant onboarding flow

**Requirements:**
- Thai/English bilingual interface
- Form validation with Zod
- React Hook Form integration
- Mobile-responsive design
- Real-time updates where needed

### 2. **Backend API Integration** (Priority: High)
**Connect frontend to backend APIs:**
- Menu CRUD operations
- Order management
- Restaurant setup
- User management
- Authentication flow

**Files to update:**
- `frontend/src/services/menu.ts` (create)
- `frontend/src/services/orders.ts` (create)
- `frontend/src/services/restaurants.ts` (create)

### 3. **Database Setup** (Priority: Medium)
**Current status:** Schema defined, needs migration
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. **Authentication Flow** (Priority: High)
**Implement protected routes:**
- Route guards for authenticated users
- Redirect to login if not authenticated
- Role-based access control
- Token refresh mechanism

### 5. **Thai Market Features** (Priority: Medium)
**Implement Thai-specific functionality:**
- Thai currency formatting (฿)
- Thai date/time handling
- Thai address validation
- Thai business rules (VAT, etc.)

## 🛠️ Technical Stack

### Backend
- **Runtime**: Node.js 20 + TypeScript 5
- **Framework**: Express.js 4.18
- **Database**: PostgreSQL 15 + Prisma ORM
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, rate limiting

### Frontend
- **Framework**: React 18 + TypeScript 5
- **Build Tool**: Vite 4
- **Styling**: Tailwind CSS 3
- **State**: Zustand 4
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios with interceptors
- **I18n**: react-i18next
- **Icons**: Lucide React

## 📁 Project Structure

```
ThaiTable/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes (auth, menu, orders, restaurants)
│   │   ├── config/          # Environment config
│   │   └── index.ts         # Server entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── i18n/           # Internationalization
│   │   └── App.tsx         # Main app component
│   └── package.json
└── README.md
```

## 🎯 Implementation Priorities

### Phase 1: Core Functionality (Week 1)
1. **Complete Menu Management**
   - Add/Edit/Delete menu items
   - Category management
   - Image upload (AWS S3 integration)
   - Thai/English names and descriptions

2. **Order Management System**
   - Create new orders
   - Order status tracking
   - Table management
   - Kitchen display system

3. **Authentication & Authorization**
   - Protected routes
   - Role-based access
   - User management

### Phase 2: Thai Market Features (Week 2)
1. **Thai Payment Integration**
   - PromptPay QR codes
   - Thai currency handling
   - VAT calculations

2. **Thai Business Rules**
   - Thai receipt format
   - Thai address validation
   - Thai business hours

### Phase 3: Advanced Features (Week 3)
1. **Analytics & Reporting**
   - Sales reports
   - Popular items
   - Revenue tracking

2. **Mobile Optimization**
   - Touch-friendly interface
   - Offline capabilities
   - PWA setup

## 🔗 API Endpoints Ready

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Menu Management
- `GET /api/v1/menu/:restaurantId` - Get menu items
- `POST /api/v1/menu` - Create menu item
- `PUT /api/v1/menu/:id` - Update menu item
- `DELETE /api/v1/menu/:id` - Delete menu item

### Order Management
- `GET /api/v1/order/restaurant/:restaurantId` - Get orders
- `POST /api/v1/order` - Create order
- `PATCH /api/v1/order/:id/status` - Update order status
- `GET /api/v1/order/:id` - Get order details

### Restaurant Management
- `GET /api/v1/restaurant/:id` - Get restaurant
- `POST /api/v1/restaurant` - Create restaurant
- `PUT /api/v1/restaurant/:id` - Update restaurant
- `GET /api/v1/restaurant/:id/stats` - Get statistics

## 🚀 Getting Started

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Setup Database
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health**: http://localhost:3000/health

## 📝 Notes for Claude

1. **Thai Language Support**: All UI text is already translated in `frontend/src/i18n/locales/`
2. **API Integration**: Use the existing `api.ts` service for all HTTP requests
3. **Styling**: Use Tailwind CSS classes, custom components defined in `App.css`
4. **Forms**: Use React Hook Form + Zod for validation
5. **State Management**: Use Zustand for global state (create stores as needed)
6. **Error Handling**: Implement proper error boundaries and user feedback
7. **Mobile First**: Design for mobile devices first, then desktop
8. **Thai UX**: Consider Thai user behavior and cultural preferences

## 🎨 Design Guidelines

- **Colors**: Yellow (#F59E0B) primary, Gray scale for UI
- **Typography**: Inter for English, Sarabun for Thai
- **Spacing**: Tailwind spacing scale
- **Components**: Consistent with existing Dashboard design
- **Icons**: Lucide React icons throughout

## 🔒 Security Considerations

- JWT tokens stored in localStorage
- API rate limiting implemented
- CORS configured for development
- Input validation with Zod
- SQL injection protection via Prisma

---

**Ready for Claude to continue development! 🚀**
