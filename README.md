# Gesture Calculator MVP

Project ini menyiapkan MVP kalkulator berbasis gesture tangan dengan arsitektur:

- Frontend: Next.js + TypeScript + Tailwind CSS + MediaPipe Gesture Recognizer
- Backend: FastAPI
- Database target: PostgreSQL / Supabase

## Fitur MVP

- Kamera live langsung di browser
- Integrasi MediaPipe Gesture Recognizer untuk loop vision real-time
- Debounce dan smoothing gesture supaya input lebih stabil
- Expression builder untuk angka dan operator
- Evaluasi hasil kalkulasi tanpa `eval`
- Simpan history ke backend
- `eslint` dan `prettier` siap pakai di frontend

## Struktur Folder

- `frontend/`: aplikasi Next.js
- `backend/`: API FastAPI untuk history

## Menjalankan Full Stack

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

Perintah `npm run dev` dari root project akan menyalakan:

- Next.js di `http://localhost:3000`
- FastAPI di `http://127.0.0.1:8000`

## Script Root

- `npm run dev`
- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run build`
- `npm run lint`
- `npm run format`
- `npm run format:check`
- `npm run typecheck`

## Script Frontend

Masuk ke folder `frontend` jika mau menjalankan script frontend secara terpisah.

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run format`
- `npm run format:check`
- `npm run typecheck`

## Menjalankan Backend

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

Secara default backend akan memakai in-memory store jika `DATABASE_URL` belum diisi. Saat `DATABASE_URL` diarahkan ke PostgreSQL atau Supabase Postgres, tabel history akan dibuat otomatis saat startup.

Gunakan driver async agar cocok dengan dependency backend:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/gesture_calculator
```

Kalau database sedang mati atau URL salah, backend sekarang tetap menyala dalam mode in-memory supaya frontend tidak langsung dianggap offline saat development.

## Catatan Gesture Mapping

MediaPipe bawaan belum cukup untuk full `0-9 + - * / =` dengan gesture default. Karena itu project ini sudah menyiapkan dua mode:

- Default demo mapping:
  - Tangan kiri: angka `0-5` via finger count
  - Tangan kanan: operator `+ - * / =` via label gesture bawaan
- Production mapping:
  - Ganti model `.task` dengan custom gesture labels `NUMBER_ZERO` sampai `NUMBER_NINE` dan `OP_PLUS`, `OP_MINUS`, `OP_MULTIPLY`, `OP_DIVIDE`, `OP_EQUALS`

Semua mapping inti ada di `frontend/lib/gesture-mapper.ts`, jadi nanti gampang kalau kamu mau refine dataset gesture sendiri.
