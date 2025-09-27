import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({
  size = 'medium',
  message = 'Loading...',
  overlay = false,
  color = 'primary'
}) => {
  const sizeConfig = {
    small: 20,
    medium: 40,
    large: 60
  };

  const colorConfig = {
    primary: 'var(--accent-color)',
    blockchain: '#667eea',
    ai: '#f093fb',
    storage: '#43e97b',
    compute: '#fa709a',
    da: '#4facfe'
  };

  const spinnerSize = sizeConfig[size];
  const spinnerColor = colorConfig[color];

  const content = (
    <motion.div
      className={`spinner-container ${overlay ? 'overlay' : ''}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="spinner-wrapper">
        <motion.div
          className="spinner-ring"
          style={{
            width: spinnerSize,
            height: spinnerSize,
            borderColor: `${spinnerColor}33`,
            borderTopColor: spinnerColor
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="spinner-inner-ring"
          style={{
            width: spinnerSize * 0.7,
            height: spinnerSize * 0.7,
            borderColor: 'transparent',
            borderTopColor: `${spinnerColor}66`
          }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
      {message && (
        <motion.p
          className="spinner-message"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );

  if (overlay) {
    return (
      <motion.div
        className="spinner-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

// Specialized loading spinners for different use cases
export const BlockchainLoadingSpinner = ({ message = 'Processing blockchain transaction...' }) => (
  <LoadingSpinner
    size="large"
    message={message}
    overlay={true}
    color="blockchain"
  />
);

export const AIVerificationSpinner = ({ message = 'AI verification in progress...' }) => (
  <LoadingSpinner
    size="large"
    message={message}
    overlay={true}
    color="ai"
  />
);

export const StorageUploadSpinner = ({ message = 'Uploading to 0G Storage...' }) => (
  <LoadingSpinner
    size="medium"
    message={message}
    color="storage"
  />
);

export const ComputeSpinner = ({ message = 'Running 0G Compute...' }) => (
  <LoadingSpinner
    size="medium"
    message={message}
    color="compute"
  />
);

export const DAProofSpinner = ({ message = 'Generating DA proof...' }) => (
  <LoadingSpinner
    size="medium"
    message={message}
    color="da"
  />
);

// Component for showing multiple loading states
export const MultiStepLoader = ({ steps, currentStep, completed = [] }) => {
  return (
    <motion.div
      className="multi-step-loader"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="steps-container">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = completed.includes(index);

          return (
            <motion.div
              key={index}
              className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <div className="step-indicator">
                {isCompleted ? (
                  <motion.span
                    className="step-check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    ✓
                  </motion.span>
                ) : isActive ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <span className="step-number">{index + 1}</span>
                )}
              </div>
              <div className="step-content">
                <p className="step-title">{step.title}</p>
                <p className="step-description">{step.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <style jsx>{`
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1rem;
        }

        .spinner-container.overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1000;
        }

        .spinner-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .spinner-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner-ring,
        .spinner-inner-ring {
          border: 3px solid;
          border-radius: 50%;
          position: absolute;
        }

        .spinner-message {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          text-align: center;
          margin: 0;
        }

        .multi-step-loader {
          background: var(--bg-primary);
          backdrop-filter: var(--blur-md);
          -webkit-backdrop-filter: var(--blur-md);
          border-radius: var(--border-radius-xl);
          border: 1px solid var(--border-light);
          padding: var(--spacing-xl);
          box-shadow: var(--shadow-lg);
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border-radius: var(--border-radius-md);
          transition: all var(--transition-normal);
          border: 1px solid transparent;
        }

        .step.active {
          background: rgba(79, 172, 254, 0.1);
          border-color: rgba(79, 172, 254, 0.3);
        }

        .step.completed {
          background: rgba(67, 233, 123, 0.1);
          border-color: rgba(67, 233, 123, 0.3);
        }

        .step-indicator {
          min-width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 2px solid var(--border-light);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .step.active .step-indicator {
          border-color: var(--accent-color);
          background: rgba(79, 172, 254, 0.2);
        }

        .step.completed .step-indicator {
          border-color: var(--success-color);
          background: var(--success-color);
          color: white;
        }

        .step-check {
          font-size: 1rem;
          font-weight: 700;
        }

        .step-content {
          flex: 1;
          padding-top: 0.25rem;
        }

        .step-title {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.875rem;
          margin: 0 0 0.25rem 0;
        }

        .step-description {
          color: var(--text-muted);
          font-size: 0.75rem;
          line-height: 1.4;
          margin: 0;
        }

        @media (max-width: 768px) {
          .multi-step-loader {
            padding: var(--spacing-lg);
          }

          .steps-container {
            gap: 1rem;
          }

          .step {
            padding: 0.75rem;
          }

          .step-indicator {
            min-width: 2rem;
            height: 2rem;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default LoadingSpinner;