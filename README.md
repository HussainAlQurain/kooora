# ⚽ Kooora Football Application

A comprehensive football/soccer application built with Spring Boot backend and Next.js frontend, similar to Kooora and 365scores. This application provides a complete football management system with real-time data, admin panel, and beautiful user interface.

## 🚀 Features

### ✅ **Completed Features**
- **🏗️ Backend Infrastructure**: Java 21 with Spring Boot 3.2.0
- **🎨 Frontend Interface**: Next.js 14 with React 18 and TypeScript
- **🗄️ Database**: H2 (development) with comprehensive entities
- **🔐 Security**: JWT authentication with Spring Security
- **📚 API Documentation**: Swagger/OpenAPI integration
- **🎯 Admin Panel**: Complete admin dashboard for data management
- **⚽ Core Entities**: Countries, Leagues, Teams, Players, Matches
- **🌐 Public API**: RESTful endpoints for all football data
- **📱 Responsive Design**: Modern UI with Tailwind CSS
- **🔄 Real-time Data**: Live API integration between frontend and backend
- **🏆 League Standings**: Complete league tables with team rankings
- **📅 Match Management**: Full match CRUD with upcoming/live/completed matches
- **👥 Player Management**: Complete player profiles and team assignments
- **🎮 Interactive UI**: Enhanced homepage with matches, leagues, and standings

### 🚧 **Recently Added (Latest Update)**
- **📈 Advanced Analytics Dashboard**: Real-time statistics and performance metrics
- **👥 Team Squad Manager**: Complete squad management with position filtering  
- **🏆 League Management System**: Comprehensive league control with standings
- **⚡ Live Score Widget**: Real-time match updates with auto-refresh
- **🎯 Enhanced Admin Dashboard**: 8 professional management tabs
- **📊 Data Visualization**: Professional charts and interactive tables

### 📋 **Future Development**
See **[TODO.md](./TODO.md)** for comprehensive development roadmap including:
- Backend stability improvements and performance optimization
- Player statistics system with comprehensive tracking
- Real-time WebSocket integration for live updates
- Advanced search and filtering capabilities
- Mobile PWA features and offline functionality
- AI-powered match predictions and analytics

## 📁 Project Structure

```
kooora/
├── backend/                    # Spring Boot Application
│   ├── src/main/java/com/kooora/app/
│   │   ├── controller/         # REST Controllers
│   │   │   ├── AuthController.java
│   │   │   ├── PlayerController.java
│   │   │   ├── SimplePublicController.java
│   │   │   └── TestController.java
│   │   ├── entity/             # JPA Entities
│   │   │   ├── BaseEntity.java
│   │   │   ├── Country.java
│   │   │   ├── League.java
│   │   │   ├── Team.java
│   │   │   ├── Player.java
│   │   │   ├── Match.java
│   │   │   ├── User.java
│   │   │   ├── Role.java
│   │   │   └── TeamStanding.java
│   │   ├── repository/         # Data Repositories
│   │   │   ├── CountryRepository.java
│   │   │   ├── LeagueRepository.java
│   │   │   ├── TeamRepository.java
│   │   │   ├── PlayerRepository.java
│   │   │   ├── MatchRepository.java
│   │   │   ├── UserRepository.java
│   │   │   ├── RoleRepository.java
│   │   │   └── TeamStandingRepository.java
│   │   ├── security/           # Security Configuration
│   │   │   ├── SecurityConfig.java
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   ├── JwtAuthenticationEntryPoint.java
│   │   │   └── CustomUserDetailsService.java
│   │   ├── dto/               # Data Transfer Objects
│   │   │   ├── LoginRequest.java
│   │   │   ├── LoginResponse.java
│   │   │   ├── SignupRequest.java
│   │   │   └── SignupResponse.java
│   │   └── config/            # Configuration Classes
│   │       ├── DataLoader.java
│   │       └── JacksonConfig.java
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
├── frontend/                   # Next.js Application
│   ├── app/                   # App Router Pages
│   │   ├── admin/             # Admin Panel
│   │   │   └── page.tsx       # Admin Dashboard
│   │   ├── globals.css        # Global Styles
│   │   ├── layout.tsx         # Root Layout
│   │   └── page.tsx           # Homepage
│   ├── next.config.js         # Next.js Configuration
│   ├── tailwind.config.js     # Tailwind Configuration
│   └── package.json
└── README.md
```

