const CloudIntegration = require('../models/CloudIntegration');
const SyncJob = require('../models/SyncJob');
const awsDiscovery = require('./awsDiscovery');

class SyncScheduler {
  constructor() {
    this.scheduledJobs = new Map(); // Store interval IDs keyed by integrationId
    this.isRunning = false;
  }

  /**
   * Start the sync scheduler
   * Sets up cron-like intervals for each integration based on syncSchedule
   */
  async startScheduler() {
    try {
      console.log('Starting sync scheduler...');
      this.isRunning = true;

      // Get all active integrations
      const integrations = await CloudIntegration.find({
        status: 'connected',
      });

      console.log(`Setting up sync schedule for ${integrations.length} integrations`);

      for (const integration of integrations) {
        await this.scheduleIntegration(integration);
      }

      console.log('Sync scheduler started successfully');
      return { success: true, integrations: integrations.length };
    } catch (error) {
      console.error('Error starting sync scheduler:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop the sync scheduler
   */
  async stopScheduler() {
    try {
      console.log('Stopping sync scheduler...');
      this.isRunning = false;

      // Clear all scheduled jobs
      for (const [integrationId, intervalId] of this.scheduledJobs.entries()) {
        clearInterval(intervalId);
        console.log(`Cleared schedule for integration: ${integrationId}`);
      }

      this.scheduledJobs.clear();
      console.log('Sync scheduler stopped');
      return { success: true };
    } catch (error) {
      console.error('Error stopping sync scheduler:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule an individual integration
   */
  async scheduleIntegration(integration) {
    try {
      // Clear existing schedule if any
      if (this.scheduledJobs.has(integration._id.toString())) {
        clearInterval(this.scheduledJobs.get(integration._id.toString()));
      }

      // Skip if sync is manual only
      if (integration.syncSchedule === 'manual') {
        console.log(`Integration ${integration._id} is set to manual sync only`);
        return;
      }

      // Calculate interval in milliseconds
      const intervals = {
        hourly: 60 * 60 * 1000,
        daily: 24 * 60 * 60 * 1000,
        weekly: 7 * 24 * 60 * 60 * 1000,
      };

      const interval = intervals[integration.syncSchedule];
      if (!interval) {
        console.warn(`Unknown sync schedule: ${integration.syncSchedule}`);
        return;
      }

      // Set up the scheduled job
      const integrationId = integration._id.toString();
      const intervalId = setInterval(async () => {
        await this.triggerSync(integration._id, 'scheduled');
      }, interval);

      this.scheduledJobs.set(integrationId, intervalId);
      console.log(
        `Scheduled ${integration.provider} integration ${integrationId} for ${integration.syncSchedule} sync`
      );

      // Also run an initial sync immediately for new integrations
      if (!integration.lastSyncAt) {
        console.log(`Running initial sync for integration ${integrationId}`);
        await this.triggerSync(integration._id, 'scheduled');
      }
    } catch (error) {
      console.error(`Error scheduling integration: ${error.message}`);
    }
  }

  /**
   * Trigger a sync for an integration
   * Creates a SyncJob and runs discovery
   */
  async triggerSync(integrationId, triggerType = 'manual', triggeredBy = null) {
    try {
      // Fetch integration
      const integration = await CloudIntegration.findById(integrationId);

      if (!integration) {
        return { success: false, error: 'Integration not found' };
      }

      // Check if already syncing
      const runningSync = await SyncJob.findOne({
        integrationRef: integrationId,
        status: 'running',
      });

      if (runningSync) {
        return {
          success: false,
          error: 'Sync already in progress for this integration',
          syncJobId: runningSync._id,
        };
      }

      // Create sync job
      const syncJob = new SyncJob({
        integrationRef: integrationId,
        status: 'queued',
        triggerType,
        triggeredBy,
        progress: {
          servicesTotal: 0,
          servicesCompleted: 0,
          assetsDiscovered: 0,
        },
      });

      await syncJob.save();

      console.log(
        `Created sync job ${syncJob._id} for integration ${integrationId} (trigger: ${triggerType})`
      );

      // Run discovery in background
      this.runDiscoveryAsync(integration, syncJob);

      return { success: true, syncJobId: syncJob._id };
    } catch (error) {
      console.error(`Error triggering sync: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Run discovery asynchronously
   */
  async runDiscoveryAsync(integration, syncJob) {
    try {
      // Run discovery (this will update syncJob internally)
      const result = await awsDiscovery.runDiscovery(integration, syncJob);

      if (!result.success) {
        console.error(`Discovery failed for integration ${integration._id}: ${result.error}`);
      } else {
        console.log(
          `Discovery completed for integration ${integration._id}: ${result.stats.totalAssets} assets found`
        );
      }
    } catch (error) {
      console.error(`Unhandled error in discovery: ${error.message}`);

      try {
        // Ensure sync job is marked as failed
        const job = await SyncJob.findById(syncJob._id);
        if (job && job.status !== 'completed') {
          job.status = 'failed';
          job.completedAt = new Date();
          job.results.errors = job.results.errors || [];
          job.results.errors.push({
            service: 'discovery',
            region: 'all',
            error: error.message,
          });
          await job.save();
        }
      } catch (err) {
        console.error('Error marking sync job as failed:', err);
      }
    }
  }

  /**
   * Get sync status for an integration
   */
  async getSyncStatus(integrationId) {
    try {
      // Get current running sync
      const runningSyncJob = await SyncJob.findOne({
        integrationRef: integrationId,
        status: 'running',
      });

      if (runningSyncJob) {
        return {
          status: 'running',
          syncJob: runningSyncJob,
          progress: runningSyncJob.progress,
        };
      }

      // Get last completed sync
      const lastSyncJob = await SyncJob.findOne({
        integrationRef: integrationId,
      })
        .sort({ completedAt: -1 })
        .limit(1);

      if (lastSyncJob) {
        return {
          status: lastSyncJob.status,
          syncJob: lastSyncJob,
          lastSyncAt: lastSyncJob.completedAt,
          results: lastSyncJob.results,
        };
      }

      // Get integration info
      const integration = await CloudIntegration.findById(integrationId);

      if (!integration) {
        return { error: 'Integration not found' };
      }

      return {
        status: integration.lastSyncStatus || 'never',
        lastSyncAt: integration.lastSyncAt,
        syncSchedule: integration.syncSchedule,
      };
    } catch (error) {
      console.error(`Error getting sync status: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * Get all sync jobs for an integration
   */
  async getSyncHistory(integrationId, limit = 10) {
    try {
      const syncJobs = await SyncJob.find({
        integrationRef: integrationId,
      })
        .sort({ createdAt: -1 })
        .limit(limit);

      return { success: true, syncJobs };
    } catch (error) {
      console.error(`Error getting sync history: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel a running sync job
   */
  async cancelSync(syncJobId) {
    try {
      const syncJob = await SyncJob.findById(syncJobId);

      if (!syncJob) {
        return { success: false, error: 'Sync job not found' };
      }

      if (syncJob.status !== 'running' && syncJob.status !== 'queued') {
        return {
          success: false,
          error: `Cannot cancel sync in ${syncJob.status} status`,
        };
      }

      syncJob.status = 'cancelled';
      syncJob.completedAt = new Date();

      await syncJob.save();

      console.log(`Sync job ${syncJobId} cancelled`);

      return { success: true, message: 'Sync job cancelled' };
    } catch (error) {
      console.error(`Error cancelling sync: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reschedule an integration sync
   * Called when syncSchedule is updated
   */
  async rescheduleIntegration(integrationId) {
    try {
      const integration = await CloudIntegration.findById(integrationId);

      if (!integration) {
        return { success: false, error: 'Integration not found' };
      }

      await this.scheduleIntegration(integration);

      return { success: true, message: 'Integration rescheduled' };
    } catch (error) {
      console.error(`Error rescheduling integration: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get sync statistics across all integrations
   */
  async getSchedulerStats() {
    try {
      const integrations = await CloudIntegration.find({ status: 'connected' });

      const stats = {
        totalIntegrations: integrations.length,
        scheduledIntegrations: this.scheduledJobs.size,
        syncScheduleBreakdown: {
          hourly: 0,
          daily: 0,
          weekly: 0,
          manual: 0,
        },
        lastSyncBreakdown: {
          success: 0,
          partial: 0,
          failed: 0,
          never: 0,
          running: 0,
        },
      };

      for (const integration of integrations) {
        stats.syncScheduleBreakdown[integration.syncSchedule]++;
        stats.lastSyncBreakdown[integration.lastSyncStatus]++;
      }

      return { success: true, stats };
    } catch (error) {
      console.error(`Error getting scheduler stats: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Resume sync scheduling for an integration
   * Used when integration is re-connected
   */
  async resumeScheduling(integrationId) {
    try {
      const integration = await CloudIntegration.findById(integrationId);

      if (!integration) {
        return { success: false, error: 'Integration not found' };
      }

      if (integration.status !== 'connected') {
        return { success: false, error: 'Integration is not connected' };
      }

      await this.scheduleIntegration(integration);

      return { success: true, message: 'Sync scheduling resumed' };
    } catch (error) {
      console.error(`Error resuming scheduling: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Pause sync scheduling for an integration
   * Used when integration is disconnected
   */
  async pauseScheduling(integrationId) {
    try {
      const integrationIdStr = integrationId.toString();

      if (this.scheduledJobs.has(integrationIdStr)) {
        clearInterval(this.scheduledJobs.get(integrationIdStr));
        this.scheduledJobs.delete(integrationIdStr);
        console.log(`Paused sync scheduling for integration ${integrationId}`);
      }

      return { success: true, message: 'Sync scheduling paused' };
    } catch (error) {
      console.error(`Error pausing scheduling: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SyncScheduler();
