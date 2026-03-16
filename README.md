## Monthly Billing Record System

Professional monthly ledger-style billing register for residents, built with Next.js App Router, TailwindCSS, and Neon PostgreSQL. Designed to deploy on Vercel.

### Tech Stack

- **Frontend**: Next.js (App Router), React, TailwindCSS
- **Backend**: Next.js Route Handlers (API routes under `app/api`)
- **Database**: Neon PostgreSQL (via `pg` and `process.env.DATABASE_URL`)

### Database Schema

Run the SQL in `db-schema.sql` on your Neon PostgreSQL database:

```sql
-- residents
CREATE TABLE IF NOT EXISTS residents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  room_number TEXT
);

-- registers (months)
CREATE TABLE IF NOT EXISTS registers (
  id SERIAL PRIMARY KEY,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- entries
CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  register_id INTEGER REFERENCES registers(id) ON DELETE CASCADE,
  resident_id INTEGER REFERENCES residents(id),
  date DATE NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);
```

Seed some residents:

```sql
INSERT INTO residents (name, room_number)
VALUES
  ('Mouha Alice', '101'),
  ('Swijsen Maria', '102');
```

### Environment Variables

- **DATABASE_URL**: Neon connection string, e.g. `postgres://user:password@host/db?sslmode=require`

Locally, add it to a `.env.local` file:

```bash
DATABASE_URL="postgres://..."
```

On **Vercel**, add `DATABASE_URL` under **Project Settings → Environment Variables**.

### Running Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Login with:

- **username**: `admin`
- **password**: `admin123`

### Core Flows

- **Login**: `/` (root) shows a simple login form; auth is hardcoded and stored in `localStorage` for this demo.
- **Dashboard**: `/dashboard` lists existing registers (months) and lets you create a new one.
- **Register Page**: `/register/[id]` shows a bookkeeping-style table of entries for that month, plus an Add Entry form.

### API Routes

- **Create/List registers**
  - `GET /api/register` → list all registers.
  - `POST /api/register` → create a new register.
    - Body: `{ "month": 12, "year": 2025 }`

- **Get register entries**
  - `GET /api/register/:id`
  - Returns `{ register, entries }` where each entry includes `resident_name`, `date`, `price`, and ids.

- **Add entry**
  - `POST /api/entry`
  - Body:
    ```json
    {
      "register_id": 1,
      "resident_id": 2,
      "date": "2025-12-02",
      "price": 49
    }
    ```

- **Delete entry**
  - `DELETE /api/entry/:id`

- **List residents**
  - `GET /api/residents`

### Totals Calculation

Totals are **never stored in the database**. On the register page, totals are computed dynamically on the frontend:

- **Total** = sum of all `price`
- **15%** = `total * 0.15`
- **Final Total** = `total - 15%`

These are shown below the ledger table in an accounting-style summary.

### Deployment on Vercel

1. Push this project to GitHub.
2. In Vercel, create a new project from the repo.
3. Set `DATABASE_URL` in Vercel environment variables (from Neon).
4. Deploy. Vercel will run `npm install` and `npm run build` using this configuration.