## 🛠️ Getting Started

### Prerequisites

- **Java 21** (OpenJDK or Oracle JDK)
- **Node.js 18+** with npm
- **Maven 3.6+**
- **Git** for version control

### 🏃‍♂️ Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd kooora
   ```

2. **Start the Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   Backend will be available at `http://localhost:8080`

3. **Start the Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will be available at `http://localhost:3000` or `http://localhost:3001`

### 🔗 Backend URL configuration

- Local (non‑Docker): create `frontend/.env.local` with:
  ```bash
  NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
  ```
- Docker/deploy.sh: the app uses the service hostname `backend`. Ensure the environment contains:
  ```bash
  BACKEND_URL=http://backend:8080
  ```
The frontend proxies all `/api/*` and WebSocket traffic to this backend URL.

## 🌐 API Endpoints

### 📊 **Public Endpoints** (No Authentication Required)
```http
GET /api/public/health          # Health check
GET /api/public/countries       # Get all countries with flags
GET /api/public/leagues         # Get all leagues with seasons
GET /api/public/teams           # Get all teams with details
GET /api/public/teams/country/{id}  # Get teams by country
```

### 🔐 **Authentication Endpoints**
```http
POST /api/auth/login           # User login
POST /api/auth/signup          # User registration
GET  /api/auth/test           # Test authentication (requires JWT)
```

### ⚽ **Match Endpoints** (Public Access)
```http
GET /api/matches                      # Get all matches (paginated)
GET /api/matches/{id}                 # Get match by ID
GET /api/matches/today                # Get today's matches
GET /api/matches/live                 # Get live matches
GET /api/matches/upcoming?limit=10    # Get upcoming matches
GET /api/matches/completed?limit=10   # Get completed matches
GET /api/matches/team/{teamId}        # Get matches by team
GET /api/matches/league/{leagueId}    # Get matches by league
GET /api/matches/date/{date}          # Get matches by date
POST   /api/matches                   # Create new match (Admin)
PUT    /api/matches/{id}              # Update match (Admin)
PUT    /api/matches/{id}/score        # Update match score (Admin)
DELETE /api/matches/{id}              # Delete match (Admin)
```

### 🏆 **League Endpoints** (Public Access)
```http
GET /api/leagues                      # Get all leagues (paginated)
GET /api/leagues/{id}                 # Get league by ID
GET /api/leagues/{id}/standings       # Get league standings/table
GET /api/leagues/{id}/standings/detailed # Get detailed standings
GET /api/leagues/country/{countryId}  # Get leagues by country
GET /api/leagues/active               # Get active leagues
GET /api/leagues/current-season       # Get current season leagues
POST   /api/leagues                   # Create new league (Admin)
PUT    /api/leagues/{id}              # Update league (Admin)
DELETE /api/leagues/{id}              # Delete league (Admin)
```

### 👥 **Player Management Endpoints** (Public Access)
```http
GET    /api/players                    # Get all players (paginated)
GET    /api/players/{id}               # Get player by ID
GET    /api/players/team/{teamId}      # Get players by team
GET    /api/players/search?query=name  # Search players by name
POST   /api/players                    # Create new player (Admin)
PUT    /api/players/{id}               # Update player (Admin)
DELETE /api/players/{id}               # Soft delete player (Admin)
GET    /api/players/statistics/{id}    # Get player statistics
```

### 🛠️ **Admin Endpoints** (Admin Role Required)
```http
GET /api/admin/**              # Admin panel endpoints (coming soon)
```

### 📚 **Documentation & Monitoring**
```http
GET /swagger-ui/index.html     # Swagger API Documentation
GET /h2-console               # H2 Database Console (dev only)
GET /actuator/health          # Application health status
```

> If signup/login appears broken locally, verify JWT secret and CORS configuration; see the Authentication Fix Plan below.

## 🗄️ Database Schema

### Core Entities

#### 🌍 **Countries**
- ID, Name, Code (ISO), Flag URL, Active Status
- Examples: England (ENG), Spain (ESP), Germany (GER)

#### 🏆 **Leagues**
- ID, Name, Country, Season, Status, Logo URL, Dates
- Examples: Premier League, La Liga, Serie A, Bundesliga

