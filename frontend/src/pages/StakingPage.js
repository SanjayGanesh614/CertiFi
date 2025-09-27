import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StakingPage = ({ account, signer, provider }) => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [userStakeInfo, setUserStakeInfo] = useState(null);
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState('');

  // Mock staking data
  const stakingStats = {
    totalStaked: '15,647,892',
    apy: '12.5',
    totalValidators: '156',
    minimumStake: '1,000'
  };

  const mockUserStake = {
    amount: '5000',
    rewards: '125.50',
    isValidator: true,
    stakingDuration: '45 days',
    lastRewardClaim: '2025-09-20'
  };

  useEffect(() => {
    if (account) {
      loadUserStakeInfo();
    }
  }, [account]);

  const loadUserStakeInfo = async () => {
    try {
      // In real implementation, this would fetch from the API
      // const response = await axios.get(`${API_BASE_URL}/api/staking/${account}/info`);
      // setUserStakeInfo(response.data);

      // For now, use mock data
      setUserStakeInfo(mockUserStake);
    } catch (error) {
      console.error('Error loading stake info:', error);
    }
  };

  const handleStake = async (e) => {
    e.preventDefault();

    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) < 1000) {
      setError('Minimum stake amount is 1,000 tokens');
      return;
    }

    setIsStaking(true);
    setError('');

    try {
      // In real implementation, this would interact with the staking contract
      alert(`Staking ${stakeAmount} tokens. This would interact with the staking contract.`);

      // Simulate successful staking
      setUserStakeInfo({
        ...userStakeInfo,
        amount: (parseFloat(userStakeInfo?.amount || 0) + parseFloat(stakeAmount)).toString()
      });
      setStakeAmount('');
    } catch (error) {
      console.error('Staking error:', error);
      setError('Failed to stake tokens: ' + error.message);
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async (amount) => {
    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    setIsUnstaking(true);
    setError('');

    try {
      // In real implementation, this would interact with the staking contract
      alert(`Unstaking ${amount} tokens. This would interact with the staking contract.`);

      // Simulate successful unstaking
      setUserStakeInfo({
        ...userStakeInfo,
        amount: (parseFloat(userStakeInfo.amount) - parseFloat(amount)).toString()
      });
    } catch (error) {
      console.error('Unstaking error:', error);
      setError('Failed to unstake tokens: ' + error.message);
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    setIsClaiming(true);
    setError('');

    try {
      // In real implementation, this would interact with the staking contract
      alert(`Claiming ${userStakeInfo.rewards} tokens in rewards.`);

      // Simulate successful claim
      setUserStakeInfo({
        ...userStakeInfo,
        rewards: '0',
        lastRewardClaim: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Claiming error:', error);
      setError('Failed to claim rewards: ' + error.message);
    } finally {
      setIsClaiming(false);
    }
  };

  const calculatePotentialRewards = (amount) => {
    const annualReward = parseFloat(amount) * (parseFloat(stakingStats.apy) / 100);
    const dailyReward = annualReward / 365;
    return dailyReward.toFixed(2);
  };

  if (!account) {
    return (
      <div className="staking-page">
        <div className="container">
          <div className="card text-center">
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to participate in staking and earn rewards.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="staking-page">
      <div className="container">
        <div className="staking-header">
          <h1>Stake & Earn</h1>
          <p>Become a validator and earn rewards while securing the VeriRWA network</p>
        </div>

        {/* Global Staking Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stakingStats.totalStaked}</div>
            <div className="stat-label">Total Staked (0G)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stakingStats.apy}%</div>
            <div className="stat-label">Current APY</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stakingStats.totalValidators}</div>
            <div className="stat-label">Active Validators</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stakingStats.minimumStake}</div>
            <div className="stat-label">Minimum Stake (0G)</div>
          </div>
        </div>

        <div className="staking-content">
          {/* User Stake Info */}
          {userStakeInfo && (
            <div className="user-stake-card">
              <h2>Your Staking Position</h2>

              <div className="stake-overview">
                <div className="stake-item">
                  <span className="stake-label">Staked Amount</span>
                  <span className="stake-value">{userStakeInfo.amount} 0G</span>
                </div>
                <div className="stake-item">
                  <span className="stake-label">Pending Rewards</span>
                  <span className="stake-value reward">{userStakeInfo.rewards} 0G</span>
                </div>
                <div className="stake-item">
                  <span className="stake-label">Validator Status</span>
                  <span className={`stake-value ${userStakeInfo.isValidator ? 'validator' : ''}`}>
                    {userStakeInfo.isValidator ? '✓ Active Validator' : 'Staker'}
                  </span>
                </div>
                <div className="stake-item">
                  <span className="stake-label">Duration</span>
                  <span className="stake-value">{userStakeInfo.stakingDuration}</span>
                </div>
              </div>

              <div className="stake-actions">
                <button
                  className="button claim-button"
                  onClick={handleClaimRewards}
                  disabled={isClaiming || parseFloat(userStakeInfo.rewards) === 0}
                >
                  {isClaiming ? (
                    <>
                      <div className="loading-spinner"></div>
                      Claiming...
                    </>
                  ) : (
                    `Claim ${userStakeInfo.rewards} 0G`
                  )}
                </button>

                <button
                  className="button unstake-button"
                  onClick={() => handleUnstake(userStakeInfo.amount)}
                  disabled={isUnstaking}
                >
                  {isUnstaking ? (
                    <>
                      <div className="loading-spinner"></div>
                      Unstaking...
                    </>
                  ) : (
                    'Unstake All'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Staking Form */}
          <div className="stake-form-card">
            <h2>Stake Tokens</h2>
            <p>Stake your 0G tokens to earn rewards and help secure the network</p>

            <form onSubmit={handleStake} className="stake-form">
              <div className="form-group">
                <label>Amount to Stake (0G)</label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="input"
                  placeholder="Enter amount (min 1,000)"
                  min="1000"
                  step="1"
                />
                {stakeAmount && (
                  <div className="stake-preview">
                    <p>Daily Rewards: ~{calculatePotentialRewards(stakeAmount)} 0G</p>
                    <p>Annual Rewards: ~{(parseFloat(stakeAmount) * parseFloat(stakingStats.apy) / 100).toFixed(2)} 0G</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="error">{error}</div>
              )}

              <button
                type="submit"
                disabled={isStaking || !stakeAmount}
                className="button stake-button"
              >
                {isStaking ? (
                  <>
                    <div className="loading-spinner"></div>
                    Staking...
                  </>
                ) : (
                  'Stake Tokens'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Validator Benefits */}
        <div className="validator-info">
          <h2>Validator Benefits</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h3>Higher Rewards</h3>
              <p>Validators earn additional rewards for processing asset verifications</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🛡️</div>
              <h3>Network Security</h3>
              <p>Help secure the network and validate AI audit results</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🎯</div>
              <h3>Governance Rights</h3>
              <p>Participate in protocol governance and key decisions</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h3>Priority Access</h3>
              <p>Get early access to new features and asset types</p>
            </div>
          </div>
        </div>

        {/* Staking FAQ */}
        <div className="faq-section">
          <h2>Staking FAQ</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How does staking work?</h3>
              <p>Stake your 0G tokens to earn rewards and help validate asset authenticity. Rewards are distributed daily based on your stake amount.</p>
            </div>
            <div className="faq-item">
              <h3>When can I unstake?</h3>
              <p>You can unstake your tokens at any time. There's no lock-up period, but rewards are only earned while tokens are staked.</p>
            </div>
            <div className="faq-item">
              <h3>How do I become a validator?</h3>
              <p>Stake at least 10,000 0G tokens to automatically qualify as a validator and earn additional rewards for verification tasks.</p>
            </div>
            <div className="faq-item">
              <h3>Are there any risks?</h3>
              <p>Staking is generally safe, but validators may face slashing penalties for malicious behavior or extended downtime.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .staking-page {
          padding: 40px 0;
          position: relative;
          min-height: 100vh;
        }

        .staking-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .staking-header h1 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .staking-header p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          border: 1px solid rgba(167, 139, 250, 0.1);
          padding: 24px;
          text-align: center;
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(167, 139, 250, 0.05);
          position: relative;
          overflow: hidden;
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

        .staking-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 60px;
        }

        .user-stake-card,
        .stake-form-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 30px;
        }

        .user-stake-card h2,
        .stake-form-card h2 {
          color: white;
          margin-bottom: 20px;
          font-size: 1.5rem;
        }

        .stake-overview {
          space-y: 16px;
          margin-bottom: 30px;
        }

        .stake-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stake-label {
          color: rgba(255, 255, 255, 0.8);
        }

        .stake-value {
          color: white;
          font-weight: 600;
        }

        .stake-value.reward {
          color: #4ECDC4;
        }

        .stake-value.validator {
          color: #4ECDC4;
        }

        .stake-actions {
          display: flex;
          gap: 12px;
        }

        .stake-actions .button {
          flex: 1;
          padding: 12px;
          font-size: 14px;
        }

        .claim-button {
          background: linear-gradient(45deg, #4ECDC4, #44A08D);
        }

        .unstake-button {
          background: rgba(255, 107, 107, 0.8);
        }

        .stake-form p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .stake-preview {
          margin-top: 12px;
          padding: 12px;
          background: rgba(78, 205, 196, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(78, 205, 196, 0.3);
        }

        .stake-preview p {
          color: #4ECDC4;
          margin: 4px 0;
          font-size: 14px;
        }

        .stake-button {
          width: 100%;
          padding: 16px;
          font-size: 16px;
          font-weight: 600;
          background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
        }

        .validator-info {
          margin-bottom: 60px;
        }

        .validator-info h2 {
          color: white;
          text-align: center;
          margin-bottom: 40px;
          font-size: 2rem;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }

        .benefit-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 30px;
          text-align: center;
          transition: transform 0.3s ease;
        }

        .benefit-card:hover {
          transform: translateY(-5px);
        }

        .benefit-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }

        .benefit-card h3 {
          color: white;
          margin-bottom: 16px;
          font-size: 1.2rem;
        }

        .benefit-card p {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        .faq-section h2 {
          color: white;
          text-align: center;
          margin-bottom: 40px;
          font-size: 2rem;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .faq-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px;
        }

        .faq-item h3 {
          color: #4ECDC4;
          margin-bottom: 12px;
          font-size: 1.1rem;
        }

        .faq-item p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .staking-content {
            grid-template-columns: 1fr;
          }

          .stake-actions {
            flex-direction: column;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .benefits-grid,
          .faq-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default StakingPage;