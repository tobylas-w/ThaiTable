# ThaiTable Restaurant Management System

A comprehensive restaurant management system designed specifically for Thai restaurants, featuring bilingual Thai/English support, local payment methods, and cultural UX considerations.

## 🚀 Features

### Core Functionality
- **Multi-tenant Restaurant Management** - Support for multiple restaurants
- **Bilingual Interface** - Complete Thai/English language support
- **Menu Management** - Full CRUD operations with categories and pricing
- **Order Management** - Real-time order tracking and status updates
- **Table Management** - Floor plan and reservation system
- **User Management** - Role-based access control (Owner, Manager, Staff)

### Thai Market Features
- **Local Payment Methods** - PromptPay, TrueMoney, SCB Easy, LINE Pay
- **Thai Business Rules** - VAT calculations, tax ID validation
- **Cultural UX** - Thai color preferences, navigation patterns
- **Local Integrations** - GrabFood, FoodPanda, LINE MAN APIs
- **Thai Currency** - Proper ฿ formatting and calculations

### Technical Features
- **Real-time Updates** - WebSocket integration for live order updates
- **Mobile-First Design** - Optimized for tablets and mobile devices
- **Offline Support** - PWA capabilities for unreliable connections
- **Analytics Dashboard** - Sales reports and business insights
- **Multi-platform** - Web, Desktop (Electron), Mobile (React Native)

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript 5** - Modern React with type safety
- **Vite 4** - Fast build tool and development server
- **Tailwind CSS 3** - Utility-first CSS framework
- **Zustand 4** - Lightweight state management
- **React Hook Form** + **Zod** - Form handling and validation
- **React Router 6** - Client-side routing
- **react-i18next** - Internationalization

### Backend
- **Node.js 20** + **TypeScript 5** - Server runtime
- **Express.js 4.18** - Web framework
- **PostgreSQL 15** - Primary database
- **Prisma ORM 5.6** - Database toolkit
- **JWT** + **bcrypt** - Authentication and security
- **Redis 7.0** - Caching and sessions

### Infrastructure
- **Railway** - Backend hosting and PostgreSQL
- **Vercel** - Frontend hosting and CDN
- **CloudFlare** - DNS and additional CDN
- **AWS S3** - File storage for images

## 📦 Installation

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/thaitable.git
   cd thaitable
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cd backend
   cp env.example .env
   # Edit .env with your database URL and JWT secret

   # Frontend environment
   cd ../frontend
   cp .env.example .env
   # Edit .env with your API base URL
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Health: http://localhost:3000/health

## 🏗️ Project Structure

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
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── i18n/          # Internationalization
│   │   └── App.tsx        # Main app component
│   └── package.json
├── docs/                   # Documentation
└── README.md
```

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
```

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

### Code Quality

The project uses:
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Husky** - Git hooks for pre-commit checks

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🌐 API Documentation

### Base URL
- Development: `http://localhost:3000/api/v1`
- Production: `https://api.thaitable.com/api/v1`

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh token

#### Restaurants
- `GET /restaurant/:id` - Get restaurant details
- `POST /restaurant` - Create restaurant
- `PUT /restaurant/:id` - Update restaurant
- `GET /restaurant/:id/stats` - Get restaurant statistics

#### Menu Management
- `GET /menu/:restaurantId` - Get menu items
- `POST /menu` - Create menu item
- `PUT /menu/:id` - Update menu item
- `DELETE /menu/:id` - Delete menu item

#### Order Management
- `GET /order/restaurant/:restaurantId` - Get orders
- `POST /order` - Create order
- `PATCH /order/:id/status` - Update order status
- `GET /order/:id` - Get order details

## 🚀 Deployment

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically on push to main branch

### Frontend (Vercel)
1. Import GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Set environment variables
4. Deploy automatically on push to main branch

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV=production
```

#### Frontend (.env)
```env
VITE_API_BASE_URL="https://api.thaitable.com/api/v1"
VITE_APP_NAME="ThaiTable"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: support@thaitable.com
- **Documentation**: [docs.thaitable.com](https://docs.thaitable.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/thaitable/issues)

## 🙏 Acknowledgments

- Thai restaurant owners for feedback and requirements
- Open source community for amazing tools and libraries
- Thai developers for cultural insights and UX guidance

---

**Made with ❤️ for Thai restaurants worldwide**