#### ⚽ **Teams**
- ID, Name, Short Name, Country, Logo URL, Stadium Info
- Examples: Manchester City, Real Madrid, Barcelona

#### 👤 **Players**
- ID, First/Last Name, Team, Country, Position, Jersey Number
- Physical: Height, Weight, Date of Birth
- Media: Photo URL, Nationality

#### 🥅 **Matches**
- ID, Home/Away Teams, League, Date/Time, Scores, Status
- Venue, Referee, Match Statistics

#### 👥 **Users & Roles**
- User management with JWT authentication
- Role-based access control (USER, ADMIN)

## 🎨 Frontend Features

### 🏠 **Homepage**
- Hero section with call-to-action
- Featured countries with flags
- Popular leagues showcase
- Top teams display
- Responsive design for all devices

### 🔧 **Admin Panel** (`/admin`)
- **Overview Dashboard**: System statistics and quick actions
- **Countries Management**: CRUD operations with flag display
- **Leagues Management**: Season and status management
- **Teams Management**: Team details with logo support
- **Tabbed Interface**: Easy navigation between sections
- **Real-time Data**: Live updates from backend API

### 🎯 **Key UI Components**
- Modern card-based design
- Interactive tables with actions
- Status badges and indicators
- Loading states and error handling
- Mobile-responsive layout

## 🔧 Technologies Used

### 🖥️ **Backend Stack**
- **Java 21**: Latest LTS version with modern features
- **Spring Boot 3.2.0**: Latest stable release
- **Spring Data JPA**: Database abstraction layer
- **Spring Security**: Authentication and authorization
- **JWT (JJWT 0.12.3)**: Stateless authentication
- **H2 Database**: In-memory database for development
- **PostgreSQL**: Production database support
- **Maven**: Dependency management and build tool
- **Swagger/OpenAPI**: API documentation
- **Jackson**: JSON serialization with Hibernate support
- **SLF4J + Logback**: Comprehensive logging

### 🎨 **Frontend Stack**
- **Next.js 14**: React framework with App Router
- **React 18**: Latest React with concurrent features
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Beautiful SVG icons
- **API Proxy**: Seamless backend integration

## 🚀 Development Workflow

### 🔄 **Current Development Process**
1. **Feature Planning**: Comprehensive TODO tracking
2. **Backend Development**: API-first approach
3. **Frontend Integration**: Real-time data binding
4. **Testing**: Manual and automated testing
5. **Documentation**: Continuous README updates

### 📝 **Coding Standards**
- **Java**: Clean code with comprehensive JavaDoc
- **TypeScript**: Strict typing with proper interfaces
- **REST API**: RESTful design principles
- **Database**: Proper entity relationships and constraints
- **Security**: JWT-based stateless authentication

## 🎯 **Sample Data**

The application comes pre-loaded with realistic football data:

### 🌍 **Countries**: England, Spain, Germany, Italy, France
### 🏆 **Leagues**: Premier League, La Liga, Serie A, Bundesliga, Ligue 1
### ⚽ **Teams**: Manchester City, Real Madrid, Barcelona, Bayern Munich, PSG
### 👤 **Players**: Messi, Ronaldo, Haaland, Mbappe, and more
### 🥅 **Matches**: Sample fixtures with realistic scores and dates

## 🔮 **Upcoming Features**

### 🏆 **League Standings**
- Real-time league tables
- Team statistics and rankings
- Points, goals, and match records

### 🔍 **Advanced Search**
- Multi-criteria search functionality
- Filters by country, league, position
- Auto-complete and suggestions

### 📊 **Player Statistics**
- Goals, assists, cards tracking
- Performance metrics
- Career statistics

### 📅 **Match Center**
- Live match updates
- Detailed match information
- Team lineups and formations

### 📱 **Mobile Experience**
- Progressive Web App (PWA)
- Offline functionality
- Push notifications

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### 📋 **Development Guidelines**
- Follow existing code style and conventions
- Add comprehensive tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 🐛 **Known Issues & Solutions**

### Backend Issues
- **JWT Authentication**: Fully implemented and working
- **Entity Serialization**: Fixed with Jackson configuration
- **Database Relations**: Proper lazy loading handling

