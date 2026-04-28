# CashFlowOS: Modern Financial Management System

[![Aesthetics](https://img.shields.io/badge/Aesthetics-Premium-blueviolet)](#)
[![Stack](https://img.shields.io/badge/Stack-Next.js%20|%20NestJS%20|%20MongoDB-blue)](#)
[![Documentation](https://img.shields.io/badge/API-Swagger-green)](#api-overview)
[![Deployed](https://img.shields.io/badge/Deployed-Vercel%20|%20Render-success)](#)

A high-fidelity, enterprise-grade financial dashboard designed for real-time tracking, advanced aggregations, and secure data management. This project is split into a robust **NestJS Backend** and a sleek **Next.js Frontend**.

---

## 🌍 Live Deployment

Experience the full-stack CashFlowOS ecosystem in production:
- 🚀 **[CashFlowOS Dashboard (Live)](https://cashflow-os-final.vercel.app)**
- 📡 **[CashFlowOS API Docs (Swagger)](https://cashflow-backend-final.onrender.com/api)**
- 🛠 **Backend Service**: [https://zorvynassignment-1z56.onrender.com](https://cashflow-backend-final.onrender.com)

### 🏁 Test Credentials
You can use the following pre-registered user to test the dashboard immediately:
- **Email**: `deepak_test@gmail.com`
- **Password**: `password123`

---

## 🚀 Quick Start

### 📖 Detailed Documentation
For in-depth technical details, please refer to the specific module documentation:
- 🔗 **[Backend System Documentation](./finance-dashboard-backend/README.md)**
- 🔗 **[Frontend Application Documentation](./finance-dashboard-frontend/README.md)**

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd finance-dashboard-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```
4. Run the development server:
   ```bash
   npm run start:dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd finance-dashboard-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:3001`.

---

## 🛠 Tech Stack

### Backend (NestJS)
- **Framework**: NestJS (Node.js) for a modular, scalable architecture.
- **Database**: MongoDB with Mongoose ODM for flexible financial records.
- **Security**: JWT-based authentication with Passport.js and Role-Based Access Control (RBAC).
- **Validation**: Strict schema validation using `class-validator`.
- **API Documentation**: Automated Swagger/OpenAPI documentation.

### Frontend (Next.js)
- **Framework**: Next.js 15+ (App Router) for high-performance rendering.
- **Styling**: Tailwind CSS for a minimalist, premium dark-mode aesthetic.
- **Visuals**: Recharts for dynamic financial data visualization.
- **State Management**: React Hooks & Axios for efficient API interaction.

---

## 📡 API Overview

The backend exposes a RESTful API with the following primary modules:

### Core Endpoints
- **Auth**: `/auth/login`, `/auth/register` (JWT-based session management).
- **Finance**: `/finance` (CRUD operations for transactions, CSV export).
- **Dashboard**: `/dashboard/all` (Aggregated metrics, category breakdowns, and trends).

### Interactive Documentation
A full interactive API reference is available via Swagger. Visit the live production documentation:
👉 **[https://zorvynassignment-1z56.onrender.com/api](https://zorvynassignment-1z56.onrender.com/api)**

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

## 🧠 Architectural Assumptions & Tradeoffs

### Assumptions Made
1. **Shared Organizational Pool**: We assume financial data is shared across the organization rather than strictly siloed by user, though RBAC (Admin/Analyst/Viewer) controls the level of interaction.
2. **Soft Deletion Protocol**: Transactions are never physically deleted to maintain an audit trail. Instead, an `isDeleted` flag is used.
3. **Stateless Authentication**: We utilize JWT for authentication to ensure the backend remains stateless and horizontally scalable.

### Tradeoffs Considered
1. **NestJS vs. Express**: We chose NestJS for its modularity and built-in support for TypeScript/Decorators, which provides a more robust foundation for enterprise apps despite slightly higher initial boilerplate.
2. **Server-Side Aggregations**: We offload complex calculations (totals, trends) to MongoDB aggregation pipelines. This prioritizes database efficiency and reduces payload sizes, though it requires more complex query logic.
3. **Tailwind CSS**: Chosen for rapid prototyping and consistent design tokens, allowing for a premium custom-built look without the overhead of heavy component libraries.

---

## 📈 Future Roadmaps
- [ ] **Advanced Audit Logs**: Dedicated UI for tracking changes to financial records.
- [ ] **Multi-Currency Support**: Real-time currency conversion for global transactions.
- [ ] **Advanced Exports**: Supporting PDF report generation and automated email summaries.

---

*This project was built with a focus on visual excellence and technical rigor.*
