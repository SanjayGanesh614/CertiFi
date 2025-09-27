require('dotenv').config();
const express = require('express');
const cors = require('cors');
const RealBlockchainService = require('./services/RealBlockchainService');
const Real0GComputeService = require('./services/RealZeroGComputeService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const blockchainService = new RealBlockchainService();
const computeService = new Real0GComputeService();

// Initialize services on startup
async function initializeServices() {
  try {
    await blockchainService.initialize();
    await computeService.initialize();
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    process.exit(1);
  }
}

// Routes will be imported here
// app.use('/api/assets', require('./routes/assets'));
// app.use('/api/marketplace', require('./routes/marketplace'));
// app.use('/api/verification', require('./routes/verification'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initializeServices();
});