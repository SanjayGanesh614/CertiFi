import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const MarketplacePage = ({ account, signer, provider }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    verifiedOnly: false,
    assetType: 'all',
    priceRange: 'all'
  });

  // Mock listings for demonstration
  const mockListings = [
    {
      tokenId: '1',
      assetType: 'real_estate',
      title: 'Luxury Villa in Miami',
      description: 'Beautiful waterfront property with 5 bedrooms',
      price: '850000',
      image: '/api/placeholder/300/200',
      verified: true,
      auditScore: 92,
      seller: '0x1234...5678',
      listingTime: '2025-09-20T10:30:00Z'
    },
    {
      tokenId: '2',
      assetType: 'artwork',
      title: 'Abstract Digital Art Collection',
      description: 'Rare digital artwork by renowned artist',
      price: '25000',
      image: '/api/placeholder/300/200',
      verified: true,
      auditScore: 88,
      seller: '0xabcd...efgh',
      listingTime: '2025-09-19T14:15:00Z'
    },
    {
      tokenId: '3',
      assetType: 'carbon_credits',
      title: 'Certified Carbon Credits Portfolio',
      description: '100 tons of verified carbon offset credits',
      price: '1200',
      image: '/api/placeholder/300/200',
      verified: true,
      auditScore: 95,
      seller: '0x9876...5432',
      listingTime: '2025-09-18T09:45:00Z'
    },
    {
      tokenId: '4',
      assetType: 'commodities',
      title: 'Gold Bullion Certificate',
      description: '10 oz certified gold bars stored in Swiss vault',
      price: '32000',
      image: '/api/placeholder/300/200',
      verified: false,
      auditScore: 65,
      seller: '0xfedc...ba98',
      listingTime: '2025-09-17T16:20:00Z'
    }
  ];

  useEffect(() => {
    loadListings();
  }, [filter]);

  const loadListings = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from the API
      // const response = await axios.get(`${API_BASE_URL}/api/marketplace/listings`, {
      //   params: filter
      // });
      // setListings(response.data.listings);

      // For now, use mock data
      let filteredListings = mockListings;

      if (filter.verifiedOnly) {
        filteredListings = filteredListings.filter(item => item.verified);
      }

      if (filter.assetType !== 'all') {
        filteredListings = filteredListings.filter(item => item.assetType === filter.assetType);
      }

      if (filter.priceRange !== 'all') {
        const [min, max] = filter.priceRange.split('-').map(Number);
        filteredListings = filteredListings.filter(item => {
          const price = parseFloat(item.price);
          return price >= min && (max ? price <= max : true);
        });
      }

      setListings(filteredListings);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyAsset = async (tokenId, price) => {
    if (!account) {
      alert('Please connect your wallet');
      return;
    }

    try {
      // In a real implementation, this would interact with the smart contract
      alert(`Buying asset ${tokenId} for $${price}. This would interact with the marketplace contract.`);
    } catch (error) {
      console.error('Error buying asset:', error);
      alert('Failed to buy asset: ' + error.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getAssetTypeLabel = (type) => {
    const labels = {
      'real_estate': 'Real Estate',
      'artwork': 'Artwork',
      'carbon_credits': 'Carbon Credits',
      'commodities': 'Commodities',
      'intellectual_property': 'IP',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4ECDC4';
    if (score >= 60) return '#FFE66D';
    return '#FF6B6B';
  };

  return (
    <div className="marketplace-page">
      <div className="container">
        <div className="marketplace-header">
          <h1>RWA Marketplace</h1>
          <p>Discover and trade verified real-world assets</p>
        </div>

        <div className="marketplace-filters">
          <div className="filter-group">
            <label>Asset Type</label>
            <select
              value={filter.assetType}
              onChange={(e) => setFilter({...filter, assetType: e.target.value})}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="real_estate">Real Estate</option>
              <option value="artwork">Artwork</option>
              <option value="carbon_credits">Carbon Credits</option>
              <option value="commodities">Commodities</option>
              <option value="intellectual_property">Intellectual Property</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <select
              value={filter.priceRange}
              onChange={(e) => setFilter({...filter, priceRange: e.target.value})}
              className="input"
            >
              <option value="all">All Prices</option>
              <option value="0-1000">Under $1,000</option>
              <option value="1000-10000">$1,000 - $10,000</option>
              <option value="10000-100000">$10,000 - $100,000</option>
              <option value="100000-1000000">$100,000 - $1M</option>
              <option value="1000000">Over $1M</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filter.verifiedOnly}
                onChange={(e) => setFilter({...filter, verifiedOnly: e.target.checked})}
              />
              <span>Verified Only</span>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading marketplace...</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.length === 0 ? (
              <div className="no-listings">
                <p>No assets found matching your criteria</p>
              </div>
            ) : (
              listings.map((listing) => (
                <div key={listing.tokenId} className="listing-card">
                  <div className="listing-image">
                    <img src={listing.image} alt={listing.title} />
                    <div className="listing-badges">
                      <span className="asset-type-badge">
                        {getAssetTypeLabel(listing.assetType)}
                      </span>
                      {listing.verified && (
                        <span className="verified-badge">✓ Verified</span>
                      )}
                    </div>
                  </div>

                  <div className="listing-content">
                    <h3 className="listing-title">{listing.title}</h3>
                    <p className="listing-description">{listing.description}</p>

                    <div className="listing-metrics">
                      <div className="metric">
                        <span>AI Score:</span>
                        <span
                          className="score"
                          style={{ color: getScoreColor(listing.auditScore) }}
                        >
                          {listing.auditScore}/100
                        </span>
                      </div>
                      <div className="metric">
                        <span>Seller:</span>
                        <span className="address">{formatAddress(listing.seller)}</span>
                      </div>
                    </div>

                    <div className="listing-footer">
                      <div className="price">
                        {formatPrice(listing.price)}
                      </div>
                      <button
                        className="button buy-button"
                        onClick={() => handleBuyAsset(listing.tokenId, listing.price)}
                        disabled={!account}
                      >
                        {account ? 'Buy Now' : 'Connect Wallet'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="marketplace-stats">
          <div className="stat">
            <div className="stat-value">{listings.length}</div>
            <div className="stat-label">Active Listings</div>
          </div>
          <div className="stat">
            <div className="stat-value">
              {formatPrice(listings.reduce((sum, item) => sum + parseFloat(item.price), 0))}
            </div>
            <div className="stat-label">Total Value</div>
          </div>
          <div className="stat">
            <div className="stat-value">
              {listings.filter(item => item.verified).length}
            </div>
            <div className="stat-label">Verified Assets</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .marketplace-page {          padding: 40px 0;          position: relative;          min-height: 100vh;        }        .marketplace-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .marketplace-header h1 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .marketplace-header p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
        }

        .marketplace-filters {
          display: flex;
          gap: 20px;
          margin-bottom: 40px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .marketplace-filters select {
          color: black;
          background: rgba(255, 255, 255, 0.9);
        }

        .marketplace-filters select option {
          color: black;
          background: white;
        }

        .filter-group {
          flex: 1;
        }

        .filter-group label {
          display: block;
          color: white;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          margin-top: 28px;
        }

        .checkbox-label input[type="checkbox"] {
          accent-color: #4ECDC4;
        }

        .loading-container {
          text-align: center;
          padding: 60px 0;
          color: white;
        }

        .loading-container p {
          margin-top: 16px;
          color: rgba(255, 255, 255, 0.8);
        }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 30px;
          margin-bottom: 60px;
        }

        .no-listings {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 0;
          color: rgba(255, 255, 255, 0.8);
        }

        .listing-card {
          background: linear-gradient(135deg, #5b21b6 0%, #4c1d95 100%);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          border: 1px solid rgba(107, 33, 168, 0.4);
          overflow: hidden;
          transition: all 0.4s ease;
          box-shadow: 
            0 8px 32px rgba(91, 33, 182, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .listing-card:hover {
          transform: translateY(-5px);
        }

        .listing-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .listing-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .listing-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .asset-type-badge {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .verified-badge {
          background: rgba(78, 205, 196, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .listing-content {
          padding: 20px;
        }

        .listing-title {
          color: white;
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .listing-description {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 16px;
        }

        .listing-metrics {
          space-y: 8px;
          margin-bottom: 20px;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
        }

        .metric span:first-child {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .score {
          font-weight: 600;
        }

        .address {
          font-family: monospace;
          color: #4ECDC4;
          font-size: 14px;
        }

        .listing-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 16px;
        }

        .price {
          color: #4ECDC4;
          font-size: 1.3rem;
          font-weight: 700;
        }

        .buy-button {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .marketplace-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
          margin-top: 60px;
        }

        .stat {
          text-align: center;
          padding: 30px 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #4ECDC4;
          margin-bottom: 8px;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .marketplace-filters {
            flex-direction: column;
          }

          .listings-grid {
            grid-template-columns: 1fr;
          }

          .listing-footer {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .buy-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketplacePage;