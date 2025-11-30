# 4Foods Admin - Backend

This backend provides REST API endpoints to manage users, products, orders, shops, categories, conversations, messages, notifications, carts, vouchers and loyalty for the 4Foods admin dashboard.

## Development

1. Copy `.env.example` to `.env` and configure `MONGODB_URI` and `JWT_SECRET`.
2. Install dependencies

```
npm install
```

3. Seed sample data (optional)

```
npm run seed
```

4. Start development server

```
npm run dev
```

Server will run at `http://localhost:5000` by default.

### Admin

- A small aggregated admin API is mounted under `/api/admin` with multiple dashboard endpoints (overview, charts and recent activity).
- Example admin credentials seeded by `npm run seed`:
	- email: `admin@example.com`
	- password: `admin123`

Use the JWT token returned by `/api/auth/login` to call admin endpoints by adding an Authorization header of `Bearer <token>`.

## API Endpoints (high level)

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/users` - List users (admin)
- `GET /api/users/:id` - Get user (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/products` - List products (admin)
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `GET /api/orders` - List orders (admin)
- `GET /api/orders/:id` - Get order (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)
- `PUT /api/orders/:id/approve` - Approve order (admin)
- `PUT /api/orders/:id/reject` - Reject order (admin)
- `DELETE /api/orders/:id` - Delete order (admin)

...and more endpoints for carts, categories, shops, messages & conversations, notifications, otps, loyalty, vouchers and dashboard charts.
