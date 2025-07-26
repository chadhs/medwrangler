# medwrangler

## About This Project

**MedWrangler** is a cloud-native medication tracking application built with React frontend and AWS serverless backend using SST (Serverless Stack Toolkit).

See a **live demo** in production here: WebsiteURL: https://d5vpzct3nl0o.cloudfront.net

### Architecture Overview

- **Frontend**: React 18 + TypeScript + Vite (SPA deployed to CloudFront)
- **Backend**: AWS Lambda functions + API Gateway + DynamoDB
- **Infrastructure**: SST deployment and infrastructure as code

### Core Features

#### 1. Medication Management (`/add-med`)
- Add new medications with names
- Edit existing medication names inline
- Delete medications from the system

#### 2. Dosing Schedules (`/schedule`)
- Create medication schedules with:
  - Frequency options: Every 4h, 6h, 8h, 12h, or 24h
  - Day-of-week selection (Sun-Sat)
  - Default start time: 8:00 AM
- Edit and delete existing schedules

#### 3. Dose Tracking Dashboard (`/` - Home)
- Shows upcoming doses for the next 24 hours
- Real-time calculation of next dose times based on schedules
- Checkbox interface to mark doses as taken/untaken

### Data Models

#### Medications
```typescript
interface Med {
  id: string;
  name: string;
}
```

#### Schedules
```typescript
interface ScheduleItem {
  id: string;
  medId: string;
  frequency: number; // hours between doses
  startTime: string; // ISO datetime
  days: number[];    // 0-6 (Sun-Sat)
}
```

#### Taken Doses
```typescript
interface TakenDose {
  id: string;
  scheduleId: string;
  doseTime: string;   // exact scheduled time
  takenAt: string;    // when marked as taken
}
```

### Backend API Endpoints

#### Medications
- `GET /meds` - List all medications
- `POST /meds` - Create medication
- `PUT /meds/{id}` - Update medication
- `DELETE /meds/{id}` - Delete medication

#### Schedules
- `GET /schedules` - List all schedules
- `POST /schedules` - Create schedule
- `PUT /schedules/{id}` - Update schedule
- `DELETE /schedules/{id}` - Delete schedule

#### Dose Tracking
- `GET /taken` - List all taken doses
- `POST /taken` - Mark dose as taken
- `DELETE /taken/{id}` - Unmark dose

## Design Choices

This project prioritizes rapid MVP development and demonstration over production-ready architecture. Here are the key tradeoffs made to build quickly while maintaining code quality:

### Scope Changes

**Choice**: Allowing Medication Removal vs Implementing Soft Deletes
- ✅ **Time savings**: - Cutting out “disabled” flags and extra query filters made implementation faster.
- ✅ **Simplified UX**: - Users see only active medications without needing a separate toggle or filter for hidden entries.
- ✅ **Schema simplicity**: - No extra boolean column or archive table required, so our data model and API endpoints stay lean.

**Trade-offs**:
- ❌ **Lost history**: - Hard deletes permanently remove any trace of the medication, so we can’t audit or analyze past entries
- ❌ **Compliance & auditing**: - Some regulatory or clinical scenarios require an audit trail.
- ❌ **Irreversible user errors**: - If someone accidentally deletes a medication, there is no “undo” or recovery path until we introduce soft-delete logic later.

### Database Architecture: DynamoDB over RDS

**Choice**: NoSQL DynamoDB with simple key-value storage
- ✅ **Instant scalability** without provisioning or connection pooling
- ✅ **Serverless-native** integration with Lambda functions
- ✅ **No schema migrations** - rapid iteration on data models
- ✅ **Cost-effective** for small datasets with pay-per-request pricing

**Tradeoffs**:
- ❌ **No relational queries** - had to implement medication-schedule joins in application code
- ❌ **Limited query patterns** - no complex filtering or aggregations
- ❌ **No ACID transactions** across multiple items (though single-item transactions work)

**Production upgrade path**: Migrate to RDS PostgreSQL for complex queries, reporting, and multi-user data integrity.

### Frontend Architecture: SPA over SSR

**Choice**: Single Page Application with client-side routing
- ✅ **Simplified deployment** - static files to CloudFront CDN
- ✅ **Rich interactivity** - instant navigation and real-time UI updates
- ✅ **API-first design** - clean separation between frontend and backend
- ✅ **Offline-capable** state management with localStorage

