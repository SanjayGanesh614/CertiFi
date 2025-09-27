import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Upload, 
  ShoppingBag, 
  Coins, 
  BarChart3, 
  Menu, 
  X,
  Zap,
  Wallet
} from 'lucide-react';

const Header = ({
  account,
  chainId,
  isConnecting,
  onConnect,
  onDisconnect,
  onSwitchNetwork
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isCorrectNetwork = chainId === '16602'; // 0G testnet

  const formatAccount = (account) => {
    if (!account) return '';
    return `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case '16602':
        return '0G Testnet';
      case '16600':
        return '0G Mainnet';
      case '1':
        return 'Ethereum';
      case '137':
        return 'Polygon';
      default:
        return 'Unknown Network';
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/upload', label: 'Upload Asset', icon: Upload },
    { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { path: '/staking', label: 'Staking', icon: Coins },
    ...(account ? [{ path: '/dashboard', label: 'Dashboard', icon: BarChart3 }] : [])
  ];

  return (
    <>
      <motion.header 
        className="header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <motion.div
                className="logo-icon"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <Zap size={28} className="logo-zap" />
              </motion.div>
              <span className="logo-text gradient-text">VeriRWA</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="nav desktop-nav">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                >
                  <Link 
                    to={item.path} 
                    className={`nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
                  >
                    <item.icon size={18} className="nav-icon" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <motion.div
                animate={isMobileMenuOpen ? { rotate: 180 } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.div>
            </button>

            {/* Wallet Section */}
            <motion.div 
              className="wallet-section"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {chainId && (
                <motion.div 
                  className={`network-badge ${!isCorrectNetwork ? 'wrong-network' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="network-indicator"></span>
                  {getNetworkName(chainId)}
                  {!isCorrectNetwork && (
                    <button
                      onClick={onSwitchNetwork}
                      className="switch-network-btn"
                    >
                      Switch to 0G
                    </button>
                  )}
                </motion.div>
              )}

              {account ? (
                <div className="wallet-connected">
                  <motion.div 
                    className="account-info"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Wallet size={16} className="account-avatar" />
                    <span className="account-address">{formatAccount(account)}</span>
                  </motion.div>
                  <motion.button 
                    className="button button-secondary disconnect-btn" 
                    onClick={onDisconnect}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Disconnect
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  className="button button-primary connect-btn"
                  onClick={onConnect}
                  disabled={isConnecting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isConnecting ? (
                    <>
                      <div className="loading-spinner"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet size={18} />
                      Connect Wallet
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.nav
              className="mobile-nav"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-nav-header">
                <span className="mobile-nav-title gradient-text">Navigation</span>
                <button
                  className="mobile-nav-close"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="mobile-nav-items">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
                      to={item.path}
                      className={`mobile-nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon size={20} className="mobile-nav-icon" />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .header {
          background: transparent;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(167, 139, 250, 0.1);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          transition: all 0.3s ease;
        }

        .logo:hover {
          transform: translateY(-2px);
        }

        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--secondary-gradient);
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
        }

        .logo-zap {
          color: white;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
        }

        .logo-text {
          font-size: 1.75rem;
          letter-spacing: -0.02em;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          font-size: 0.875rem;
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(139, 92, 246, 0.2);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
          border-radius: 12px;
        }

        .nav-link:hover::before,
        .nav-link.active::before {
          transform: scaleX(1);
        }

        .nav-link.active {
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(167, 139, 250, 0.3);
        }

        .nav-link:hover,
        .nav-link.active {
          color: white;
          transform: translateY(-1px);
        }

        .nav-icon {
          font-size: 1rem;
        }

        .mobile-menu-button {
          display: none;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.5rem;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mobile-menu-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .wallet-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .network-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 20px;
          color: #10b981;
          font-size: 0.75rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .network-badge.wrong-network {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .network-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s ease-in-out infinite;
          box-shadow: 0 0 8px currentColor;
        }

        .switch-network-btn {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          text-decoration: underline;
          font-size: inherit;
          margin-left: 0.5rem;
          transition: opacity 0.3s ease;
        }

        .switch-network-btn:hover {
          opacity: 0.8;
        }

        .wallet-connected {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .account-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .account-avatar {
          font-size: 1rem;
        }

        .account-address {
          font-family: 'JetBrains Mono', monospace;
        }

        .connect-btn {
          font-size: 0.875rem;
          padding: 0.75rem 1.5rem;
        }

        .disconnect-btn {
          font-size: 0.75rem;
          padding: 0.5rem 1rem;
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 200;
        }

        .mobile-nav {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 280px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.2);
          padding: 2rem 0;
          z-index: 201;
        }

        .mobile-nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          margin-bottom: 2rem;
        }

        .mobile-nav-title {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .mobile-nav-close {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.5rem;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mobile-nav-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .mobile-nav-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0 1rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1rem;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .mobile-nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .mobile-nav-link:hover::before,
        .mobile-nav-link.active::before {
          transform: translateX(0);
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          color: white;
        }

        .mobile-nav-icon {
          font-size: 1.25rem;
          min-width: 1.5rem;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }

          .mobile-menu-button {
            display: block;
          }

          .wallet-section {
            gap: 0.5rem;
          }

          .network-badge {
            padding: 0.375rem 0.75rem;
            font-size: 0.625rem;
          }

          .account-info {
            padding: 0.375rem 0.5rem;
            font-size: 0.75rem;
          }

          .connect-btn {
            font-size: 0.75rem;
            padding: 0.5rem 1rem;
          }
        }

        @media (max-width: 480px) {
          .header-content {
            gap: 1rem;
          }

          .logo-text {
            display: none;
          }

          .network-badge {
            display: none;
          }

          .mobile-nav {
            width: 100vw;
          }
        }
      `}</style>
    </>
  );
};

export default Header;