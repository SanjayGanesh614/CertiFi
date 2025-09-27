import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '../contexts/Web3Context';
import zeroGService from '../services/zeroGService';

const NetworkStatus = () => {
  const { isConnected, isCorrectNetwork, chainId, switchToZGNetwork, balance } = useWeb3();
  const [networkStatus, setNetworkStatus] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch 0G Network status
  useEffect(() => {
    const fetchNetworkStatus = async () => {
      try {
        setLoading(true);
        const status = await zeroGService.getNetworkStatus();
        setNetworkStatus(status);
      } catch (error) {
        console.error('Failed to fetch network status:', error);
        setNetworkStatus({
          storage: { error: 'Unavailable' },
          compute: { error: 'Unavailable' },
          da: { error: 'Unavailable' },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkStatus();

    // Refresh status every 30 seconds
    const interval = setInterval(fetchNetworkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isConnected) {
    return (
      <motion.div
        className="network-status disconnected"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="status-indicator">
          <motion.span
            className="status-dot offline"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="status-text">Wallet Not Connected</span>
        </div>
      </motion.div>
    );
  }

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case '16601':
        return '0G Galileo Testnet';
      case '16600':
        return '0G Mainnet';
      case '1':
        return 'Ethereum Mainnet';
      case '11155111':
        return 'Sepolia Testnet';
      default:
        return `Chain ${chainId}`;
    }
  };

  const getServiceStatus = (service) => {
    if (!service) return 'unknown';
    if (service.error) return 'error';
    if (service.initialized === false) return 'offline';
    return 'online';
  };

  const getServiceIcon = (status) => {
    switch (status) {
      case 'online':
        return '✅';
      case 'error':
        return '❌';
      case 'offline':
        return '⚠️';
      default:
        return '❓';
    }
  };

  return (
    <motion.div
      className={`network-status ${isCorrectNetwork ? 'connected' : 'wrong-network'}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="status-main"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="status-indicator">
          <motion.span
            className={`status-dot ${isCorrectNetwork ? 'online' : 'warning'}`}
            animate={isCorrectNetwork ? 
              { scale: [1, 1.1, 1], boxShadow: ['0 0 0 0 rgba(67, 233, 123, 0.7)', '0 0 0 10px rgba(67, 233, 123, 0)', '0 0 0 0 rgba(67, 233, 123, 0)'] } :
              { scale: [1, 1.2, 1] }
            }
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="status-text">
            {isCorrectNetwork ? '0G Network Connected' : 'Wrong Network'}
          </span>
        </div>

        <div className="status-info">
          <span className="network-name">{getNetworkName(chainId)}</span>
          <span className="balance">{parseFloat(balance).toFixed(4)} OG</span>
        </div>

        <motion.button
          className="expand-btn"
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▶
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {!isCorrectNetwork && (
          <motion.div
            className="network-warning"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p>Please switch to 0G Testnet to use VeriRWA</p>
            <motion.button
              onClick={switchToZGNetwork}
              className="button button-warning switch-network-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Switch to 0G Testnet
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="status-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="services-status">
              <h4>0G Network Services Status</h4>

              {loading ? (
                <motion.div
                  className="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="loading-spinner" />
                  Loading network status...
                </motion.div>
              ) : networkStatus ? (
                <motion.div
                  className="services-grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, staggerChildren: 0.1 }}
                >
                  {[
                    { key: 'storage', name: '0G Storage', description: 'Decentralized File Storage' },
                    { key: 'compute', name: '0G Compute', description: 'AI Inference Network' },
                    { key: 'da', name: '0G DA', description: 'Data Availability Layer' }
                  ].map((service, index) => (
                    <motion.div
                      key={service.key}
                      className="service-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <span className="service-icon">
                        {getServiceIcon(getServiceStatus(networkStatus[service.key]))}
                      </span>
                      <div className="service-info">
                        <span className="service-name">{service.name}</span>
                        <span className="service-status">
                          {networkStatus[service.key].error || service.description}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  className="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Failed to load network status
                </motion.div>
              )}
            </div>

            <motion.div
              className="network-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h4>Network Information</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Chain ID:</span>
                  <span className="detail-value">{chainId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">RPC URL:</span>
                  <span className="detail-value">evmrpc-testnet.0g.ai</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Explorer:</span>
                  <a
                    href="https://explorer-testnet.0g.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    explorer-testnet.0g.ai
                  </a>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Faucet:</span>
                  <a
                    href="https://faucet.0g.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    faucet.0g.ai
                  </a>
                </div>
              </div>
            </motion.div>

            {networkStatus && (
              <motion.div
                className="last-updated"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                Last updated: {new Date(networkStatus.timestamp).toLocaleTimeString()}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .network-status {
          background: var(--bg-primary);
          backdrop-filter: var(--blur-md);
          -webkit-backdrop-filter: var(--blur-md);
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border-light);
          margin: var(--spacing-md) 0;
          overflow: hidden;
          box-shadow: var(--shadow-md);
          transition: all var(--transition-normal);
        }

        .network-status:hover {
          box-shadow: var(--shadow-lg);
        }

        .network-status.connected {
          border-color: rgba(67, 233, 123, 0.3);
        }

        .network-status.wrong-network {
          border-color: rgba(255, 107, 107, 0.3);
        }

        .network-status.disconnected {
          border-color: rgba(255, 193, 7, 0.3);
        }

        .status-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-md) var(--spacing-lg);
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .status-main:hover {
          background: var(--bg-hover);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-dot.online {
          background: var(--success-color);
          box-shadow: 0 0 10px rgba(67, 233, 123, 0.5);
        }

        .status-dot.warning {
          background: var(--warning-color);
          box-shadow: 0 0 10px rgba(250, 112, 154, 0.5);
        }

        .status-dot.offline {
          background: #6c757d;
        }

        .status-text {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .status-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
        }

        .network-name {
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .balance {
          color: var(--accent-color);
          font-weight: 600;
          font-size: 0.875rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .expand-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          padding: var(--spacing-xs);
          border-radius: var(--border-radius-sm);
          transition: all var(--transition-normal);
        }

        .expand-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .network-warning {
          background: rgba(255, 107, 107, 0.1);
          border-top: 1px solid rgba(255, 107, 107, 0.2);
          padding: var(--spacing-md) var(--spacing-lg);
          text-align: center;
        }

        .network-warning p {
          color: var(--error-color);
          font-size: 0.875rem;
          margin-bottom: var(--spacing-md);
        }

        .switch-network-btn {
          font-size: 0.875rem;
          padding: var(--spacing-sm) var(--spacing-md);
        }

        .status-details {
          border-top: 1px solid var(--border-light);
          padding: var(--spacing-lg);
          background: var(--bg-secondary);
        }

        .services-status,
        .network-details {
          margin-bottom: var(--spacing-lg);
        }

        .services-status h4,
        .network-details h4 {
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: var(--spacing-md);
        }

        .services-grid {
          display: grid;
          gap: var(--spacing-md);
        }

        .service-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--bg-primary);
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border-light);
          transition: all var(--transition-normal);
        }

        .service-item:hover {
          background: var(--bg-hover);
          transform: translateY(-1px);
        }

        .service-icon {
          font-size: 1.25rem;
          min-width: 1.5rem;
          text-align: center;
        }

        .service-info {
          flex: 1;
        }

        .service-name {
          display: block;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .service-status {
          display: block;
          color: var(--text-muted);
          font-size: 0.75rem;
          margin-top: var(--spacing-xs);
        }

        .details-grid {
          display: grid;
          gap: var(--spacing-sm);
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm) 0;
          border-bottom: 1px solid var(--border-light);
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-label {
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .detail-value {
          color: var(--text-primary);
          font-size: 0.75rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .detail-link {
          color: var(--accent-color);
          font-size: 0.75rem;
          text-decoration: none;
          font-family: 'JetBrains Mono', monospace;
          transition: all var(--transition-normal);
        }

        .detail-link:hover {
          text-decoration: underline;
          color: var(--primary-color);
        }

        .loading {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--text-secondary);
          font-size: 0.875rem;
          padding: var(--spacing-md) 0;
        }

        .error {
          color: var(--error-color);
          font-size: 0.875rem;
          padding: var(--spacing-md) 0;
          text-align: center;
        }

        .last-updated {
          color: var(--text-muted);
          font-size: 0.75rem;
          text-align: center;
          margin-top: var(--spacing-md);
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--border-light);
        }

        @media (max-width: 768px) {
          .status-main {
            padding: var(--spacing-md);
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-sm);
          }

          .status-info {
            gap: var(--spacing-md);
            align-self: stretch;
            justify-content: space-between;
          }

          .expand-btn {
            align-self: flex-end;
          }

          .status-details {
            padding: var(--spacing-md);
          }

          .network-warning {
            padding: var(--spacing-md);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default NetworkStatus;