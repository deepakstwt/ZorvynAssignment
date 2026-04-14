# CashFlowOS: Financial Processing System Backend
[🏠 Back to Main Overview](../README.md)


[![NestJS](https://img.shields.io/badge/Framework-NestJS-red)](#)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)](#)
[![Swagger](https://img.shields.io/badge/API-Swagger-blue)](#)

A high-performance backend system for tracking financial data and providing real-time dashboard aggregations. This system enforces strict **Role-Based Access Control (RBAC)** to ensure data security and integrity across different user tiers (Admin, Analyst, Viewer).

---

## 🏗 System Architecture

The backend is built with a modular NestJS architecture, maintaining a clean separation of concerns across the following layers:
- **Controller Layer**: Handles routing, request mapping, and Swagger documentation.
- **Service Layer**: Implements business logic, transaction handling, and aggregation.
- **Data Layer (Mongoose)**: Manages schema definitions, indexing, and MongoDB connectivity.
- **Guard Layer**: Enforces JWT authentication and RBAC permissions.

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or via Atlas)
- npm or yarn

### 2. Environment Configuration
Create a `.env` file in the `finance-dashboard-backend` directory:
```env
MONGODB_URI=mongodb://localhost:27017/cashflowos
JWT_SECRET=your_super_secret_jwt_key
PORT=3000
```

### 3. Dependencies & Seeding
```bash
# Install packages
npm install

# Seed the database with sample transactions (Optional but recommended)
npm run seed
```

### 4. Running the Application
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

---

## 📡 API Reference & Modules

### 1. **Authentication (/auth)**
- `POST /auth/register`: Create a new user account.
- `POST /auth/login`: Authenticate and receive a JWT token.

### 2. **Finance Records (/finance)**
- `POST /finance`: Create a new financial record (**Admin/Analyst** only).
- `GET /finance`: Retrieve transaction ledger with filtering & pagination.
- `GET /finance?export=true`: Export the current ledger view as a CSV.
- `PATCH /finance/:id`: Update an existing record (**Admin** only).
- `DELETE /finance/:id`: Soft delete a record (**Admin** only).

### 3. **Dashboard Analytics (/dashboard)**
- `GET /dashboard/all`: Unified dataset containing summaries, categories, and monthly trends.
- `GET /dashboard/summary`: Quick stats (Total Income, Total Expense, Net Balance).
- `GET /dashboard/categories`: Breakdown of spending/income by category.
- `GET /dashboard/trends`: Time-series data for monthly performance.

---

## 📘 Interactive Documentation (Swagger)

The API is fully documented using the OpenAPI specification. Access the interactive Swagger UI to explore and test endpoints:
*For local development, visit `http://localhost:3000/api`.*

---

## 👥 Invite-Based Onboarding & RBAC

CashFlowOS utilizes a secure, organization-centric onboarding flow governed by Role-Based Access Control (RBAC).

### **1. The Lifecycle**
1. **Organization Creation**: An Admin registers *without* an invite code. The system automatically creates a new `organizationId` and a unique `inviteCode` for their workspace.
2. **Team Invitation**: The Admin generates role-specific invite links (Analyst or Viewer) and shares them with their team.
   - Example Link: `/register?code=XXXX&role=viewer`
3. **User Onboarding**: New users register via the invite link. The system validates the code, inherits the `organizationId`, and assigns the pre-defined role.

### **2. Security Posture**
- **Backend-Enforced Roles**: Role assignment is controlled strictly by the backend. Even if a user attempts to manually select "Admin" during an invite-based signup, the system will block the request to prevent privilege escalation.
- **Role Restrictions**:
  - **Viewer**: Read-only access to the dashboard and ledger.
  - **Analyst**: Access to view and create new financial records.
  - **Admin**: Full control over records (CRUD) and team management.

### **3. Data Model**
- **Organization-Wide Sharing**: All data (transactions, summaries, trends) is shared across the entire organization. Every user sees the same dashboard metrics; roles simply define which actions (e.g., Redaction, Editing) are available.

---

## 🧠 Technical Assumptions & Tradeoffs

### Assumptions
- **Unified Ledger**: Financial records are globally visible within the application for all authenticated users, but operations (Create/Update/Delete) are strictly governed by user roles.
- **RBAC Over Permissions**: We opted for a role-based model (Viewer, Analyst, Admin) instead of individual permissions to simplify administrative workflows.

### Tradeoffs
- **MongoDB Aggregation Pipelines**: We use heavy-duty `$facet` and `$group` aggregations at the database level. While this increases query complexity, it significantly boosts performance by reducing the volume of data transferred and processed at the application level.
- **JWT Statelessness**: Chosen for horizontal scalability and simplicity. We do not currently track token blacklisting, assuming standard short-lived expiry windows.
- **Soft Delete Logic**: Records are marked `isDeleted: true` to preserve historical data. This maintains audit logs while hiding records from the active UI, at the cost of requiring an extra filter in all aggregation pipelines.

---

## 🛠 Project Structure
```text
finance-dashboard-backend/
├── src/
│   ├── auth/          # JWT Strategies, Guards, and Auth Controllers
│   ├── modules/       
│   │   ├── finance/   # CRUD, DTOs, and CSV logic
│   │   └── dashboard/ # Aggregation pipelines and metrics
│   ├── users/         # User schemas and roles
│   ├── common/        # Shared interceptors and decorators
│   └── main.ts        # Entry point with global pipes & Swagger config
└── scripts/           # Database seeding and utility scripts
```
