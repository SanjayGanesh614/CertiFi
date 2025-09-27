import React, { useState, useEffect } from 'react';

const DashboardPage = ({ account, signer, provider }) => {
  const [userAssets, setUserAssets] = useState([]);
  const [stakingInfo, setStakingInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock user data
  const mockUserAssets = [
    {
      tokenId: '1',
      title: 'Luxury Apartment NYC',
      assetType: 'real_estate',
      value: 750000,
      verificationScore: 92,
      status: 'verified',
      createdAt: '2025-09-15',
      image: '/api/placeholder/200/150'
    },
    {
      tokenId: '3',
      title: 'Digital Art Collection',
      assetType: 'artwork',
      value: 15000,
      verificationScore: 88,
      status: 'verified',
      createdAt: '2025-09-10',
      image: '/api/placeholder/200/150'
    },
    {
      tokenId: '7',
      title: 'Carbon Credit Portfolio',
      assetType: 'carbon_credits',
      value: 2500,
      verificationScore: 95,
      status: 'verified',
      createdAt: '2025-09-05',
      image: '/api/placeholder/200/150'
    }
  ];

  const mockStakingInfo = {
    totalStaked: '5000',
    totalRewards: '125.50',
    isValidator: true,
    validationCount: 47,
    stakingDuration: '45 days'
  };

  const mockPortfolioStats = {
    totalValue: 767500,
    totalAssets: 3,
    verifiedAssets: 3,
    averageScore: 92,
    monthlyChange: 5.2
  };

  useEffect(() => {
    if (account) {
      loadDashboardData();
    }
  }, [account]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // In real implementation, these would be API calls
      setUserAssets(mockUserAssets);
      setStakingInfo(mockStakingInfo);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssetTypeLabel = (type) => {
    const labels = {
      'real_estate': 'Real Estate',
      'artwork': 'Artwork',
      'carbon_credits': 'Carbon Credits',
      'commodities': 'Commodities',
      'intellectual_property': 'IP'
    };
    return labels[type] || type;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4ECDC4';
    if (score >= 60) return '#FFE66D';
    return '#FF6B6B';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return '#4ECDC4';
      case 'pending': return '#FFE66D';
      case 'rejected': return '#FF6B6B';
      default: return '#fff';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!account) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="card text-center">
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to view your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>My Dashboard</h1>
          <p>Manage your assets, track performance, and monitor staking rewards</p>
        </div>

        {/* Portfolio Overview */}
        <div className="portfolio-overview">
          <h2>Portfolio Overview</h2>
          <div className="portfolio-stats">
            <div className="stat-card primary">
              <div className="stat-value">{formatCurrency(mockPortfolioStats.totalValue)}</div>
              <div className="stat-label">Total Portfolio Value</div>
              <div className="stat-change positive">+{mockPortfolioStats.monthlyChange}% this month</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{mockPortfolioStats.totalAssets}</div>
              <div className="stat-label">Total Assets</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{mockPortfolioStats.verifiedAssets}</div>
              <div className="stat-label">Verified Assets</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{mockPortfolioStats.averageScore}</div>
              <div className="stat-label">Avg. AI Score</div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* My Assets */}
          <div className="section">
            <div className="section-header">
              <h2>My Assets</h2>
              <button className="button" onClick={() => window.location.href = '/upload'}>
                + Add Asset
              </button>
            </div>

            {userAssets.length === 0 ? (
              <div className="empty-state">
                <p>You haven't tokenized any assets yet.</p>
                <button className="button" onClick={() => window.location.href = '/upload'}>
                  Upload Your First Asset
                </button>
              </div>
            ) : (
              <div className="assets-grid">
                {userAssets.map((asset) => (
                  <div key={asset.tokenId} className="asset-card">
                    <div className="asset-image">
                      <img src={asset.image} alt={asset.title} />
                      <div className="asset-badges">
                        <span className="asset-type-badge">
                          {getAssetTypeLabel(asset.assetType)}
                        </span>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(asset.status) }}
                        >
                          {asset.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="asset-content">
                      <h3 className="asset-title">{asset.title}</h3>

                      <div className="asset-metrics">
                        <div className="metric">
                          <span>Value:</span>
                          <span>{formatCurrency(asset.value)}</span>
                        </div>
                        <div className="metric">
                          <span>AI Score:</span>
                          <span style={{ color: getScoreColor(asset.verificationScore) }}>
                            {asset.verificationScore}/100
                          </span>
                        </div>
                        <div className="metric">
                          <span>Token ID:</span>
                          <span className="token-id">#{asset.tokenId}</span>
                        </div>
                        <div className="metric">
                          <span>Created:</span>
                          <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="asset-actions">
                        <button className="button small">
                          List on Marketplace
                        </button>
                        <button className="button small secondary">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Staking Overview */}
          {stakingInfo && (
            <div className="section">
              <div className="section-header">
                <h2>Staking Overview</h2>
                <button className="button" onClick={() => window.location.href = '/staking'}>
                  Manage Staking
                </button>
              </div>

              <div className="staking-overview">
                <div className="staking-stats">
                  <div className="staking-stat">
                    <div className="stat-value">{stakingInfo.totalStaked} 0G</div>
                    <div className="stat-label">Total Staked</div>
                  </div>
                  <div className="staking-stat">
                    <div className="stat-value">{stakingInfo.totalRewards} 0G</div>
                    <div className="stat-label">Pending Rewards</div>
                  </div>
                  <div className="staking-stat">
                    <div className="stat-value">{stakingInfo.stakingDuration}</div>
                    <div className="stat-label">Staking Duration</div>
                  </div>
                  <div className="staking-stat">
                    <div className="stat-value">{stakingInfo.validationCount}</div>
                    <div className="stat-label">Validations Done</div>
                  </div>
                </div>

                {stakingInfo.isValidator && (
                  <div className="validator-status">
                    <div className="validator-badge">
                      ✓ Active Validator
                    </div>
                    <p>You're earning additional rewards for validating asset authenticity</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="section">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">🎯</div>
                <div className="activity-content">
                  <div className="activity-title">Asset Verified</div>
                  <div className="activity-description">
                    Your "Luxury Apartment NYC" received a verification score of 92/100
                  </div>
                  <div className="activity-time">2 hours ago</div>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon">💰</div>
                <div className="activity-content">
                  <div className="activity-title">Rewards Claimed</div>
                  <div className="activity-description">
                    Successfully claimed 25.3 0G tokens from staking rewards
                  </div>
                  <div className="activity-time">1 day ago</div>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon">📄</div>
                <div className="activity-content">
                  <div className="activity-title">Asset Uploaded</div>
                  <div className="activity-description">
                    Started verification process for "Digital Art Collection"
                  </div>
                  <div className="activity-time">3 days ago</div>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon">🛡️</div>
                <div className="activity-content">
                  <div className="activity-title">Validator Status</div>
                  <div className="activity-description">
                    Promoted to validator status by staking 5,000 0G tokens
                  </div>
                  <div className="activity-time">1 week ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-page {
          padding: 40px 0;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .dashboard-header h1 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .dashboard-header p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
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

        .portfolio-overview {
          margin-bottom: 40px;
        }

        .portfolio-overview h2 {
          color: white;
          margin-bottom: 24px;
          font-size: 1.8rem;
        }

        .portfolio-stats {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 20px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 24px;
          text-align: center;
        }

        .stat-card.primary {
          background: linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(68, 160, 141, 0.2));
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #4ECDC4;
          margin-bottom: 8px;
        }

        .stat-card.primary .stat-value {
          font-size: 2.5rem;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          margin-bottom: 4px;
        }

        .stat-change {
          font-size: 12px;
          font-weight: 600;
        }

        .stat-change.positive {
          color: #4ECDC4;
        }

        .dashboard-content {
          space-y: 60px;
        }

        .section {
          margin-bottom: 60px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .section-header h2 {
          color: white;
          font-size: 1.8rem;
        }

        .empty-state {
          text-align: center;
          padding: 60px 30px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          border: 2px dashed rgba(255, 255, 255, 0.2);
        }

        .empty-state p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 20px;
          font-size: 1.1rem;
        }

        .assets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 30px;
        }

        .asset-card {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(167, 139, 250, 0.1);
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .asset-card:hover {
          transform: translateY(-5px);
        }

        .asset-image {
          position: relative;
          height: 160px;
          overflow: hidden;
        }

        .asset-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .asset-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .asset-type-badge,
        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .asset-type-badge {
          background: rgba(0, 0, 0, 0.7);
        }

        .asset-content {
          padding: 20px;
        }

        .asset-title {
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .asset-metrics {
          space-y: 8px;
          margin-bottom: 20px;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .metric span:first-child {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .metric span:last-child {
          color: white;
          font-weight: 500;
          font-size: 14px;
        }

        .token-id {
          font-family: monospace;
          color: #4ECDC4;
        }

        .asset-actions {
          display: flex;
          gap: 10px;
        }

        .button.small {
          padding: 8px 12px;
          font-size: 13px;
          flex: 1;
        }

        .button.secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .staking-overview {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 30px;
        }

        .staking-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 30px;
          margin-bottom: 30px;
        }

        .staking-stat {
          text-align: center;
        }

        .staking-stat .stat-value {
          font-size: 1.5rem;
          color: #4ECDC4;
          margin-bottom: 8px;
        }

        .staking-stat .stat-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .validator-status {
          text-align: center;
          padding: 20px;
          background: rgba(78, 205, 196, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(78, 205, 196, 0.3);
        }

        .validator-badge {
          display: inline-block;
          background: #4ECDC4;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .validator-status p {
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

        .activity-list {
          space-y: 16px;
        }

        .activity-item {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 16px;
        }

        .activity-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(78, 205, 196, 0.2);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          color: white;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .activity-description {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 4px;
        }

        .activity-time {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
        }

        @media (max-width: 768px) {
          .portfolio-stats {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .assets-grid {
            grid-template-columns: 1fr;
          }

          .asset-actions {
            flex-direction: column;
          }

          .staking-stats {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;