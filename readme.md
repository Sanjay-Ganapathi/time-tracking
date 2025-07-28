# Time Tracking Trial (T3) - An Insightful-like Product

This repository contains the submission for the Mercor Time Tracking Trial. It includes a backend API, a local Electron desktop application, and a web-based onboarding portal

## Project Structure

The project is a monorepo containing three distinct packages:

- `/backend`: A Node.js and Express server that acts as the main API. It handles business logic, database interactions, user management, and screenshot storage.
- `/frontend`: An Electron application built with React and Vite. This is the local time-tracking software for contractors.
- `/onboarding-web`: A simple React and Vite web app that allows new users to activate their accounts via a unique token.

## Tech Stack

- **Backend:**
  - Node.js & TypeScript
  - Express.js
  - Prisma ORM
  - SQLite for the database
- **Desktop App (Frontend):**
  - Electron
  - React & TypeScript
  - Vite
  - Tailwind CSS
- **Onboarding Web App:**
  - React & TypeScript
  - Vite build tool
  - Tailwind CSS

## Core Features

- **Full Authentication Flow:** Users authenticate with a unique, persistent API key.
- **User Onboarding:** New users are created in an inactive state with a unique `activationToken`. They can activate their account via the web portal.
- **Project & Task Management:** The API supports creating projects and assigning users. A default task is automatically created for each new project.
- **Live Time Tracking:** Users can select an assigned project and start/stop a timer to log their work. The UI provides live feedback of elapsed time.
- **High-Resolution Screenshot Capture:** While the timer is running, the local app automatically captures full-resolution screenshots at a regular interval and uploads them to the backend.
- **Production Build:** The desktop application is fully packaged into a distributable installer (`.exe` for Windows).

## How to Run the Project

You will need Node.js and `pnpm` (or `npm`/`yarn`) installed.

### 1. Backend Server

First, set up and run the backend API.

```bash

cd backend
# For storing screenshots
mkdir -p public/screenshots

pnpm install

pnpm prisma migrate dev

pnpm start
```

The API will be running at `http://localhost:3000`.

### 2. Desktop Application

In a new terminal, set up and run the local Electron app.

```bash
cd frontend

pnpm install

pnpm dev
```

The Electron application window should appear.

### 3. Onboarding Web App

In another new terminal, set up and run the web portal.

```bash
cd onboarding-web

pnpm install

pnpm dev
```

The web portal will be running at `http://localhost:5173` (or another available port).

## Full End-to-End Test Flow

1.  **Start the Backend Server.**
2.  **Create a User:** Use a tool like `curl` or Postman to `POST` to `http://localhost:3000/api/employees`.
    - **Body:** `{ "email": "test.user@example.com", "name": "Test User" }`
    - **Copy** the `apiKey` and `activationToken` from the response.
3.  **Activate the User:** Construct the activation URL (e.g., `http://localhost:5173/?token=YOUR_TOKEN_HERE`) and open it in a browser to activate the account.
4.  **Create a Project:** `POST` to `http://localhost:3000/api/projects`.
    - **Body:** `{ "name": "My First Project" }`
    - **Copy** the project `id` from the response.
5.  **Assign User to Project:** `POST` to `http://localhost:3000/api/projects/YOUR_PROJECT_ID/employees`.
    - **Body:** `{ "employeeId": "YOUR_EMPLOYEE_ID" }`
6.  **Launch and Log In:** Launch the desktop app and use the `apiKey` from Step 2 to log in.
7.  **Track Time:** The project should appear in the dropdown. Select it and start tracking. Screenshots will be saved to `backend/public/screenshots`.
