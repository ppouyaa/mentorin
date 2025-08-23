# Mentorship Platform

A comprehensive, multilingual mentorship platform built with Next.js, NestJS, and TypeScript. Connect mentors and mentees for personalized learning experiences with video calls, chat, scheduling, and more.

## 🌟 Features

### Core Features
- **Multilingual Support**: English and Farsi (RTL) from day one
- **Smart Matching**: AI-powered algorithm to connect mentors and mentees
- **Video Calls**: High-quality WebRTC video calls with screen sharing
- **Real-time Chat**: In-app messaging with voice notes and file sharing
- **Calendar Integration**: Google Calendar and Microsoft Outlook support
- **Flexible Scheduling**: Smart availability management with timezone support
- **Payment Processing**: Stripe integration for secure transactions
- **Goal Tracking**: Milestone tracking and progress monitoring

### Advanced Features
- **Group Sessions**: Multi-party mentoring and webinars
- **AI Meeting Notes**: Live transcription and action item extraction
- **Skill Assessments**: Mentor-authored quizzes and evaluations
- **Community Forums**: Q&A and knowledge sharing
- **Gamification**: Badges, points, and leaderboards
- **Referral System**: Tracked invites and rewards
- **Trust & Safety**: Moderation tools and reporting system

## 🏗️ Architecture

### Monorepo Structure
```
mentorship-platform/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # NestJS backend
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── types/               # Shared TypeScript types
│   ├── database/            # Prisma schema and client
│   └── config/              # Shared configuration
```

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Cache**: Redis
- **Video**: LiveKit (WebRTC)
- **Payments**: Stripe
- **Authentication**: NextAuth.js + JWT
- **Real-time**: Socket.IO
- **Queue**: BullMQ
- **Monitoring**: OpenTelemetry, Sentry

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm 10+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mentorship-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/mentorship"
   
   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # JWT
   JWT_SECRET=your-secret-key
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   
   # OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Email
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed the database
   npm run db:seed
   ```

5. **Start the development servers**
   ```bash
   # Start all services
   npm run dev
   
   # Or start individually
   npm run dev:web    # Frontend (http://localhost:3000)
   npm run dev:api    # Backend (http://localhost:3001)
   ```

## 📁 Project Structure

### Frontend (Next.js)
```
apps/web/src/
├── app/                    # App Router pages
│   ├── dashboard/         # Dashboard pages
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/            # Page-specific components
├── lib/                   # Utilities and configurations
├── hooks/                 # Custom React hooks
├── stores/                # State management (Zustand)
└── types/                 # TypeScript type definitions
```

### Backend (NestJS)
```
apps/api/src/
├── modules/               # Feature modules
│   ├── auth/              # Authentication
│   ├── users/             # User management
│   ├── offerings/         # Mentorship offerings
│   ├── bookings/          # Session bookings
│   ├── chat/              # Messaging system
│   ├── calls/             # Video calls
│   ├── payments/          # Payment processing
│   ├── matching/          # Mentor-mentee matching
│   └── notifications/     # Notification system
├── common/                # Shared utilities
└── config/                # Configuration files
```

### Shared Packages
```
packages/
├── ui/                    # Reusable UI components
│   ├── components/        # React components
│   └── lib/               # Utility functions
├── types/                 # Shared TypeScript types
│   ├── user.ts           # User-related types
│   ├── booking.ts        # Booking types
│   └── schemas.ts        # Zod schemas
└── database/              # Database layer
    ├── prisma/           # Prisma schema
    └── src/              # Database utilities
```

## 🔧 Development

### Available Scripts
```bash
# Build all packages
npm run build

# Development
npm run dev              # Start all services
npm run dev:web          # Start frontend only
npm run dev:api          # Start backend only

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Testing
npm run test             # Run all tests
npm run test:web         # Test frontend
npm run test:api         # Test backend

# Linting
npm run lint             # Lint all packages
npm run format           # Format code
```

### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks

## 🌐 Internationalization

The platform supports multiple languages with RTL support:

### Supported Languages
- **English** (LTR)
- **Farsi/Persian** (RTL)

### Implementation
- **Frontend**: `next-intl` for translations
- **Backend**: Locale-aware responses
- **Database**: Multi-language content storage
- **UI**: RTL-aware components with logical properties

## 🔐 Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- OAuth integration (Google, Microsoft)
- Session management

### Data Protection
- Input validation with Zod
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF protection
- Rate limiting

### Privacy
- GDPR/CCPA compliance
- Data encryption at rest
- Secure API endpoints
- User consent management

## 📊 Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Sentry integration
- **Performance**: OpenTelemetry metrics
- **Logging**: Structured logging with correlation IDs
- **Health Checks**: Endpoint monitoring

### Business Analytics
- User engagement metrics
- Session completion rates
- Mentor-mentee matching success
- Revenue tracking

## 🚀 Deployment

### Production Setup
1. **Environment Configuration**
   - Set production environment variables
   - Configure SSL certificates
   - Set up monitoring

2. **Database Migration**
   ```bash
   npm run db:migrate:deploy
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   npm run start:prod
   ```

### Deployment Options
- **Vercel**: Frontend deployment
- **Railway/Render**: Backend deployment
- **Docker**: Containerized deployment
- **Kubernetes**: Scalable deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the established code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.mentorship-platform.com](https://docs.mentorship-platform.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/mentorship-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/mentorship-platform/discussions)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- NestJS team for the robust backend framework
- Prisma team for the excellent ORM
- All contributors and mentors who helped shape this platform