# 🧭 PathFinder — AI Career Guidance for School Students
> Cloud-powered career guidance platform built with Node.js + Express + Anthropic Claude API

---

## 📁 Project Structure

```
pathfinder/
├── frontend/
│   ├── index.html          ← Main HTML (landing + app in one file)
│   ├── css/
│   │   ├── main.css        ← CSS variables & shared base styles
│   │   ├── landing.css     ← Landing page + orbit animation
│   │   └── app.css         ← Guidance form + results page
│   └── js/
│       ├── config.js       ← API URL config (local vs production)
│       ├── api.js          ← API service layer (calls backend)
│       └── app.js          ← All UI logic, form handling, rendering
│
├── backend/
│   ├── server.js           ← Express server (run locally in VS Code)
│   ├── lambda.js           ← AWS Lambda handler (deploy to cloud)
│   ├── package.json        ← Node.js dependencies
│   └── .env.example        ← Template for environment variables
│
└── docs/
    └── README.md           ← This file
```

---

## 🚀 How to Run Locally in VS Code

### Step 1 — Install Node.js
Download from https://nodejs.org (choose LTS version)

### Step 2 — Install backend dependencies
Open terminal in VS Code, navigate to the backend folder:
```bash
cd pathfinder/backend
npm install
```

### Step 3 — Set up your API key
```bash
# Copy the example env file
cp .env.example .env

# Open .env and replace YOUR_ANTHROPIC_API_KEY_HERE with your real key
# Get your key at: https://console.anthropic.com
```

### Step 4 — Start the backend server
```bash
npm start
```
You should see:
```
╔═══════════════════════════════════════╗
║   PathFinder Backend Server Running   ║
╚═══════════════════════════════════════╝
  URL   : http://localhost:3001
```

### Step 5 — Open the frontend
Option A — Install "Live Server" extension in VS Code, then right-click `frontend/index.html` → "Open with Live Server"
Option B — Double-click `frontend/index.html` to open directly in browser

> Note: `frontend/js/config.js` is already set to `MODE: 'local'` so it will talk to your local server on port 3001.

---

## ☁️ Cloud Architecture (AWS)

```
Student Browser
     │
     ▼
CloudFront CDN  ←── S3 Bucket (index.html, CSS, JS)
     │
     ▼ HTTPS
API Gateway  (POST /analyze)
     │
     ▼
Lambda Function  (lambda.js)
     │           └── ANTHROPIC_API_KEY (env variable, secure)
     ▼
Anthropic Claude API  →  AI Career Report
     │
     ▼
DynamoDB  (save report for student)
```

---

## ☁️ How to Deploy to AWS

### 1. Host Frontend on S3 + CloudFront
```bash
# Create S3 bucket
aws s3 mb s3://pathfinder-school-app

# Upload frontend files
aws s3 sync frontend/ s3://pathfinder-school-app --acl public-read

# Enable static website hosting (in AWS Console)
# S3 → Bucket → Properties → Static website hosting → Enable
# Index document: index.html
```
Then create a CloudFront distribution pointing to this S3 bucket.

### 2. Create Lambda Function
```bash
# Zip the lambda file
zip lambda.zip lambda.js

# Create Lambda function in AWS Console
# Runtime: Node.js 20.x
# Handler: lambda.handler
# Upload the zip file
# Add environment variable: ANTHROPIC_API_KEY = your_key
```

### 3. Create API Gateway
- Create HTTP API → Add Lambda integration
- Route: POST /analyze
- Deploy and copy the endpoint URL

### 4. Update Frontend Config
Open `frontend/js/config.js` and update:
```javascript
MODE: 'production',
PRODUCTION_API_URL: 'https://YOUR_API_GATEWAY_ID.execute-api.ap-south-1.amazonaws.com/prod/analyze',
```
Then re-upload `frontend/js/config.js` to S3.

---

## 🔧 VS Code Extensions Recommended
- **Live Server** — Opens HTML files with auto-reload
- **Prettier** — Code formatting
- **ESLint** — JavaScript linting
- **REST Client** — Test your API routes

---

## 🧪 Test the Backend API
With your server running, open a new terminal and test:
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Give me a short career suggestion for a Class 11 student who loves coding. Respond in JSON with keys: summary, topCareers."}'
```

Or check server health:
```bash
curl http://localhost:3001/health
```

---

## 🛠 Cloud Services Used
| Service | Purpose |
|---------|---------|
| AWS S3 | Host HTML/CSS/JS files |
| AWS CloudFront | Global CDN delivery |
| AWS API Gateway | Public HTTPS endpoint |
| AWS Lambda | Serverless backend function |
| Anthropic Claude API | AI career report generation |
| AWS DynamoDB | Store student reports (optional) |
| AWS Cognito | Student login/auth (optional) |

---

## 📝 Notes
- Never put your `ANTHROPIC_API_KEY` directly in any frontend JS file
- The `.env` file is gitignored — never commit it
- In production, the API key lives only inside Lambda environment variables
