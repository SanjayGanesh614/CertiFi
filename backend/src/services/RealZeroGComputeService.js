const { ZeroGComputeClient } = require('@0glabs/0g-ts-sdk');

class Real0GComputeService {
  constructor() {
    this.client = null;
  }

  async initialize() {
    try {
      this.client = new ZeroGComputeClient({
        apiKey: process.env.ZEROG_API_KEY,
        endpoint: process.env.ZEROG_COMPUTE_ENDPOINT || 'https://compute.0g.ai'
      });
      
      console.log('✅ 0G Compute service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize 0G Compute service:', error);
      throw error;
    }
  }

  async submitComputeTask(serviceId, input, config = {}) {
    try {
      const task = await this.client.submitTask({
        serviceId,
        input,
        config: {
          maxRetries: 3,
          timeout: 300000, // 5 minutes
          ...config
        }
      });

      return {
        taskId: task.id,
        status: task.status,
        estimatedCost: task.estimatedCost
      };
    } catch (error) {
      console.error('Failed to submit compute task:', error);
      throw error;
    }
  }

  async getTaskResult(taskId) {
    try {
      const result = await this.client.getTaskResult(taskId);
      return {
        status: result.status,
        output: result.output,
        error: result.error,
        metrics: result.metrics
      };
    } catch (error) {
      console.error(`Failed to get task result for ${taskId}:`, error);
      throw error;
    }
  }

  async getTaskStatus(taskId) {
    try {
      const status = await this.client.getTaskStatus(taskId);
      return {
        status: status.status,
        progress: status.progress,
        error: status.error
      };
    } catch (error) {
      console.error(`Failed to get task status for ${taskId}:`, error);
      throw error;
    }
  }
}

module.exports = Real0GComputeService;