# 🌈 Gesture Calculator MVP

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-111111?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=0A0A0A)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Gesture_Recognizer-4285F4?style=for-the-badge&logo=google&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-3-F7B93E?style=for-the-badge&logo=prettier&logoColor=1A2B34)

**A colorful gesture-driven calculator MVP built with Next.js, MediaPipe, FastAPI, and PostgreSQL-ready backend support.**

</div>

## 🎯 Overview

This project is an MVP for a hand-gesture calculator with the following architecture:

- Frontend: Next.js + React + TypeScript + Tailwind CSS + MediaPipe Gesture Recognizer
- Backend: FastAPI
- Database target: PostgreSQL / Supabase

The browser handles real-time camera and gesture recognition, while the backend stores calculation history and is ready for database-backed persistence.

## 🧰 Tech Stack

| Layer | Stack | Purpose |
| --- | --- | --- |
| Frontend | Next.js, React 19, TypeScript | UI, client-side logic, app structure |
| Styling | Tailwind CSS | Layout and visual styling |
| Vision | MediaPipe Gesture Recognizer | Hand gesture recognition |
| Backend | FastAPI, Uvicorn | API and history persistence |
| Database | PostgreSQL / Supabase | Persistent history storage |
| ORM / DB Access | SQLAlchemy, asyncpg | Async database connection and table creation |
| Tooling | ESLint, Prettier | Code quality and formatting |

## ✨ MVP Features

- Live camera input directly in the browser
- Real-time MediaPipe gesture recognition loop
- Gesture debounce and smoothing for more stable input
- Expression builder for numbers and operators
- Safe expression evaluation without using `eval`
- History persistence through the backend API
- Frontend linting and formatting setup with `eslint` and `prettier`

## 📁 Project Structure

```text
Gesture-Calculator/
├── frontend/   # Next.js application
├── backend/    # FastAPI API for calculation history
├── package.json
└── README.md
```

## 🚀 Run The Full Stack

```powershell
Copy-Item frontend\.env.example frontend\.env.local
Copy-Item backend\.env.example backend\.env
npm install
cd frontend
npm install
cd ..\backend
python -m pip install -e .
cd ..
npm run dev
```

Running `npm run dev` from the project root starts:

- Next.js at `http://localhost:3000`
- FastAPI at `http://127.0.0.1:8000`

## 🛠️ Root Scripts

- `npm run dev`
- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run build`
- `npm run lint`
- `npm run format`
- `npm run format:check`
- `npm run typecheck`

## 💻 Frontend Scripts

Go into the `frontend` folder if you want to run frontend commands separately.

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run format`
- `npm run format:check`
- `npm run typecheck`

## ⚙️ Run The Backend Only

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

By default, the backend uses in-memory storage when `DATABASE_URL` is not set. When `DATABASE_URL` points to PostgreSQL or Supabase Postgres, the history table is created automatically during startup.

Use an async PostgreSQL driver that matches the backend dependencies:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/gesture_calculator
```

If the database is down or the URL is invalid, the backend now stays online in in-memory mode so the frontend does not immediately appear offline during development.

## 🤟 Gesture Mapping Notes

The default MediaPipe gesture set is not enough for a complete `0-9 + - * / =` calculator experience, so this project currently supports two modes:

- Default demo mapping:
  Left hand: numbers `0-5` via finger count
  Right hand: operators `+ - * / =` via built-in MediaPipe gesture labels
- Production mapping:
  Replace the `.task` model with custom gesture labels such as `NUMBER_ZERO` through `NUMBER_NINE` and `OP_PLUS`, `OP_MINUS`, `OP_MULTIPLY`, `OP_DIVIDE`, `OP_EQUALS`

All core gesture mapping logic lives in `frontend/lib/gesture-mapper.ts`, so it is easy to refine later with your own dataset or custom model.

## 🎨 Notes

- The frontend is designed as a colorful MVP dashboard with light and dark mode support.
- The backend is intentionally simple so it can switch between memory mode and database mode during development.
- This project is a strong starting point for building a production-ready gesture calculator with custom-trained gesture labels.
