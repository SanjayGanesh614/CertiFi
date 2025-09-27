import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Web3Provider, useWeb3 } from './contexts/Web3Context';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import MarketplacePage from './pages/MarketplacePage';
import StakingPage from './pages/StakingPage';
import DashboardPage from './pages/DashboardPage';
import NetworkStatus from './components/NetworkStatus';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import zeroGService from './services/zeroGService';

function AppContent() {
  const {
    account,
    chainId,
    isConnecting,
    connectWallet,
    disconnect,
    switchToZGNetwork
  } = useWeb3();

  return (
    <Router>
      <div className="App">
        <Header
          account={account}
          chainId={chainId}
          isConnecting={isConnecting}
          onConnect={connectWallet}
          onDisconnect={disconnect}
          onSwitchNetwork={switchToZGNetwork}
        />
        <NetworkStatus />

        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <HomePage />
                </motion.div>
              } />
              <Route path="/upload" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <UploadPage />
                </motion.div>
              } />
              <Route path="/marketplace" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <MarketplacePage />
                </motion.div>
              } />
              <Route path="/staking" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <StakingPage />
                </motion.div>
              } />
              <Route path="/dashboard" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <DashboardPage />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </main>

            <motion.footer 
              className="app-footer"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="footer-content">
                <motion.div 
                  className="footer-section"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <h4 className="gradient-text">VeriRWA</h4>
                  <p>AI-Powered RWA Tokenization on 0G Network</p>
                  <p>Real implementation with 0G Storage, Compute & DA</p>
                </motion.div>
                <motion.div 
                  className="footer-section"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h4>0G Network Services</h4>
                  <ul>
                    <li><span className="service-icon">💾</span> 0G Storage - Decentralized file storage</li>
                    <li><span className="service-icon">🤖</span> 0G Compute - AI inference network</li>
                    <li><span className="service-icon">🔒</span> 0G DA - Data availability proofs</li>
                    <li><span className="service-icon">🎯</span> ERC-7857 INFTs - Intelligent NFTs</li>
                  </ul>
                </motion.div>
                <motion.div 
                  className="footer-section"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <h4>Resources</h4>
                  <ul>
                    <li><a href="https://docs.0g.ai" target="_blank" rel="noopener noreferrer">📚 0G Documentation</a></li>
                    <li><a href="https://explorer-testnet.0g.ai" target="_blank" rel="noopener noreferrer">🔍 0G Explorer</a></li>
                    <li><a href="https://faucet.0g.ai" target="_blank" rel="noopener noreferrer">🚰 0G Faucet</a></li>
                    <li><a href="https://github.com/vijaygopalbalasa/VeriRWA" target="_blank" rel="noopener noreferrer">💻 GitHub</a></li>
                  </ul>
                </motion.div>
                <motion.div 
                  className="footer-section"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <h4>Network</h4>
                  <ul>
                    <li><span className="network-info">⚡ Chain ID:</span> 16601 (0G Testnet)</li>
                    <li><span className="network-info">🌐 RPC:</span> evmrpc-testnet.0g.ai</li>
                    <li><span className="network-info">🪙 Token:</span> OG</li>
                    <li><span className="network-info">🔗 EVM:</span> Compatible</li>
                  </ul>
                </motion.div>
              </div>
              <motion.div 
                className="footer-bottom"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <p>&copy; 2024 VeriRWA. Built for ETHGlobal New Delhi Hackathon with real 0G Network integration.</p>
                <p>🚀 No mocks, no templates - Real blockchain implementation</p>
              </motion.div>

              <style jsx>{`
                .app-footer {
                  background: rgba(30, 27, 75, 0.6);
                  backdrop-filter: var(--blur-lg);
                  -webkit-backdrop-filter: var(--blur-lg);
                  border-top: 1px solid rgba(167, 139, 250, 0.2);
                  margin-top: var(--spacing-3xl);
                  position: relative;
                  overflow: hidden;
                }

                .app-footer::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 2px;
                  background: var(--secondary-gradient);
                  opacity: 0.8;
                }

                .app-footer::after {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: 
                    radial-gradient(ellipse at 30% 0%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                    radial-gradient(ellipse at 70% 100%, rgba(167, 139, 250, 0.05) 0%, transparent 50%);
                  pointer-events: none;
                }

                .footer-content {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                  gap: var(--spacing-xl);
                  padding: var(--spacing-3xl) 0 var(--spacing-2xl);
                  max-width: 1200px;
                  margin: 0 auto;
                  padding-left: var(--spacing-lg);
                  padding-right: var(--spacing-lg);
                }

                .footer-section h4 {
                  color: var(--text-primary);
                  font-size: 1.125rem;
                  font-weight: 700;
                  margin-bottom: var(--spacing-md);
                  letter-spacing: -0.02em;
                }

                .footer-section p {
                  color: var(--text-secondary);
                  font-size: 0.875rem;
                  line-height: 1.6;
                  margin-bottom: var(--spacing-sm);
                }

                .footer-section ul {
                  list-style: none;
                  padding: 0;
                  margin: 0;
                }

                .footer-section li {
                  color: var(--text-secondary);
                  font-size: 0.875rem;
                  line-height: 1.6;
                  margin-bottom: var(--spacing-sm);
                  display: flex;
                  align-items: flex-start;
                  gap: var(--spacing-sm);
                }

                .footer-section a {
                  color: var(--accent-color);
                  text-decoration: none;
                  transition: all var(--transition-normal);
                  display: flex;
                  align-items: center;
                  gap: var(--spacing-xs);
                }

                .footer-section a:hover {
                  color: var(--primary-color);
                  transform: translateX(2px);
                }

                .service-icon,
                .network-info {
                  font-weight: 600;
                  min-width: fit-content;
                }

                .footer-bottom {
                  border-top: 1px solid rgba(167, 139, 250, 0.2);
                  padding: var(--spacing-lg) var(--spacing-lg);
                  text-align: center;
                  background: rgba(30, 27, 75, 0.8);
                  position: relative;
                  z-index: 2;
                }

                .footer-bottom p {
                  color: var(--text-muted);
                  font-size: 0.75rem;
                  margin-bottom: var(--spacing-xs);
                  line-height: 1.5;
                }

                .footer-bottom p:last-child {
                  margin-bottom: 0;
                }

                @media (max-width: 768px) {
                  .footer-content {
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: var(--spacing-lg);
                    padding: var(--spacing-2xl) var(--spacing-md) var(--spacing-xl);
                  }

                  .footer-section {
                    text-align: center;
                  }

                  .footer-section li {
                    justify-content: center;
                  }

                  .footer-bottom {
                    padding: var(--spacing-md);
                  }
                }

                @media (max-width: 480px) {
                  .footer-content {
                    grid-template-columns: 1fr;
                    gap: var(--spacing-md);
                    padding: var(--spacing-xl) var(--spacing-sm) var(--spacing-lg);
                  }
                }
              `}</style>
            </motion.footer>
          </div>

      <style jsx>{`
        .App {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }

        .main-content {
          flex: 1;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        /* Cosmic particle effects */
        .App::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(2px 2px at 100px 50px, rgba(139, 92, 246, 0.3), transparent),
            radial-gradient(1px 1px at 200px 100px, rgba(167, 139, 250, 0.4), transparent),
            radial-gradient(1px 1px at 300px 200px, rgba(196, 181, 253, 0.2), transparent),
            radial-gradient(2px 2px at 400px 150px, rgba(124, 58, 237, 0.3), transparent);
          background-repeat: repeat;
          background-size: 500px 500px;
          animation: cosmicDrift 30s linear infinite;
          pointer-events: none;
          z-index: -2;
          opacity: 0.4;
        }

        @keyframes cosmicDrift {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-10px, -10px) rotate(90deg); }
          50% { transform: translate(-20px, 10px) rotate(180deg); }
          75% { transform: translate(10px, -5px) rotate(270deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }
      `}</style>
    </Router>
  );
}

function App() {
  // Health check on app load
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await zeroGService.healthCheck();
        if (!health.healthy) {
          console.warn('⚠️  Backend services may be unavailable:', health.error);
        } else {
          console.log('✅ Backend services healthy');
        }
      } catch (error) {
        console.warn('⚠️  Could not connect to backend services');
      }
    };

    checkHealth();
  }, []);

  return (
    <ErrorBoundary>
      <Web3Provider>
        <AppContent />
      </Web3Provider>
    </ErrorBoundary>
  );
}

export default App;