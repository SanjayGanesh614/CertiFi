# VeriRWA Backend

Backend server for the VeriRWA (Verified Real World Assets) platform, integrating with 0G Network for AI-powered asset verification.

## Setup Instructions

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Configuration**
- Copy `.env.example` to `.env`
- Update the following variables:
  - `ZG_COMPUTE_API_KEY`: Your 0G Compute API key
  - `PRIVATE_KEY`: Your wallet private key
  - `MNEMONIC`: Your wallet mnemonic (backup)
  - `JWT_SECRET`: A secure random string for JWT signing

3. **Start the Server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── server.js          # Main application entry
│   ├── services/          # Core services
│   │   ├── RealBlockchainService.js
│   │   ├── RealZeroGComputeService.js
│   │   ├── RealZeroGDAService.js
│   │   └── RealZeroGStorageService.js
│   ├── routes/           # API routes
│   └── middleware/       # Express middleware
├── .env.example         # Environment variables template
└── package.json
```

## API Documentation

The API documentation will be available at `/api-docs` when running the server (coming soon).

## Testing

Run the test suite:
```bash
npm test
```