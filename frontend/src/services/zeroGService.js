import axios from 'axios';

/**
 * 0G Network Integration Service for Frontend
 * Handles communication with backend 0G services and smart contracts
 */
class ZeroGService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for debugging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Upload and verify RWA asset using 0G Storage and Compute
   */
  async uploadAndVerifyAsset(formData) {
    try {
      console.log('📤 Uploading asset to 0G Storage and starting AI verification...');

      const response = await this.api.post('/api/assets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for AI verification
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Asset upload failed');
      }

      return {
        assetId: response.data.assetId,
        verification: response.data.verification,
        storage: response.data.storage,
        daProof: response.data.daProof,
        proof: response.data.proof,
        timestamp: response.data.timestamp,
      };

    } catch (error) {
      console.error('❌ Asset upload failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get verification details for an asset
   */
  async getVerificationDetails(assetId) {
    try {
      console.log(`🔍 Getting verification details for asset: ${assetId}`);

      const response = await this.api.get(`/api/verification/${assetId}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get verification details');
      }

      return response.data.verification;

    } catch (error) {
      console.error('❌ Failed to get verification details:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get 0G DA proof for an asset
   */
  async getDAProof(assetId) {
    try {
      console.log(`📡 Getting 0G DA proof for asset: ${assetId}`);

      const response = await this.api.get(`/api/asset/${assetId}/da-proof`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get DA proof');
      }

      return response.data.daProof;

    } catch (error) {
      console.error('❌ Failed to get DA proof:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Verify all proofs for an asset (Storage + Compute + DA)
   */
  async verifyAllProofs(assetId) {
    try {
      console.log(`🛡️ Verifying all proofs for asset: ${assetId}`);

      const response = await this.api.get(`/api/asset/${assetId}/verify-proofs`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to verify proofs');
      }

      return response.data.proofStatus;

    } catch (error) {
      console.error('❌ Failed to verify proofs:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get complete asset information including all proofs
   */
  async getAssetDetails(assetId) {
    try {
      console.log(`📋 Getting complete asset details: ${assetId}`);

      const response = await this.api.get(`/api/asset/${assetId}/all-proofs`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get asset details');
      }

      return {
        assetId: response.data.assetId,
        verification: response.data.verification,
        daProofs: response.data.daProofs,
        proofStatus: response.data.proofStatus,
        timestamp: response.data.timestamp,
      };

    } catch (error) {
      console.error('❌ Failed to get asset details:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Verify sampling proof on 0G DA
   */
  async verifySamplingProof(dataHash, samplingProof) {
    try {
      console.log(`🔍 Verifying sampling proof for: ${dataHash}`);

      const response = await this.api.post('/api/da/verify-sampling', {
        dataHash,
        samplingProof,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to verify sampling proof');
      }

      return {
        verified: response.data.verified,
        dataHash: response.data.dataHash,
      };

    } catch (error) {
      console.error('❌ Failed to verify sampling proof:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get 0G DA service status
   */
  async getDAStatus() {
    try {
      console.log('📊 Getting 0G DA service status...');

      const response = await this.api.get('/api/da/status');

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get DA status');
      }

      return response.data.daService;

    } catch (error) {
      console.error('❌ Failed to get DA status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get 0G Storage service status
   */
  async getStorageStatus() {
    try {
      console.log('📊 Getting 0G Storage service status...');

      const response = await this.api.get('/api/storage/status');

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get storage status');
      }

      return response.data.storage;

    } catch (error) {
      console.error('❌ Failed to get storage status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get 0G Compute service status
   */
  async getComputeStatus() {
    try {
      console.log('📊 Getting 0G Compute service status...');

      const response = await this.api.get('/api/compute/status');

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get compute status');
      }

      return response.data.compute;

    } catch (error) {
      console.error('❌ Failed to get compute status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get complete 0G Network status
   */
  async getNetworkStatus() {
    try {
      console.log('🌐 Getting complete 0G Network status...');

      const [storageStatus, computeStatus, daStatus] = await Promise.allSettled([
        this.getStorageStatus(),
        this.getComputeStatus(),
        this.getDAStatus(),
      ]);

      return {
        storage: storageStatus.status === 'fulfilled' ? storageStatus.value : { error: storageStatus.reason.message },
        compute: computeStatus.status === 'fulfilled' ? computeStatus.value : { error: computeStatus.reason.message },
        da: daStatus.status === 'fulfilled' ? daStatus.value : { error: daStatus.reason.message },
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('❌ Failed to get network status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get asset upload history (cached from backend)
   */
  async getAssetHistory() {
    try {
      console.log('📜 Getting asset upload history...');

      const response = await this.api.get('/api/assets/history');

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get asset history');
      }

      return response.data.assets;

    } catch (error) {
      console.error('❌ Failed to get asset history:', error);
      // Return empty array instead of throwing for non-critical functionality
      return [];
    }
  }

  /**
   * Validate asset data before upload
   */
  validateAssetData(assetData) {
    const errors = [];

    if (!assetData.assetType) {
      errors.push('Asset type is required');
    }

    if (!assetData.estimatedValue || assetData.estimatedValue <= 0) {
      errors.push('Valid estimated value is required');
    }

    if (!assetData.files || assetData.files.length === 0) {
      errors.push('At least one file must be uploaded');
    }

    // Validate file types
    if (assetData.files) {
      const allowedTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];
      const invalidFiles = assetData.files.filter(file => !allowedTypes.includes(file.type));

      if (invalidFiles.length > 0) {
        errors.push(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}`);
      }

      // Check file size (max 10MB per file)
      const oversizedFiles = assetData.files.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        errors.push(`Files too large (max 10MB): ${oversizedFiles.map(f => f.name).join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format verification score for display
   */
  formatVerificationScore(score, confidence) {
    if (typeof score !== 'number' || typeof confidence !== 'number') {
      return 'N/A';
    }

    const level = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';
    return `${score}/100 (${level} - ${Math.round(confidence * 100)}% confidence)`;
  }

  /**
   * Format asset value for display
   */
  formatAssetValue(value) {
    if (typeof value !== 'number') {
      return '$0';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  /**
   * Handle API errors consistently
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.details || 'Server error';
      return new Error(`${message} (${error.response.status})`);
    } else if (error.request) {
      // Network error
      return new Error('Network error - please check your connection');
    } else {
      // Other error
      return error;
    }
  }

  /**
   * Check if backend services are healthy
   */
  async healthCheck() {
    try {
      const response = await this.api.get('/api/health', { timeout: 5000 });
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { healthy: false, error: error.message };
    }
  }
}

// Export singleton instance
const zeroGService = new ZeroGService();
export default zeroGService;