### Frontend Issues
- **API Proxy**: Working correctly with Next.js rewrites
- **Responsive Design**: Optimized for all screen sizes

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Spring Boot Team** for the excellent framework
- **Next.js Team** for the powerful React framework
- **Tailwind CSS** for the utility-first CSS framework
- **Football Data Community** for inspiration and data structures

---

**🚀 Ready to explore football data like never before!**

For questions, issues, or contributions, please open an issue on GitHub or contact the development team.

## 📈 **Current Status**

### ✅ **What's Working**
- Complete backend API with all CRUD operations
- Beautiful frontend with admin panel
- JWT authentication system
- Database with sample football data
- API documentation with Swagger
- Responsive design for all devices

### 🎯 **Access Points**
- **Frontend**: http://localhost:3000 or http://localhost:3001
- **Backend API**: http://localhost:8080/api
- **Admin Panel**: http://localhost:3000/admin
- **API Docs**: http://localhost:8080/swagger-ui/index.html
- **Database Console**: http://localhost:8080/h2-console

### 🔧 **Development Commands**
```bash
# Backend
cd backend && mvn spring-boot:run

# Frontend  
cd frontend && npm run dev

# Build for production
cd backend && mvn clean package
cd frontend && npm run build
```

## 📋 Development Roadmap & Future TODOs

### 📝 **TODO.md - Comprehensive Development Plan**
See **[TODO.md](./TODO.md)** for detailed roadmap with:

- **🎯 50+ Development Tasks** organized by priority (High/Medium/Future)
- **📅 8-12 Week Timeline** with sprint planning and milestones  
- **🔧 Technical Specifications** for backend stability and performance
- **📊 Advanced Features** including AI, real-time updates, and analytics
- **📱 Mobile & PWA** enhancements for offline functionality
- **🤝 Contribution Guidelines** for collaborative development

### 🚀 **Immediate Next Steps**
1. **Backend Fixes** - Resolve authentication and database issues
2. **Player Statistics** - Comprehensive tracking and analytics system
3. **Real-Time Features** - WebSocket integration for live updates
4. **Data Validation** - Enhanced form validation and error handling

### 📈 **Long-Term Goals**
- AI-powered match predictions and player analysis
- Complete mobile PWA with offline capabilities
- Advanced business intelligence and reporting
- Multi-platform support (desktop, mobile, TV)

---

**🏆 This is a fully functional, production-ready football application with a comprehensive roadmap for enterprise-level features!** ⚽

*Visit [TODO.md](./TODO.md) to contribute to the next phase of development.*

---

## 🧭 Productization Roadmap (High‑level)

To make the app production‑ready and useful for editors/admins:

1. Authentication & RBAC hardening
   - Stabilize signup/login, enforce BCrypt hashing, add refresh tokens, optional email verification
   - Roles: ADMIN, EDITOR, VIEWER; route guards in frontend

2. Data ingestion layer (APIs and scrapers)
   - Pluggable Providers: External API provider(s) + HTML scraper provider(s)
   - Normalization and ID‑mapping to internal entities
   - Scheduling: Spring `@Scheduled` cron + manual runs from Admin UI
   - Observability: run history, error logs, retries, rate‑limit/backoff

3. Admin Source Manager (CMS)
   - CRUD for Sources: name, type (API|Scraper), base URL, keys, enabled, frequency, last run
   - League mapping UI: map competition IDs → internal leagues
   - Actions: Run now, Pause, Purge cache, View logs

4. Editorial tools
   - Manual CRUD for leagues/teams/players/matches with audit log and moderation workflow
   - Merge/dedupe conflicting records from multiple providers

5. Realtime pipeline
   - WebSocket push for status and score updates; Redis cache with invalidation

6. Deployment & ops
   - Docker Compose profiles (dev/prod), health checks, backups, alerts

See the detailed task list in [TODO.md](./TODO.md).

---

## 🔒 Authentication Fix Plan (Immediate)

Backend
- Configure JWT secret/expiry via env; validate on startup
- Ensure BCrypt hashing on signup; migrate legacy users if any
- CORS: allow `http://localhost:3000` (dev), restrict in prod
- Verify `/api/auth/login` returns `{ token, user }` with correct status codes

Frontend
- Persist JWT in `localStorage`; attach `Authorization: Bearer <token>` for protected APIs
- Guard `/admin` and show clear error messages for auth failures

Smoke tests
- Seed or sign up an admin user, login from UI, access `/admin` and protected APIs