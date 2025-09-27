const express = require('express');
const router = express.Router();

router.get('/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const assetDetails = await req.app.locals.blockchainService.getAssetDetails(tokenId);
    res.json({ success: true, data: assetDetails });
  } catch (error) {
    console.error('Error fetching asset details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/owner/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await req.app.locals.blockchainService.contracts.veriRWAINFT.balanceOf(address);
    const assets = [];
    
    for (let i = 0; i < balance; i++) {
      const tokenId = await req.app.locals.blockchainService.contracts.veriRWAINFT.tokenOfOwnerByIndex(address, i);
      const details = await req.app.locals.blockchainService.getAssetDetails(tokenId);
      assets.push({ tokenId, ...details });
    }
    
    res.json({ success: true, data: assets });
  } catch (error) {
    console.error('Error fetching owner assets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;