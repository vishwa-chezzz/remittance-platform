# International Remittance Tracking & Transaction Analytics Platform (MERN)

React + Node/Express + MongoDB, JWT auth, Recharts analytics.

## 1. Prerequisites
- Node.js 18+  (https://nodejs.org)
- MongoDB: either **MongoDB Community** installed locally (https://www.mongodb.com/try/download/community)
  or a free **MongoDB Atlas** cluster (then paste its connection string in `server/.env` as MONGO_URI)
- VS Code (recommended extensions: *MongoDB for VS Code*, *Thunder Client* or Postman)

## 2. Setup (open the folder in VS Code, press Ctrl+` for terminal)
```bash
npm run install:all        # installs server + client dependencies
# check server/.env (MONGO_URI, JWT_SECRET)
npm run seed               # creates demo data
```
Open **two terminals**:
```bash
npm run server             # API  -> http://localhost:5000
npm run client             # UI   -> http://localhost:5173
```
Login: `demo@remit.com / Demo@1234`  |  Admin: `admin@remit.com / Admin@123`

## 3. Folder map
```
server/
  server.js            app entry, middleware, routes
  config/db.js         MongoDB connection
  models/              User, Transaction, Notification (database schemas)
  middleware/          auth.js (JWT + roles), error.js
  routes/              auth, transactions, rates, notifications, analytics, admin
  services/            notify.js (creates alerts), simulator.js (demo status changes)
  utils/rates.js       exchange rates, fee, ETA
  seed.js              sample data
client/src/
  api.js               fetch wrapper with JWT
  AuthContext.jsx      login state
  pages/               Login, Register, Dashboard, NewTransfer, Transactions,
                       TransactionDetail, Notifications, Admin
```

## 4. API cheat sheet
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register, /login | create account / get JWT |
| GET | /api/auth/me | current user |
| GET | /api/rates/quote?from=USD&to=INR&amount=500 | rate, fee, ETA |
| POST | /api/transactions | create remittance |
| GET | /api/transactions?status=&q=&currency=&from=&to=&minAmount=&maxAmount=&page= | search/filter |
| GET | /api/transactions/:id | tracking details |
| GET | /api/notifications | alerts |
| GET | /api/analytics/summary | chart data |
| GET/PATCH | /api/admin/... | admin only |

## 5. Mapping to your PPT
| PPT feature | Where |
|---|---|
| Registration & login, secure auth | routes/auth.js, models/User.js, middleware/auth.js |
| Create remittance, sender/recipient, amount & currency | routes/transactions.js, NewTransfer.jsx |
| Status tracking (Initiated/Processing/Completed/Failed) | Transaction.status + services/simulator.js, TransactionDetail.jsx |
| Exchange-rate display | utils/rates.js, routes/rates.js |
| Estimated processing time | ETA_HOURS in utils/rates.js |
| Notifications | models/Notification.js, services/notify.js, Notifications.jsx |
| History + search/filter | Transactions.jsx, GET /api/transactions |
| Analytics dashboard | routes/analytics.js (aggregation), Dashboard.jsx |
| Password hashing, validation, RBAC | User.js (bcrypt), routes validation, restrictTo('admin') |
| Admin monitoring | routes/admin.js, Admin.jsx |

## 6. Troubleshooting
- `MongoDB connection failed` -> start MongoDB (`mongod`) or fix MONGO_URI.
- Port 5000 busy -> change PORT in server/.env AND the proxy in client/vite.config.js.
- Blank page / 401 -> clear localStorage and log in again.
