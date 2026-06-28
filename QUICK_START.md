# 🚀 Quick Start Guide

## Prerequisites Check

- [ ] Node.js installed (v18+)
- [ ] MongoDB installed atau akses ke MongoDB Atlas
- [ ] Terminal/Command Prompt

## Step 1: Fix PowerShell Execution Policy

**PENTING:** Windows PowerShell memblokir npm by default. Pilih salah satu solusi:

### Option A: Use Command Prompt (Easiest)
1. Buka **Command Prompt** (bukan PowerShell)
2. Navigate ke project:
   ```cmd
   cd c:\boiler_plate_be
   ```
3. Lanjut ke Step 2

### Option B: Bypass PowerShell Policy (One-time)
1. Buka **PowerShell as Administrator**
2. Run command ini:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
3. Lanjut ke Step 2

### Option C: Change Policy Permanently
1. Buka **PowerShell as Administrator**
2. Run:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```

## Step 2: Install Dependencies

```bash
npm install
```

**Expected output:**
```
added 50+ packages in 10-20s
```

## Step 3: Start MongoDB

### If using local MongoDB:
```bash
# Windows
net start MongoDB

# Or use MongoDB Compass GUI
```

### If using MongoDB Atlas (Cloud):
1. Buka file `.env`
2. Update `MONGODB_URI` dengan connection string dari Atlas:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   ```

## Step 4: Configure Environment

File `.env` sudah dibuat. **Edit jika perlu:**

```env
# Default values - ganti sesuai kebutuhan
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/express_boilerplate
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

⚠️ **IMPORTANT:** Ganti `JWT_SECRET` dengan random string yang aman untuk production!

## Step 5: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
[INFO] ... - Server running in development mode on port 5000
[INFO] ... - MongoDB Connected: localhost
```

## Step 6: Test the API

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

Expected: `{"success":true,"message":"Server is running",...}`

### Test 2: Welcome Page
Open browser: http://localhost:5000

### Test 3: Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Test 4: Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Save the token dari response!**

### Test 5: Get Current User (Protected)
```bash
curl http://localhost:5000/api/v1/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## ✅ Success Checklist

- [ ] Dependencies installed successfully
- [ ] MongoDB connected
- [ ] Server running on port 5000
- [ ] Health check returns 200
- [ ] Can register new user
- [ ] Can login and receive JWT token
- [ ] Protected routes work with token

## 🎉 You're Ready!

Server is running and ready for development. Check [README.md](file:///c:/boiler_plate_be/README.md) for full API documentation.

## 🐛 Troubleshooting

### Error: Cannot find module 'express'
**Solution:** Dependencies not installed. Run `npm install`

### Error: connect ECONNREFUSED ::1:27017
**Solution:** MongoDB not running. Start MongoDB service.

### Error: JWT malformed
**Solution:** Token tidak valid atau tidak ada. Login dulu untuk mendapat token.

### Error: E11000 duplicate key error
**Solution:** Email sudah terdaftar. Gunakan email lain atau hapus user dari database.

### Port 5000 already in use
**Solution:** Change PORT in `.env` file to different number (e.g., 5001)

## 📚 Next Steps

1. **Customize:** Edit models, add new endpoints
2. **Deploy:** Prepare for production deployment
3. **Test:** Write unit tests (optional, setup Jest)
4. **Document:** Add Swagger/OpenAPI docs (optional)

## 🔗 Useful Links

- [Full Documentation](file:///c:/boiler_plate_be/README.md)
- [MongoDB Installation](https://www.mongodb.com/try/download/community)
- [MongoDB Atlas Free Tier](https://www.mongodb.com/cloud/atlas)
- [Postman for API Testing](https://www.postman.com/downloads/)