**Tradeoffs**:
- ❌ **SEO limitations** - no server-rendering for search engines
- ❌ **Initial bundle size** - all JavaScript loaded upfront
- ❌ **Client-side state complexity** - managing medication/schedule data sync

**Production upgrade path**: Migrate to Next.js or Remix for SSR, better SEO, and code splitting.

### Infrastructure: Serverless over Containers

**Choice**: AWS Lambda + API Gateway + DynamoDB serverless stack
- ✅ **Zero server management** - no EC2 instances, load balancers, or auto-scaling groups
- ✅ **Pay-per-use pricing** - cost scales with actual usage
- ✅ **Instant deployment** - SST handles all AWS resource provisioning
- ✅ **Built-in monitoring** - CloudWatch logs and metrics included

**Tradeoffs**:
- ❌ **Cold start latency** - first request to each Lambda can be slow
- ❌ **Vendor lock-in** - tightly coupled to AWS services
- ❌ **Limited runtime environment** - can't install system dependencies
- ❌ **Debugging complexity** - distributed traces across multiple services

**Production upgrade path**: Consider ECS Fargate or EKS for containerized services with more control and portability.

### Testing Strategy: Unit Tests over E2E

**Choice**: Comprehensive Jest unit tests for backend Lambda functions
- ✅ **Fast feedback loop** - tests run in milliseconds
- ✅ **High coverage** - 44 tests across all 11 backend functions
- ✅ **Reliable CI/CD** - no flaky browser dependencies
- ✅ **Easy debugging** - isolated test failures are simple to diagnose

**Tradeoffs**:
- ❌ **No integration testing** - API Gateway routing and DynamoDB integration not tested
- ❌ **No frontend testing** - React components and user workflows untested
- ❌ **No performance testing** - Lambda cold starts and API response times unknown

**Production upgrade path**: Add Cypress or Playwright E2E tests for critical user interactions and load testing for performance baselines.

### UI/UX Approach: Custom CSS over Component Libraries

**Choice**: Handwritten CSS with modern design system principles
- ✅ **Full design control** - exact styling without framework constraints
- ✅ **Lightweight bundle** - no Material-UI or Ant Design overhead
- ✅ **Custom branding** - consistent visual identity across all components
- ✅ **Modern aesthetics** - gradient backgrounds, card layouts, and micro-interactions

**Tradeoffs**:
- ❌ **Development time** - creating components from scratch vs using pre-built ones
- ❌ **Accessibility gaps** - missing keyboard navigation and screen reader support
- ❌ **Mobile responsiveness** - limited testing on different screen sizes
- ❌ **Browser compatibility** - modern CSS features may not work in older browsers

**Production upgrade path**: Adopt a design system like shadcn/ui or tailwind for accessibility, consistency, and faster feature development.

### Authentication: Demo-Only System

**Choice**: Frontend-only authentication with hardcoded demo credentials
- ✅ **Zero backend complexity** - no user management, password hashing, or JWT tokens
- ✅ **Instant demo access** - users can immediately explore features
- ✅ **No user registration flow** needed for MVP demonstration
- ✅ **localStorage persistence** for session management across browser refreshes

**Tradeoffs**:
- ❌ **Not secure** - credentials visible in source code
- ❌ **Single user model** - no multi-tenancy or user isolation
- ❌ **No password reset** or account management features
- ❌ **No audit trails** or user-specific data tracking

**Production upgrade path**: Implement AWS Cognito or Auth0 with proper user registration, multi-factor authentication, and role-based access control.


## development
### install dependencies and backend infra
```sh
cd frontend
npm install
cd ../backend
npm install
npx sst dev
```

### configure frontend
create a `.env.local` in the `frontend` directory and add the api url from the previous step
```.env
VITE_API_URL=https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com
```

now run `npm run dev`

you should now be able to visit http://localhost:3000

### running tests
```sh
cd backend
npm test
```

## production deploy
run sst to deploy prod
```sh
npx sst deploy --stage prod
```

ApiEndpoint: https://v27fusrpji.execute-api.us-east-2.amazonaws.com
WebsiteURL: https://d5vpzct3nl0o.cloudfront.net
