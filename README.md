# TaskSync: Team Task Manager

TaskSync is a modern, full-stack team task management application built with Next.js 15, MongoDB, and React. It features a robust role-based access control system, a sleek dark-mode UI, and an interactive Kanban board for managing project tasks.

## 🚀 Features

- **Authentication & Authorization**: Secure JWT-based authentication using HTTP-only cookies. Users are assigned either an `ADMIN` or `MEMBER` role upon registration.
- **Project Management**: Admins can create new projects and assign team members. Members can only view projects they have been assigned to.
- **Task Board (Kanban)**: Organize tasks into `TODO`, `IN PROGRESS`, and `DONE` states. Easily change status via the UI.
- **Advanced Real-Time Search**: Debounced, native database search to quickly find users by name or email when creating projects or assigning tasks.
- **Dashboard Analytics**: Real-time aggregation of task statuses across all projects you have access to, including tracking overdue tasks.
- **Premium UI**: Custom-built CSS styling featuring glassmorphism elements, dynamic hover states, and smooth transitions without relying on heavy CSS frameworks.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [MongoDB](https://www.mongodb.com/) (Atlas or local)
- **Database Driver**: [Mongoose](https://mongoosejs.com/)
- **Styling**: Vanilla CSS Modules & Custom Tokens (`globals.css`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Security**: `bcryptjs` for password hashing, `jsonwebtoken` for stateless auth.

## 📁 Project Structure

```text
├── src
│   ├── app
│   │   ├── api          # Next.js REST API Routes (Auth, Projects, Tasks, Dashboard)
│   │   ├── auth         # Login & Register Pages
│   │   ├── dashboard    # Dashboard statistics page
│   │   ├── projects     # Projects listing & specific Kanban board pages
│   │   ├── globals.css  # Global theme & utility classes
│   │   └── layout.tsx   # Root layout wrapping Contexts & Navbars
│   ├── components       # Reusable React components (Navbar, AuthProvider)
│   ├── lib              # Utilities (mongodb.ts, auth.ts)
│   └── models           # Mongoose Database Schemas (User, Project, Task)
├── .env                 # Environment variables (Database URL, JWT Secret)
├── railway.toml         # Configuration for Railway deployment
└── package.json         # Project dependencies and scripts
```

## 💻 Getting Started Locally

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed and an active [MongoDB Atlas](https://cloud.mongodb.com/) account (or local MongoDB server).

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <your-repo-url>
cd tasksync
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
# URL encode special characters in your password! (e.g. @ becomes %40)
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/tasksync?retryWrites=true&w=majority"
JWT_SECRET="your-super-secret-jwt-key"
```

### 4. Run the Development Server
Start the Next.js server. Since we use Mongoose, collections are created automatically when records are inserted—no database migrations required!
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment to Railway

This project is fully configured to deploy seamlessly to [Railway](https://railway.app/) using `NIXPACKS`.

1. Push your code to a GitHub repository.
2. Log into Railway and select **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. Go to the **Variables** tab in your new Railway project and add your `DATABASE_URL` and `JWT_SECRET`.
5. Go to the **Settings** tab and generate a public domain.

Your app will automatically build and deploy!

## 🛡️ License

This project is licensed under the MIT License.
