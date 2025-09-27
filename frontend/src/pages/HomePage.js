import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Cpu, 
  Database, 
  DollarSign, 
  Globe, 
  Lock,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      title: 'AI-Powered Verification',
      description: 'Advanced AI models verify asset authenticity and detect fraud using 0G Compute',
      icon: Cpu,
      color: '#8b5cf6'
    },
    {
      title: 'Secure Tokenization',
      description: 'Transform real-world assets into secure NFTs with verifiable proofs',
      icon: Shield,
      color: '#a78bfa'
    },
    {
      title: 'Decentralized Storage',
      description: 'Asset documents stored securely on 0G Storage with cryptographic hashes',
      icon: Database,
      color: '#c4b5fd'
    },
    {
      title: 'Staking Rewards',
      description: 'Earn 12% APY by validating asset authenticity and contributing to network security',
      icon: DollarSign,
      color: '#10b981'
    },
    {
      title: 'Global Marketplace',
      description: 'Trade verified RWA tokens with confidence in a transparent marketplace',
      icon: Globe,
      color: '#8b5cf6'
    },
    {
      title: 'Zero-Knowledge Proofs',
      description: 'Cryptographic proofs ensure AI verification results are tamper-proof',
      icon: Lock,
      color: '#a78bfa'
    }
  ];

  // Floating star elements
  const floatingStars = [
    { delay: 0, x: '10%', y: '20%', size: 2 },
    { delay: 1, x: '80%', y: '15%', size: 3 },
    { delay: 2, x: '15%', y: '60%', size: 2 },
    { delay: 3, x: '85%', y: '70%', size: 1.5 },
    { delay: 4, x: '5%', y: '80%', size: 2.5 },
    { delay: 5, x: '90%', y: '40%', size: 2 },
    { delay: 6, x: '25%', y: '35%', size: 1.5 },
    { delay: 7, x: '70%', y: '50%', size: 2 },
    { delay: 8, x: '40%', y: '75%', size: 1.5 },
    { delay: 9, x: '60%', y: '25%', size: 2.5 },
    { delay: 10, x: '35%', y: '10%', size: 1.5 },
    { delay: 11, x: '75%', y: '85%', size: 2 }
  ];

  const stats = [
    { label: 'Total Value Locked', value: '$2.5M', change: '+15%' },
    { label: 'Assets Verified', value: '1,247', change: '+23%' },
    { label: 'Active Validators', value: '156', change: '+8%' },
    { label: 'Success Rate', value: '99.2%', change: '+0.1%' }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        {/* Floating Star Elements */}
        {floatingStars.map((star, index) => (
          <motion.div
            key={index}
            className="floating-star"
            style={{ 
              position: 'absolute',
              left: star.x,
              top: star.y,
              zIndex: 1,
              width: `${star.size}px`,
              height: `${star.size}px`
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.3, 0.7, 0.3], 
              scale: [1, 1.2, 1],
              y: [0, -10, 0]
            }}
            transition={{ 
              delay: star.delay * 0.3,
              duration: 3 + (star.delay * 0.2),
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}

        <div className="container">
          <motion.div 
            className="hero-content text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Redefining <span className="gradient-text">Digital Solutions</span><br />
              with <span className="gradient-text animate-float">Web3 Innovation</span>
            </motion.h1>
            <motion.p 
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Unlock the future of business with cutting-edge digital strategies,
              powered by blockchain technology and AI-driven verification systems
              for trustworthy asset tokenization.
            </motion.p>
            <motion.div 
              className="hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link to="/upload" className="button button-large">
                <Zap size={20} /> 
                DISCOVER MORE
              </Link>
              <Link to="/marketplace" className="button button-outline button-large">
                <ArrowRight size={20} /> 
                Explore Marketplace
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Central Cosmic Orb */}
        <motion.div
          className="cosmic-orb"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        />
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <motion.div 
            className="stats-grid"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="stat-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ 
                  scale: 1.05, 
                  transition: { duration: 0.2 } 
                }}
              >
                <motion.div 
                  className="stat-value"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.4, type: "spring", stiffness: 200 }}
                >
                  {stat.value}
                </motion.div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-change positive">{stat.change}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.h2 
            className="section-title text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Why Choose <span className="gradient-text">VeriRWA</span>?
          </motion.h2>
          <motion.div 
            className="features-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="feature-card card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ 
                  y: -15,
                  transition: { duration: 0.3 }
                }}
              >
                <motion.div 
                  className="feature-icon-container"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                    transition: { duration: 0.3 }
                  }}
                >
                  <feature.icon 
                    size={48} 
                    className="feature-icon" 
                    style={{ color: feature.color }}
                  />
                </motion.div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Upload Asset Documents</h3>
                <p>Upload property deeds, certificates, or asset documentation securely to 0G Storage</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>AI Verification</h3>
                <p>Advanced AI models analyze documents for authenticity, fraud detection, and valuation</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Generate Proof</h3>
                <p>0G Compute generates cryptographic proofs of AI verification results</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Mint & Trade</h3>
                <p>Asset is tokenized as NFT with embedded proofs, ready for marketplace trading</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content text-center">
            <h2>Ready to Tokenize Your Assets?</h2>
            <p>Join the future of real-world asset tokenization with AI-powered verification</p>
            <div className="cta-actions">
              <Link to="/upload" className="button button-primary">
                Get Started Now
              </Link>
              <Link to="/staking" className="button button-outline">
                Become a Validator
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
        }

        .hero {
          padding: var(--spacing-3xl) 0;
          text-align: center;
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          display: flex;
          align-items: center;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%),
            radial-gradient(ellipse at 30% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 70%),
            radial-gradient(ellipse at 70% 80%, rgba(167, 139, 250, 0.03) 0%, transparent 70%);
          pointer-events: none;
        }

        .floating-star {
          position: absolute;
          pointer-events: none;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          box-shadow: 
            0 0 4px rgba(255, 255, 255, 0.3),
            0 0 8px rgba(255, 255, 255, 0.1);
        }

        .cosmic-orb {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          height: 400px;
          background: 
            radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 70%),
            radial-gradient(circle at 70% 70%, rgba(167, 139, 250, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(40px);
          z-index: 0;
          animation: cosmicPulse 4s ease-in-out infinite;
        }

        @keyframes cosmicPulse {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
          }
        }

        .hero-content {
          position: relative;
          z-index: 2;
        }

        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: var(--spacing-xl);
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: clamp(1.125rem, 2.5vw, 1.375rem);
          line-height: 1.6;
          color: var(--text-secondary);
          max-width: 800px;
          margin: 0 auto var(--spacing-2xl);
          font-weight: 400;
        }

        .hero-actions {
          display: flex;
          gap: var(--spacing-lg);
          justify-content: center;
          flex-wrap: wrap;
        }

        .stats-section {
          padding: var(--spacing-2xl) 0;
          position: relative;
        }



        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-xl);
          position: relative;
          z-index: 2;
        }

        .stat-card {
          text-align: center;
          padding: var(--spacing-xl);
          background: rgba(0, 0, 0, 0.4);
          border-radius: var(--border-radius-xl);
          border: 1px solid rgba(167, 139, 250, 0.1);
          backdrop-filter: var(--blur-md);
          -webkit-backdrop-filter: var(--blur-md);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(167, 139, 250, 0.05);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--secondary-gradient);
        }

        .stat-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .stat-value {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: var(--spacing-sm);
          font-family: 'Inter', sans-serif;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-change {
          font-size: 0.75rem;
          font-weight: 700;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius-md);
          background: rgba(67, 233, 123, 0.1);
          color: var(--success-color);
          display: inline-block;
        }

        .features-section {
          padding: var(--spacing-3xl) 0;
        }

        .section-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: var(--spacing-3xl);
          letter-spacing: -0.02em;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: var(--spacing-xl);
        }

        .feature-card {
          text-align: center;
          padding: var(--spacing-2xl);
          transition: all var(--transition-normal);
          position: relative;
        }

        .feature-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          margin: 0 auto var(--spacing-lg);
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(167, 139, 250, 0.3);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .feature-icon {
          filter: drop-shadow(0 4px 12px rgba(139, 92, 246, 0.4));
        }

        .feature-title {
          font-size: 1.375rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
        }

        .feature-description {
          color: var(--text-secondary);
          line-height: 1.7;
          font-size: 1rem;
        }

        .how-it-works {
          padding: var(--spacing-3xl) 0;
          position: relative;
        }

        .steps-container {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: var(--spacing-xl);
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          max-width: 250px;
          text-align: center;
          flex: 1;
          min-width: 200px;
        }

        .step-number {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--primary-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          font-weight: 900;
          color: white;
          margin-bottom: var(--spacing-lg);
          box-shadow: var(--shadow-lg);
          position: relative;
        }

        .step-number::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border-radius: 50%;
          background: var(--accent-gradient);
          z-index: -1;
          opacity: 0.3;
        }

        .step-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }

        .step-content h3 {
          color: var(--text-primary);
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: var(--spacing-md);
          text-align: center;
        }

        .step-content p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.6;
          text-align: center;
          max-width: 100%;
        }

        .step-arrow {
          font-size: 2rem;
          color: var(--accent-color);
          font-weight: bold;
          opacity: 0.6;
          margin: 0 var(--spacing-md);
        }

        .cta-section {
          padding: var(--spacing-3xl) 0;
          position: relative;
        }

        .cta-content {
          position: relative;
          z-index: 2;
        }

        .cta-content h2 {
          font-size: clamp(2rem, 5vw, 3rem);
          color: white;
          margin-bottom: var(--spacing-lg);
          font-weight: 800;
        }

        .cta-content p {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: var(--spacing-2xl);
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-actions {
          display: flex;
          gap: var(--spacing-lg);
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .hero {
            padding: var(--spacing-2xl) 0;
          }

          .hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .hero-actions .button {
            min-width: 200px;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--spacing-lg);
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-lg);
          }

          .steps-container {
            flex-direction: column;
            gap: var(--spacing-xl);
          }

          .step {
            max-width: 300px;
          }

          .step-arrow {
            transform: rotate(90deg);
            margin: var(--spacing-md) 0;
          }

          .cta-actions {
            flex-direction: column;
            align-items: center;
          }

          .cta-actions .button {
            min-width: 200px;
          }
        }

        @media (max-width: 480px) {
          .stat-card {
            padding: var(--spacing-lg);
          }

          .feature-card {
            padding: var(--spacing-xl);
          }

          .step-number {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;