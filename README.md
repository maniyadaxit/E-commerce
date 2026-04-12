# Aurora Gems

Aurora Gems is a full-stack jewelry commerce platform with a customer storefront and a dedicated owner panel, built with React 18 + Vite on the frontend and Spring Boot 3 + PostgreSQL on the backend.

## Stack

- Frontend: React 18, React Router v6, Axios, Tailwind CSS, Framer Motion, React Hook Form, Zod
- Backend: Spring Boot 3, Spring Web, Spring Data JPA, Spring Security, JWT, Razorpay Java SDK
- Database: PostgreSQL 15
- Auth: JWT access + refresh token flow

## Prerequisites

- Node.js 18+
- npm 9+
- Java 17+
- Maven 3.9+ or a local Maven wrapper
- Docker Desktop or local PostgreSQL 15

## Environment Setup

### Backend

Default backend config lives in [`application.yml`](/C:/Users/maniy/OneDrive/Documents/Playground/backend/src/main/resources/application.yml).

Important values:

- Database: `jdbc:postgresql://localhost:5432/aurora_gems_db`
- Username: `postgres` by default or `DB_USERNAME`
- Password: `postgres` by default or `DB_PASSWORD`
- JWT secret: `JWT_SECRET`
- Local uploads directory: `APP_UPLOAD_DIR` or `./uploads`
- Razorpay: read from `RAZORPAY_*` env vars with placeholder fallbacks

### Frontend

Configure [`frontend/.env`](/C:/Users/maniy/OneDrive/Documents/Playground/frontend/.env) as needed.

Expected variables:

- `VITE_API_BASE_URL=http://localhost:8080/api/v1`
- `VITE_RAZORPAY_KEY_ID=rzp_test_xxxx`

## Database Setup

### Option 1: Docker

```bash
docker compose up -d
```

This starts PostgreSQL 15 with:

- Database: `aurora_gems_db`
- Username: `postgres`
- Password: `postgres`

### Option 2: Local PostgreSQL

Create a database named `aurora_gems_db` and keep the backend datasource credentials aligned with [`application.yml`](/C:/Users/maniy/OneDrive/Documents/Playground/backend/src/main/resources/application.yml).

Schema + seed live in:

- [`schema.sql`](/C:/Users/maniy/OneDrive/Documents/Playground/backend/src/main/resources/schema.sql)
- [`seed.sql`](/C:/Users/maniy/OneDrive/Documents/Playground/backend/src/main/resources/seed.sql)

The schema uses integer paise for all money values.

Seed data includes:

- 5 collections
- 20 products
- variants, images, attributes
- 2 users (`maniyadaxit1234@gmail.com`, `aarohi@example.com`)
- 10 reviews
- 3 coupons
- sample carts, addresses, orders, blogs

Local seed passwords:

- Owner: `Daxit@9327134439`
- User: `Password@123`

## Run Instructions

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Start the backend

```bash
cd backend
mvn spring-boot:run
```

Backend base URL: `http://localhost:8080/api/v1`

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## API Summary

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/logout`

### Catalog

- `GET /api/v1/products`
- `GET /api/v1/products/search`
- `GET /api/v1/products/{slug}`
- `GET /api/v1/collections`
- `GET /api/v1/collections/{handle}/products`
- `GET /api/v1/blogs`
- `GET /api/v1/blogs/{slug}`
- `GET /api/v1/stores`
- `GET /api/v1/delivery/check?pincode=`

### Customer

- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PUT /api/v1/cart/items/{id}`
- `DELETE /api/v1/cart/items/{id}`
- `DELETE /api/v1/cart`
- `GET /api/v1/wishlist`
- `POST /api/v1/wishlist/{productId}`
- `DELETE /api/v1/wishlist/{productId}`
- `GET /api/v1/orders`
- `GET /api/v1/orders/{id}`
- `POST /api/v1/orders`
- `GET /api/v1/users/me`
- `PUT /api/v1/users/me`
- `GET /api/v1/users/me/addresses`
- `POST /api/v1/users/me/addresses`
- `PUT /api/v1/users/me/addresses/{id}`
- `DELETE /api/v1/users/me/addresses/{id}`
- `GET /api/v1/products/{productId}/reviews`
- `POST /api/v1/products/{productId}/reviews`
- `POST /api/v1/coupons/validate`
- `POST /api/v1/payments/create-order`
- `POST /api/v1/payments/verify`

### Owner

- `POST /api/v1/auth/owner/login`
- `GET /api/v1/owner/dashboard`
- `GET /api/v1/owner/orders`
- `GET /api/v1/owner/users`
- `PATCH /api/v1/owner/users/{id}/status?enabled=`
- `GET /api/v1/owner/reviews`
- `PATCH /api/v1/owner/reviews/{id}`
- `GET /api/v1/owner/coupons`
- `POST /api/v1/owner/coupons`
- `POST /api/v1/products`
- `PUT /api/v1/products/{id}`
- `DELETE /api/v1/products/{id}`
- `POST /api/v1/collections`

## Folder Structure

```text
Playground/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/giva/
│       │   │   ├── config/
│       │   │   ├── controller/
│       │   │   ├── dto/request/
│       │   │   ├── dto/response/
│       │   │   ├── exception/
│       │   │   ├── model/
│       │   │   ├── repository/
│       │   │   ├── service/
│       │   │   └── util/
│       │   └── resources/
│       │       ├── application.yml
│       │       ├── schema.sql
│       │       └── seed.sql
│       └── test/java/com/giva/
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── data/
│       ├── hooks/
│       ├── pages/
│       ├── routes/
│       └── utils/
├── docker-compose.yml
└── README.md
```

## Notes

- Backend money values are stored in paise and formatted to INR on the frontend.
- Guest cart and wishlist persist in local storage and sync after login.
- Product images upload through the backend and are served from `/uploads/**`.
- Razorpay falls back to mock order creation when placeholder keys are present.
- Existing local databases created with the old `USER`/`ADMIN` enum values should be recreated so the updated `CUSTOMER`/`OWNER` roles match the current schema.
