# Running PeraCut locally

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **pnpm** 10+ — install with `npm install -g pnpm`
- *(optional)* A MySQL database if you want to persist data to a real DB

---

## Quick start (no database required)

```bash
# 1. Install dependencies
pnpm install

# 2. Copy the example env file (no changes needed for basic dev)
cp .env.example .env

# 3. Start the dev server
pnpm dev
```

Open **http://localhost:3000** in your browser.

> In dev mode without a database the app still works fully:
> - Editing photos and videos is entirely client-side.
> - When a user clicks **Guardar** / **Descargar** a registration modal appears.
> - Lead data (email, username, country, age range, consents) is saved to
>   `data/leads.json` instead of a database.

---

## With a MySQL database

1. Create a MySQL database (any version 5.7+ or MariaDB 10.3+).
2. Set `DATABASE_URL` in your `.env`:

   ```
   DATABASE_URL=mysql://user:password@localhost:3306/peracut
   ```

3. Run migrations:

   ```bash
   pnpm db:push
   ```

4. Start the server:

   ```bash
   pnpm dev
   ```

---

## Environment variables

See [`.env.example`](.env.example) for the full list.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | No (uses file fallback) | MySQL connection string |
| `JWT_SECRET` | Yes (prod) | Secret for signing session cookies |
| `PERACUT_MASTER_KEY` | Recommended | Protects `/api/admin/leads.csv` |
| `VITE_OAUTH_PORTAL_URL` | No | OAuth portal URL (leave blank to disable) |
| `VITE_APP_ID` | No | App ID for OAuth portal |
| `VITE_ANALYTICS_ENDPOINT` | No | Umami analytics (only injected in prod) |
| `VITE_ANALYTICS_WEBSITE_ID` | No | Umami website ID |
| `PORT` | No | Server port (default: 3000) |

---

## Viewing / exporting lead data

### If using the file fallback

Leads are stored in `data/leads.json`. You can view them directly:

```bash
cat data/leads.json | jq .
```

### CSV export (admin endpoint)

```
GET /api/admin/leads.csv?key=<PERACUT_MASTER_KEY>
```

Or with a header:

```bash
curl -H "x-admin-key: <PERACUT_MASTER_KEY>" http://localhost:3000/api/admin/leads.csv -o leads.csv
```

The endpoint returns all leads from the database (if configured) or from
`data/leads.json` as a CSV file.

---

## Available scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm check` | TypeScript type check |
| `pnpm test` | Run tests |
| `pnpm db:push` | Generate & apply DB migrations |
| `pnpm format` | Format code with Prettier |
