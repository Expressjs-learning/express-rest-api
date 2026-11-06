# Express REST API

A secure, modular, and production-ready RESTful API built with **Node.js**, **Express**, and **MongoDB / Mongoose**. Features JWT-based authentication, Role-Based Access Control (RBAC), robust security middleware, and centralized error handling.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Database Seeding](#database-seeding)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Posts](#posts)
- [Security Features](#security-features)
- [Error Handling](#error-handling)
- [License](#license)
- [Author](#author)

---

## Features

- **Authentication & Authorization**:
  - Secure user registration and login with JSON Web Tokens (JWT).
  - Password hashing with `bcryptjs` (12 salt rounds).
  - Role-Based Access Control (RBAC) supporting `user`, `admin`, `manager`, and `lead` roles.
  - Automatic token expiration and invalidation if the password is changed after token issuance.
  - Dual token transport support: `Authorization: Bearer <token>` header or `jwt` HTTP cookies.
- **Post Management (CRUD)**:
  - Create, read, update, and delete posts with Mongoose schema validation.
- **Security Middlewares**:
  - Security HTTP headers via **Helmet**.
  - Rate limiting (100 requests per hour per IP) via **express-rate-limit**.
  - Request body size limitation (max 50kb) to prevent payload denial-of-service.
  - NoSQL query injection prevention via **@exortek/express-mongo-sanitize**.
  - Cross-Site Scripting (XSS) attack prevention via **express-xss-sanitizer**.
- **Centralized Error Handling**:
  - Custom `AppError` class for operational errors.
  - Async error forwarding wrapper (`catchAsync`).
  - Distinct responses for `development` (detailed stack traces) vs `production` (sanitized operational messages).
  - Handlers for MongoDB `CastError` (invalid ObjectId), duplicate key errors (code `11000`), and validation errors.
- **Database Seeding CLI**:
  - Built-in utility script to easily import and wipe sample posts.

---

## Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/) (v5)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) (v9)
- **Authentication**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Security**: [Helmet](https://helmetjs.github.io/), [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit), [express-xss-sanitizer](https://github.com/animir/express-xss-sanitizer), [@exortek/express-mongo-sanitize](https://github.com/exortek/express-mongo-sanitize)
- **Utilities**: [validator](https://github.com/validatorjs/validator.js), [dotenv](https://github.com/motdotla/dotenv), [colors](https://github.com/Marak/colors.js)
- **Development**: [nodemon](https://nodemon.io/)

---

## Project Structure

```text
express-rest-api/
├── config.env                    # Environment variables configuration
├── package.json                  # Dependencies and scripts
├── server.js                     # App entry point & MongoDB connection
├── src/
│   ├── app.js                    # Express configuration & middleware pipeline
│   ├── controllers/
│   │   ├── authController.js     # Signup, login, protectRoute & restrictTo
│   │   └── postController.js     # Post CRUD controller methods
│   ├── models/
│   │   ├── postModel.js          # Post schema and model
│   │   └── userModel.js          # User schema, hooks, and instance methods
│   ├── routes/
│   │   ├── authRoutes.js         # Routes for /api/v1/auth
│   │   └── postRoutes.js         # Routes for /api/v1/post
│   └── utils/
│       ├── catchAsync.js         # Async error wrapper
│       └── error/
│           ├── appError.js       # Custom operational error class
│           └── globalErrorHandler.js # Global error handling middleware
└── tests/
    ├── data/
    │   └── posts.json            # Sample post mock data
    └── dataManager.js            # CLI script to import or delete sample data
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) installed and running locally on port `27017` (or MongoDB Atlas connection string)

---

## Environment Variables

The project uses `config.env` located in the root directory. Configure the following variables before starting the server:

```env
# Application environment ("development" or "production")
NODE_ENV=development
PORT=3000

# MongoDB Connection URI
DATABASE_LOCAL=mongodb://localhost:27017/express_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=90d

# Cookie Configuration (days)
COOKIE_EXPIRES_IN=90
```

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd express-rest-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create or verify `config.env` in the root directory as shown above.

4. **Start the development server:**
   ```bash
   npm run server
   ```

   The server will start with `nodemon` listening on port `3000`:
   ```
   Database is connected
   Server is running on port 3000 as development mode
   ```

---

## Database Seeding

A data management script is included in `tests/dataManager.js` to seed sample posts from `tests/data/posts.json` or wipe the posts collection.

- **Import sample posts:**
  ```bash
  node tests/dataManager.js import
  ```
- **Delete all posts:**
  ```bash
  node tests/dataManager.js delete
  ```

---

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication

#### 1. Register a New User
- **Method**: `POST`
- **URL**: `/api/v1/auth/signup`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "role": "user"
  }
  ```
  *(Note: Valid roles are `user`, `admin`, `manager`, `lead`. Defaults to `user`)*
- **Response** (`201 Created`):
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

#### 2. User Login
- **Method**: `POST`
- **URL**: `/api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

---

### Posts

> **Authentication Required**: All post endpoints require a valid JWT token.  
> Pass the token in the header: `Authorization: Bearer <token>` or as a `jwt` cookie.

#### 1. Get All Posts
- **Method**: `GET`
- **URL**: `/api/v1/post/all`
- **Access**: Restricted to `user` and `admin` roles.
- **Response** (`200 OK`):
  ```json
  {
    "status": "success",
    "data": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
        "title": "Introduction to Express REST APIs",
        "content": "A comprehensive guide on building scalable APIs.",
        "createdAt": "2026-11-06T14:18:38.000Z"
      }
    ]
  }
  ```

#### 2. Get Post by ID
- **Method**: `GET`
- **URL**: `/api/v1/post/:id`
- **Response** (`200 OK`):
  ```json
  {
    "status": "success",
    "data": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "title": "Introduction to Express REST APIs",
      "content": "A comprehensive guide on building scalable APIs.",
      "createdAt": "2026-11-06T14:18:38.000Z"
    }
  }
  ```

#### 3. Create a New Post
- **Method**: `POST`
- **URL**: `/api/v1/post/`
- **Request Body**:
  ```json
  {
    "title": "New Post Title",
    "content": "This is the body content of the new post."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "status": "success",
    "data": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
      "title": "New Post Title",
      "content": "This is the body content of the new post.",
      "createdAt": "2026-11-06T14:20:00.000Z"
    }
  }
  ```

#### 4. Update Post by ID
- **Method**: `PATCH`
- **URL**: `/api/v1/post/:id`
- **Request Body**:
  ```json
  {
    "title": "Updated Post Title",
    "content": "Updated content goes here."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "status": "success",
    "data": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
      "title": "Updated Post Title",
      "content": "Updated content goes here.",
      "createdAt": "2026-11-06T14:20:00.000Z"
    }
  }
  ```

#### 5. Delete Post by ID
- **Method**: `DELETE`
- **URL**: `/api/v1/post/:id`
- **Response** (`200 OK`):
  ```json
  {
    "status": "success",
    "message": "Post is deleted"
  }
  ```

---

## Security Features

| Middleware / Library | Purpose | Configuration |
|---|---|---|
| `helmet` | Sets standard HTTP response headers for protection against common web vulnerabilities | Default configuration |
| `express-rate-limit` | Rate limiting to guard against brute-force attacks and abuse | 100 requests / 1 hour per IP on `/api` |
| `express.json({ limit: "50kb" })` | Limits JSON request body size to guard against payload flood | `50kb` |
| `@exortek/express-mongo-sanitize` | Sanitizes user-supplied data to prevent NoSQL query injections (strips `$` and `.`) | Applied globally on incoming requests |
| `express-xss-sanitizer` | Sanitizes inputs to neutralize Cross-Site Scripting (XSS) attacks | Applied globally |
| `bcryptjs` | Salting and hashing passwords before saving to database | 12 salt rounds |
| `jsonwebtoken` | Stateless authentication tokens | Signed with secret key and configured expiry |

---

## Error Handling

Errors are managed through an operational error hierarchy:

- **Operational Errors**: Created using `new AppError(message, statusCode)` for predictable conditions (e.g. invalid credentials, resource not found, permission denied).
- **Development vs. Production Modes**:
  - In `NODE_ENV=development`: The full error object, error stack trace, status, and message are returned.
  - In `NODE_ENV=production`: Operational error messages are sent cleanly to the client, while unexpected programming errors return a generic 500 error (`"Something went wrong"`).
- **Automatic MongoDB Error Formatting**:
  - `CastError`: Returns `400 Bad Request` with message `Invalid ID: <id>`.
  - Duplicate key (`code: 11000`): Returns `400 Bad Request` with message `Duplicate field value: <val> Please enter another value!`.
  - `ValidationError`: Returns `400 Bad Request` with combined schema validation error details.

---

## License

This project is licensed under the [ISC License](LICENSE).

---

## Author

**Chamith Nimsara**

