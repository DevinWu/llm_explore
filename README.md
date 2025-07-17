# Commercial Translation Website

A complete commercial translation platform with user authentication, Chinese-to-English translation services, Chrome extension integration, and payment processing.

## Features

- User registration and authentication
- Platform selection (Amazon, eBay)
- Chinese to English translation using Google Cloud Translation API
- Chrome extension for tab content capture
- Payment integration (Alipay/WeChat Pay)
- Billing system: first 10 translations free, then 1 RMB per use
- User balance management and transaction history

## Project Structure

```
├── backend/          # FastAPI backend application
├── frontend/         # React frontend application
├── chrome-extension/ # Chrome extension for tab capture
└── README.md
```

## Setup Instructions

### Backend
```bash
cd backend
poetry install
poetry run fastapi dev app/main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Chrome Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `chrome-extension` directory

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get user profile
- `POST /api/translate` - Translate text
- `GET /api/translations/history` - Get translation history
- `POST /api/payment/topup` - Top up user balance
- `GET /api/user/balance` - Get user balance

## Technology Stack

- **Backend**: FastAPI, SQLite, JWT authentication
- **Frontend**: React, TypeScript, Tailwind CSS
- **Translation**: Google Cloud Translation API
- **Payments**: Alipay Global API
- **Chrome Extension**: Manifest V3
