import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Shield, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const UploadPage = ({ account, signer, provider }) => {
  const [files, setFiles] = useState([]);
  const [assetType, setAssetType] = useState('real_estate');
  const [description, setDescription] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const assetTypes = [
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'artwork', label: 'Artwork' },
    { value: 'carbon_credits', label: 'Carbon Credits' },
    { value: 'commodities', label: 'Commodities' },
    { value: 'intellectual_property', label: 'Intellectual Property' },
    { value: 'other', label: 'Other' }
  ];

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      return validTypes.includes(file.type) && file.size <= 50 * 1024 * 1024; // 50MB limit
    });

    if (validFiles.length !== droppedFiles.length) {
      setError('Some files were rejected. Only PDF, JPEG, and PNG files under 50MB are allowed.');
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (files.length === 0) {
      setError('Please upload at least one file');
      return;
    }

    if (!estimatedValue || parseFloat(estimatedValue) <= 0) {
      setError('Please enter a valid estimated value');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadResult(null);

    try {
      // Step 1: Upload files and get AI verification
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('assetType', assetType);
      formData.append('description', description);
      formData.append('estimatedValue', estimatedValue);

      const uploadResponse = await axios.post(`${API_BASE_URL}/api/assets/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const verificationData = uploadResponse.data;

      if (!verificationData.success) {
        throw new Error('Asset verification failed');
      }

      // Step 2: Mint NFT with verification data
      const mintPayload = {
        assetId: verificationData.assetId,
        to: account,
        assetType,
        valuation: verificationData.verification.valuation,
        metadataUri: `${API_BASE_URL}/api/assets/${verificationData.assetId}/metadata`,
        verificationProof: verificationData.proof
      };

      const mintResponse = await axios.post(`${API_BASE_URL}/api/nft/mint`, mintPayload);

      // Step 3: Verify asset on blockchain if score is high enough
      if (verificationData.verification.score >= 70) {
        await axios.post(`${API_BASE_URL}/api/nft/${mintResponse.data.tokenId}/verify`, {
          aiAuditHash: verificationData.proof,
          auditScore: verificationData.verification.score
        });
      }

      setUploadResult({
        ...verificationData,
        nft: mintResponse.data
      });

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4ECDC4';
    if (score >= 60) return '#FFE66D';
    return '#FF6B6B';
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return '#4ECDC4';
      case 'medium': return '#FFE66D';
      case 'high': return '#FF6B6B';
      default: return '#fff';
    }
  };

  if (!account) {
    return (
      <div className="upload-page">
        <div className="container">
          <div className="card text-center">
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to start uploading and tokenizing assets.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page">
      <div className="container">
        <div className="upload-header">
          <h1>Tokenize Your Asset</h1>
          <p>Upload your asset documentation for AI-powered verification and tokenization</p>
        </div>

        {!uploadResult ? (
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-row">
              <div className="form-group">
                <label>Asset Type</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="input"
                  required
                >
                  {assetTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Estimated Value (USD)</label>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="input"
                  placeholder="e.g., 500000"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                placeholder="Provide additional details about your asset..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Upload Documents</label>
              <div
                className={`file-upload-area ${dragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="upload-content">
                  <div className="upload-icon">📁</div>
                  <p>Drag and drop files here, or click to select</p>
                  <p className="upload-hint">
                    Supported: PDF, JPEG, PNG (max 50MB each)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="file-input"
                  />
                </div>
              </div>

              {files.length > 0 && (
                <div className="file-list">
                  {files.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="remove-file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="error">{error}</div>
            )}

            <button
              type="submit"
              disabled={isUploading || files.length === 0}
              className="button submit-button"
            >
              {isUploading ? (
                <>
                  <div className="loading-spinner"></div>
                  Processing...
                </>
              ) : (
                'Upload & Tokenize Asset'
              )}
            </button>
          </form>
        ) : (
          <div className="upload-result">
            <div className="result-header">
              <h2>✅ Asset Successfully Processed!</h2>
              <p>Your asset has been verified by AI and tokenized on 0G Network</p>
            </div>

            <div className="result-grid">
              <div className="verification-card">
                <h3>AI Verification Results</h3>
                <div className="verification-score">
                  <div
                    className="score-circle"
                    style={{ borderColor: getScoreColor(uploadResult.verification.score) }}
                  >
                    <span style={{ color: getScoreColor(uploadResult.verification.score) }}>
                      {uploadResult.verification.score}
                    </span>
                  </div>
                  <div className="score-details">
                    <p>Verification Score</p>
                    <p className="confidence">
                      Confidence: {Math.round(uploadResult.verification.confidence * 100)}%
                    </p>
                  </div>
                </div>

                <div className="verification-metrics">
                  <div className="metric">
                    <span>Fraud Risk:</span>
                    <span
                      style={{ color: getRiskColor(uploadResult.verification.fraudRisk) }}
                    >
                      {uploadResult.verification.fraudRisk.toUpperCase()}
                    </span>
                  </div>
                  <div className="metric">
                    <span>AI Valuation:</span>
                    <span>${uploadResult.verification.valuation.toLocaleString()}</span>
                  </div>
                  <div className="metric">
                    <span>Status:</span>
                    <span style={{ color: uploadResult.verification.score >= 70 ? '#4ECDC4' : '#FFE66D' }}>
                      {uploadResult.verification.score >= 70 ? 'VERIFIED' : 'NEEDS REVIEW'}
                    </span>
                  </div>
                </div>

                {uploadResult.verification.issues.length > 0 && (
                  <div className="issues-section">
                    <h4>Issues Found:</h4>
                    <ul>
                      {uploadResult.verification.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="nft-card">
                <h3>NFT Details</h3>
                <div className="nft-info">
                  <div className="nft-field">
                    <span>Token ID:</span>
                    <span className="token-id">{uploadResult.nft.tokenId}</span>
                  </div>
                  <div className="nft-field">
                    <span>Transaction:</span>
                    <a
                      href={`https://explorer.0g.ai/tx/${uploadResult.nft.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tx-link"
                    >
                      View on Explorer
                    </a>
                  </div>
                  <div className="nft-field">
                    <span>Verification Proof:</span>
                    <span className="proof-hash">{uploadResult.proof.substring(0, 20)}...</span>
                  </div>
                </div>

                <div className="nft-actions">
                  <button
                    className="button"
                    onClick={() => window.location.href = `/marketplace?tokenId=${uploadResult.nft.tokenId}`}
                  >
                    List on Marketplace
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    View in Dashboard
                  </button>
                </div>
              </div>
            </div>

            <div className="restart-section">
              <button
                className="button button-outline"
                onClick={() => {
                  setUploadResult(null);
                  setFiles([]);
                  setDescription('');
                  setEstimatedValue('');
                  setError('');
                }}
              >
                Upload Another Asset
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .upload-page {
          padding: 40px 0;
        }

        .upload-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .upload-header h1 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .upload-header p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
        }

        .upload-form {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(167, 139, 250, 0.1);
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          color: white;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .file-upload-area {
          border: 2px dashed rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          cursor: pointer;
        }

        .file-upload-area:hover,
        .file-upload-area.drag-over {
          border-color: #4ECDC4;
          background: rgba(78, 205, 196, 0.1);
        }

        .upload-content {
          pointer-events: none;
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .upload-content p {
          color: white;
          margin: 8px 0;
        }

        .upload-hint {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .file-input {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          cursor: pointer;
          pointer-events: all;
        }

        .file-list {
          margin-top: 16px;
          space-y: 8px;
        }

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .file-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .file-name {
          color: white;
          font-weight: 500;
        }

        .file-size {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
        }

        .remove-file {
          background: rgba(255, 107, 107, 0.2);
          border: none;
          border-radius: 4px;
          color: #FF6B6B;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .submit-button {
          width: 100%;
          padding: 16px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .upload-result {
          max-width: 1000px;
          margin: 0 auto;
        }

        .result-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .result-header h2 {
          color: #4ECDC4;
          font-size: 2rem;
          margin-bottom: 16px;
        }

        .result-header p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
        }

        .result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }

        .verification-card,
        .nft-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 30px;
        }

        .verification-card h3,
        .nft-card h3 {
          color: white;
          margin-bottom: 24px;
          font-size: 1.3rem;
        }

        .verification-score {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .score-circle {
          width: 80px;
          height: 80px;
          border: 4px solid;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .score-details p {
          color: white;
          margin: 0;
        }

        .confidence {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .verification-metrics {
          space-y: 12px;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .metric span:first-child {
          color: rgba(255, 255, 255, 0.8);
        }

        .metric span:last-child {
          font-weight: 600;
          color: white;
        }

        .issues-section {
          margin-top: 20px;
          padding: 16px;
          background: rgba(255, 230, 109, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(255, 230, 109, 0.3);
        }

        .issues-section h4 {
          color: #FFE66D;
          margin-bottom: 12px;
        }

        .issues-section ul {
          margin: 0;
          padding-left: 20px;
        }

        .issues-section li {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 4px;
        }

        .nft-info {
          space-y: 16px;
          margin-bottom: 24px;
        }

        .nft-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nft-field span:first-child {
          color: rgba(255, 255, 255, 0.8);
        }

        .token-id,
        .proof-hash {
          font-family: monospace;
          color: #4ECDC4;
          font-weight: 600;
        }

        .tx-link {
          color: #4ECDC4;
          text-decoration: none;
          font-weight: 500;
        }

        .tx-link:hover {
          text-decoration: underline;
        }

        .nft-actions {
          display: flex;
          gap: 12px;
        }

        .nft-actions .button {
          flex: 1;
          text-align: center;
          padding: 12px;
          font-size: 14px;
        }

        .restart-section {
          text-align: center;
          padding: 40px 0;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .result-grid {
            grid-template-columns: 1fr;
          }

          .upload-form {
            padding: 24px;
          }

          .nft-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default UploadPage;