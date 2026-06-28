# Express.js Backend Boilerplate

Production-ready Express.js backend boilerplate dengan MongoDB, JWT authentication, dan security best practices.

## 🚀 Features

- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database dengan Mongoose ODM
- **JWT Authentication** - Secure token-based authentication
- **Security** - Helmet, rate limiting, CORS, XSS protection, NoSQL injection prevention
- **Input Validation** - Express-validator untuk validasi input
- **Error Handling** - Centralized error handling
- **Logging** - Morgan HTTP request logger
- **Code Quality** - ESLint dan Prettier
- **MVC Architecture** - Organized code structure

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local atau cloud)

## 🛠️ Installation

1. Clone repository ini atau copy semua file ke project Anda

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env` dari template `.env.example`:
```bash
cp .env.example .env
```

4. Konfigurasi environment variables di file `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/express_boilerplate
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000
```

5. Pastikan MongoDB sudah running

6. Start development server:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## 📁 Project Structure

```
boiler_plate_be/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # MongoDB connection
│   │   └── index.js         # Centralized config
│   ├── controllers/         # Route controllers
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── errorHandler.js  # Error handling
│   │   └── validator.js     # Validation middleware
│   ├── models/              # Database models
│   │   └── User.js          # User model
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── services/            # Business logic
│   │   └── authService.js
│   ├── utils/               # Utility functions
│   │   ├── ApiError.js      # Custom error class
│   │   ├── ApiResponse.js   # Response formatter
│   │   ├── asyncHandler.js  # Async error handler
│   │   └── logger.js        # Logger utility
│   ├── validators/          # Input validation
│   │   └── authValidator.js
│   └── app.js               # Express app setup
├── server.js                # Entry point
├── .env.example             # Environment template
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/v1/auth/update-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "johnupdated@example.com"
}
```

#### Change Password
```http
PUT /api/v1/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

### Users (Admin Only)

#### Get All Users
```http
GET /api/v1/users?page=1&limit=10&search=john
Authorization: Bearer <admin-token>
```

#### Get Single User
```http
GET /api/v1/users/:id
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/v1/users/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "admin"
}
```

#### Delete User
```http
DELETE /api/v1/users/:id
Authorization: Bearer <admin-token>
```

### Health Check
```http
GET /health
```

## 🔒 Security Features

- **Helmet.js** - Sets security HTTP headers
- **Rate Limiting** - Prevents brute force attacks (100 requests per 15 minutes)
- **CORS** - Configurable cross-origin resource sharing
- **NoSQL Injection Prevention** - Sanitizes user input
- **XSS Protection** - Prevents cross-site scripting
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt with 10 salt rounds
- **Input Validation** - Express-validator for all inputs

## 🎯 Best Practices

- **MVC Architecture** - Separation of concerns
- **Service Layer** - Business logic separated from controllers
- **Error Handling** - Centralized error handling
- **Async/Await** - Modern async handling with error catching
- **Environment Variables** - Configuration via .env
- **Code Quality** - ESLint dan Prettier configuration
- **Logging** - HTTP request logging with Morgan
- **Response Format** - Standardized API responses

## 📝 Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Run ESLint
npm run lint

# Fix ESLint errors
npm run lint:fix

# Format code with Prettier
npm run format
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/express_boilerplate` |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## 🚦 Usage Example

### 1. Register a New User

```javascript
const response = await fetch('http://localhost:5000/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  }),
});

const data = await response.json();
console.log(data.data.token); // Save this token
```

### 2. Login

```javascript
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123',
  }),
});

const data = await response.json();
const token = data.data.token;
```

### 3. Access Protected Route

```javascript
const response = await fetch('http://localhost:5000/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
console.log(data.data.user);
```

## 🎨 Customization

### Adding New Routes

1. Create model di `src/models/`
2. Create service di `src/services/`
3. Create controller di `src/controllers/`
4. Create routes di `src/routes/`
5. Create validators di `src/validators/`
6. Mount routes di `src/app.js`

### Example: Adding a Blog Post Resource

```javascript
// src/models/Post.js
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// src/routes/postRoutes.js
router.get('/', postController.getPosts);
router.post('/', protect, postController.createPost);

// Mount in src/app.js
app.use('/api/v1/posts', postRoutes);
```

## 🐛 Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "stack": "Stack trace (development only)"
}
```

## 📦 Dependencies

### Production
- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- helmet - Security headers
- cors - CORS middleware
- express-rate-limit - Rate limiting
- express-validator - Input validation
- express-mongo-sanitize - NoSQL injection prevention
- xss-clean - XSS protection
- morgan - HTTP logger
- compression - Response compression
- dotenv - Environment variables

### Development
- nodemon - Auto-restart server
- eslint - Code linting
- prettier - Code formatting

## 🤝 Contributing

Feel free to customize this boilerplate for your needs!

## 📄 License

MIT

## 👨‍💻 Author

Created as a production-ready Express.js backend boilerplate

---

**Happy Coding! 🚀**
