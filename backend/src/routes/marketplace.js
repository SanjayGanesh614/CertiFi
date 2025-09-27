const express = require('express');
const router = express.Router();

router.get('/listings', async (req, res) => {
  try {
    const listings = await req.app.locals.blockchainService.getMarketListings();
    res.json({ success: true, data: listings });
  } catch (error) {
    console.error('Error fetching market listings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/listing/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const listing = await req.app.locals.blockchainService.contracts.marketplace.listings(tokenId);
    res.json({ success: true, data: listing });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/offers/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const offers = await req.app.locals.blockchainService.contracts.marketplace.getActiveOffers(tokenId);
    res.json({ success: true, data: offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;