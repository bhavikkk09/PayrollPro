# PayrollPro HRMS - Enterprise Human Resource & Payroll Management System

PayrollPro HRMS is a production-ready, full-stack HRMS and Payroll enterprise application built on modern React, Node.js, Express, and Tailwind CSS. It features multi-tenant SaaS superadmin portal support, Frappe HR-compatible employee masters, interactive biometric attendance grids, a step-by-step 7-phase statutory Indian payroll engine (PF, ESI, LWF, Professional Tax, TDS), CSV bulk import utilities, and integrated Gemini AI HR Assistant support.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Option 1: Local Host Setup (Node.js)](#-option-1-local-host-setup-nodejs)
- [Option 2: Docker Setup (Docker & Docker Compose)](#-option-2-docker-setup-docker--docker-compose)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- **Multi-Tenant SaaS SuperAdmin Portal**: Impersonation login, tenant provisioning, domain routing, and subscription management.
- **Employee Master Directory**: Full Frappe HR DocType compatibility with CSV Bulk Employee Import & schema validation.
- **Biometric Attendance Grid**: Monthly daily matrix with automated missing-punch resolution and CSV export.
- **7-Phase Statutory Payroll Engine**: Auto-computes Basic, HRA, Special Allowance, Provident Fund (PF), ESI, PT, TDS, and Net Pay with salary slip generation.
- **Leave & Attendance Management**: Flexible leave ledger (CL, SL, PL, Comp-Off), request workflows, and holiday calendar.
- **Compliance & Statutory Hub**: ECR file generator for EPFO, ESIC portal upload formatting, Form 16, and PT returns.
- **Gemini AI HR Assistant**: AI-powered query resolver for HR policies, offer letter drafting, and labor law compliance.

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons
- **Backend / Server**: Node.js, Express, esbuild / tsx
- **Parsing & Utilities**: PapaParse (CSV Parsing), Recharts (Analytics)
- **Containerization**: Docker, Docker Compose

---

## 📌 Prerequisites

Before installing, ensure you have the following installed on your machine:

- **Node.js**: `v18.x` or `v20.x` or higher
- **npm**: `v9.x` or `v10.x` or higher
- *(Optional for Docker deployment)* **Docker Desktop** / **Docker Engine**: `v24.x` or higher and **Docker Compose**: `v2.x` or higher

---

## 💻 Option 1: Local Host Setup (Node.js)

Follow these steps to run PayrollPro HRMS directly on your local host:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/payrollpro-hrms.git
cd payrollpro-hrms
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` to include your API keys (optional for local testing):
```env
# Gemini API Key for AI HR Assistant
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. Start Development Server
Run the local development server:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

### 5. Build & Run Production Mode Locally
To build and run the production server bundle:
```bash
# Build Vite client assets and esbuild server bundle
npm run build

# Start production Express server
npm start
```

---

## 🐳 Option 2: Docker Setup (Docker & Docker Compose)

You can containerize and run the entire application smoothly using Docker.

### Method A: Docker Compose (Recommended)

#### 1. Build and Start the Container
Run the following command in the project root:

```bash
docker-compose up --build -d
```

This command will:
- Build the multi-stage Docker image using `Dockerfile`
- Bundle static assets and node modules
- Expose port `3000` on your localhost
- Start the server container in detached mode

#### 2. Access the Application
Open your web browser and visit:
```
http://localhost:3000
```

#### 3. Stop the Docker Container
```bash
docker-compose down
```

---

### Method B: Standard Docker CLI

If you prefer building and running with Docker directly without Docker Compose:

#### 1. Build the Docker Image
```bash
docker build -t payrollpro-hrms:latest .
```

#### 2. Run the Container
```bash
docker run -d \
  --name payrollpro_app \
  -p 3000:3000 \
  -e GEMINI_API_KEY="your_gemini_api_key_here" \
  payrollpro-hrms:latest
```

#### 3. Check Logs or Stop Container
```bash
# View container logs
docker logs -f payrollpro_app

# Stop and remove container
docker stop payrollpro_app
docker rm payrollpro_app
```

---

## 🔑 Environment Variables

| Variable | Description | Required | Default |
|---|---|---|---|
| `PORT` | Web server listening port | No | `3000` |
| `GEMINI_API_KEY` | Google Gemini API Key for AI HR Assistant | Optional | None |
| `NODE_ENV` | Environment mode (`development` / `production`) | No | `development` |

---

## 📜 Available Scripts

In the project directory, you can run:

- `npm run dev`: Launches the server in development mode using `tsx server.ts`.
- `npm run build`: Builds the Vite frontend into `dist/` and compiles `server.ts` into `dist/server.cjs` via `esbuild`.
- `npm start`: Runs the compiled production server (`node dist/server.cjs`).
- `npm run lint`: Executes TypeScript type checking (`tsc --noEmit`).

---

## ❓ Troubleshooting

1. **Port 3000 is already in use**:
   - Stop any existing process running on port 3000 or kill the process using `npx kill-port 3000`.
2. **Missing `GEMINI_API_KEY`**:
   - The core HRMS, payroll calculation, attendance, and employee import functions will work seamlessly without an API key. The Gemini AI Assistant feature requires `GEMINI_API_KEY` set in your `.env` or Docker environment variables.
3. **Docker Build fails during npm ci**:
   - Ensure you are running Docker with internet access to pull npm packages.

---

## 📄 License

This project is open-source under the MIT License.
