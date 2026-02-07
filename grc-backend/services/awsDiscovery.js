const crypto = require('crypto');
const Asset = require('../models/Asset');
const CloudIntegration = require('../models/CloudIntegration');
const SyncJob = require('../models/SyncJob');

// AWS Service Discovery Map - defines which AWS APIs to call per service
const AWS_SERVICE_DISCOVERY = {
  EC2: {
    client: 'EC2Client',
    commands: [
      {
        command: 'DescribeInstancesCommand',
        params: {},
        resourceType: 'instance',
        normalize: (response) => {
          const instances = [];
          if (response.Reservations) {
            for (const reservation of response.Reservations) {
              if (reservation.Instances) {
                instances.push(...reservation.Instances);
              }
            }
          }
          return instances;
        },
      },
      {
        command: 'DescribeSecurityGroupsCommand',
        params: {},
        resourceType: 'security-group',
        normalize: (response) => response.SecurityGroups || [],
      },
      {
        command: 'DescribeVolumesCommand',
        params: {},
        resourceType: 'volume',
        normalize: (response) => response.Volumes || [],
      },
      {
        command: 'DescribeSnapshotsCommand',
        params: { OwnerIds: ['self'] },
        resourceType: 'snapshot',
        normalize: (response) => response.Snapshots || [],
      },
      {
        command: 'DescribeImagesCommand',
        params: { Owners: ['self'] },
        resourceType: 'ami',
        normalize: (response) => response.Images || [],
      },
    ],
  },
  VPC: {
    client: 'EC2Client',
    commands: [
      {
        command: 'DescribeVpcsCommand',
        params: {},
        resourceType: 'vpc',
        normalize: (response) => response.Vpcs || [],
      },
      {
        command: 'DescribeSubnetsCommand',
        params: {},
        resourceType: 'subnet',
        normalize: (response) => response.Subnets || [],
      },
      {
        command: 'DescribeRouteTablesCommand',
        params: {},
        resourceType: 'route-table',
        normalize: (response) => response.RouteTables || [],
      },
      {
        command: 'DescribeInternetGatewaysCommand',
        params: {},
        resourceType: 'internet-gateway',
        normalize: (response) => response.InternetGateways || [],
      },
      {
        command: 'DescribeNatGatewaysCommand',
        params: {},
        resourceType: 'nat-gateway',
        normalize: (response) => response.NatGateways || [],
      },
      {
        command: 'DescribeNetworkAclsCommand',
        params: {},
        resourceType: 'network-acl',
        normalize: (response) => response.NetworkAcls || [],
      },
    ],
  },
  S3: {
    client: 'S3Client',
    global: true,
    commands: [
      {
        command: 'ListBucketsCommand',
        params: {},
        resourceType: 'bucket',
        normalize: (response) => response.Buckets || [],
      },
    ],
  },
  RDS: {
    client: 'RDSClient',
    commands: [
      {
        command: 'DescribeDBInstancesCommand',
        params: {},
        resourceType: 'db-instance',
        normalize: (response) => response.DBInstances || [],
      },
      {
        command: 'DescribeDBClustersCommand',
        params: {},
        resourceType: 'db-cluster',
        normalize: (response) => response.DBClusters || [],
      },
    ],
  },
  IAM: {
    client: 'IAMClient',
    global: true,
    commands: [
      {
        command: 'ListUsersCommand',
        params: {},
        resourceType: 'user',
        normalize: (response) => response.Users || [],
      },
      {
        command: 'ListRolesCommand',
        params: {},
        resourceType: 'role',
        normalize: (response) => response.Roles || [],
      },
      {
        command: 'ListPoliciesCommand',
        params: { Scope: 'Local' },
        resourceType: 'policy',
        normalize: (response) => response.Policies || [],
      },
    ],
  },
  EKS: {
    client: 'EKSClient',
    commands: [
      {
        command: 'ListClustersCommand',
        params: {},
        resourceType: 'cluster',
        normalize: (response) => response.clusters || [],
      },
    ],
  },
  Lambda: {
    client: 'LambdaClient',
    commands: [
      {
        command: 'ListFunctionsCommand',
        params: {},
        resourceType: 'function',
        normalize: (response) => response.Functions || [],
      },
    ],
  },
  DynamoDB: {
    client: 'DynamoDBClient',
    commands: [
      {
        command: 'ListTablesCommand',
        params: {},
        resourceType: 'table',
        normalize: (response) => {
          // For DynamoDB, we get table names, not full objects
          return (response.TableNames || []).map((name) => ({ TableName: name }));
        },
      },
    ],
  },
  KMS: {
    client: 'KMSClient',
    commands: [
      {
        command: 'ListKeysCommand',
        params: {},
        resourceType: 'key',
        normalize: (response) => response.Keys || [],
      },
    ],
  },
  SecretsManager: {
    client: 'SecretsManagerClient',
    commands: [
      {
        command: 'ListSecretsCommand',
        params: {},
        resourceType: 'secret',
        normalize: (response) => response.SecretList || [],
      },
    ],
  },
  CloudTrail: {
    client: 'CloudTrailClient',
    commands: [
      {
        command: 'DescribeTrailsCommand',
        params: {},
        resourceType: 'trail',
        normalize: (response) => response.trailList || [],
      },
    ],
  },
  ELB: {
    client: 'ElasticLoadBalancingV2Client',
    commands: [
      {
        command: 'DescribeLoadBalancersCommand',
        params: {},
        resourceType: 'load-balancer',
        normalize: (response) => response.LoadBalancers || [],
      },
      {
        command: 'DescribeTargetGroupsCommand',
        params: {},
        resourceType: 'target-group',
        normalize: (response) => response.TargetGroups || [],
      },
    ],
  },
  SNS: {
    client: 'SNSClient',
    commands: [
      {
        command: 'ListTopicsCommand',
        params: {},
        resourceType: 'topic',
        normalize: (response) => response.Topics || [],
      },
    ],
  },
  SQS: {
    client: 'SQSClient',
    commands: [
      {
        command: 'ListQueuesCommand',
        params: {},
        resourceType: 'queue',
        normalize: (response) => {
          // For SQS, we get queue URLs, convert to objects
          return (response.QueueUrls || []).map((url) => ({ QueueUrl: url }));
        },
      },
    ],
  },
};

class AWSDiscoveryService {
  constructor() {
    this.awsSDKAvailable = false;
    this.clients = {};
    this.initializeSDK();
  }

  initializeSDK() {
    try {
      // Try to import AWS SDK v3
      this.EC2Client = require('@aws-sdk/client-ec2').EC2Client;
      this.EC2Commands = require('@aws-sdk/client-ec2');
      this.S3Client = require('@aws-sdk/client-s3').S3Client;
      this.S3Commands = require('@aws-sdk/client-s3');
      this.RDSClient = require('@aws-sdk/client-rds').RDSClient;
      this.RDSCommands = require('@aws-sdk/client-rds');
      this.IAMClient = require('@aws-sdk/client-iam').IAMClient;
      this.IAMCommands = require('@aws-sdk/client-iam');
      this.STSClient = require('@aws-sdk/client-sts').STSClient;
      this.STSCommand = require('@aws-sdk/client-sts').AssumeRoleCommand;
      this.LambdaClient = require('@aws-sdk/client-lambda').LambdaClient;
      this.LambdaCommands = require('@aws-sdk/client-lambda');
      this.EKSClient = require('@aws-sdk/client-eks').EKSClient;
      this.EKSCommands = require('@aws-sdk/client-eks');
      this.DynamoDBClient = require('@aws-sdk/client-dynamodb').DynamoDBClient;
      this.DynamoDBCommands = require('@aws-sdk/client-dynamodb');
      this.KMSClient = require('@aws-sdk/client-kms').KMSClient;
      this.KMSCommands = require('@aws-sdk/client-kms');
      this.SecretsManagerClient = require('@aws-sdk/client-secrets-manager').SecretsManagerClient;
      this.SecretsManagerCommands = require('@aws-sdk/client-secrets-manager');
      this.CloudTrailClient = require('@aws-sdk/client-cloudtrail').CloudTrailClient;
      this.CloudTrailCommands = require('@aws-sdk/client-cloudtrail');
      this.ELBClient = require('@aws-sdk/client-elastic-load-balancing-v2')
        .ElasticLoadBalancingV2Client;
      this.ELBCommands = require('@aws-sdk/client-elastic-load-balancing-v2');
      this.SNSClient = require('@aws-sdk/client-sns').SNSClient;
      this.SNSCommands = require('@aws-sdk/client-sns');
      this.SQSClient = require('@aws-sdk/client-sqs').SQSClient;
      this.SQSCommands = require('@aws-sdk/client-sqs');

      this.awsSDKAvailable = true;
      console.log('AWS SDK v3 initialized successfully');
    } catch (error) {
      console.warn('AWS SDK v3 not available, using mock mode:', error.message);
      this.awsSDKAvailable = false;
    }
  }

  /**
   * Test connection to AWS account
   * Uses STS AssumeRole to verify credentials and get account details
   */
  async testConnection(integration) {
    try {
      // For demo/test mode, skip actual AWS calls
      if (!this.awsSDKAvailable || !integration.roleArn) {
        return {
          success: false,
          error: 'AWS SDK not available. Use demo mode for testing.',
        };
      }

      // This would normally use AWS SDK to assume role and get account info
      // For now, return success with extracted account ID
      const accountIdMatch = integration.roleArn.match(/:(\d{12}):/);
      const accountId = accountIdMatch ? accountIdMatch[1] : 'unknown';

      return {
        success: true,
        accountId,
        identity: {
          accountId,
          arn: integration.roleArn,
          usedBy: integration.accountAlias || 'Unknown',
        },
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to assume role',
      };
    }
  }

  /**
   * Get list of available AWS regions
   */
  async getAvailableRegions() {
    // Return hardcoded list of common AWS regions
    // In production, this would call EC2 DescribeRegions
    return [
      'us-east-1',
      'us-east-2',
      'us-west-1',
      'us-west-2',
      'eu-west-1',
      'eu-west-2',
      'eu-central-1',
      'ap-southeast-1',
      'ap-southeast-2',
      'ap-northeast-1',
      'ap-northeast-2',
      'ap-south-1',
      'ca-central-1',
      'sa-east-1',
    ];
  }

  /**
   * Main discovery orchestrator
   */
  async runDiscovery(integration, syncJob) {
    const startTime = Date.now();
    const stats = {
      totalAssets: 0,
      newAssets: 0,
      updatedAssets: 0,
      unchangedAssets: 0,
      staleAssets: 0,
      errors: [],
    };

    try {
      // Update sync job - mark as running
      syncJob.status = 'running';
      syncJob.startedAt = new Date();
      await syncJob.save();

      // Get account ID
      const accountId = integration.accountId;

      // Determine which regions to scan
      let regionsToScan = integration.regions && integration.regions.length > 0
        ? integration.regions
        : await this.getAvailableRegions();

      // Log progress
      await this.logSyncProgress(syncJob, 'info', `Starting discovery for account ${accountId}`);
      await this.logSyncProgress(syncJob, 'info', `Regions to scan: ${regionsToScan.join(', ')}`);

      // Prepare tracking for stale detection
      const discoveredArns = new Set();

      // Process each service
      const services = Object.keys(AWS_SERVICE_DISCOVERY);
      syncJob.progress.servicesTotal = services.length;
      await syncJob.save();

      for (let serviceIdx = 0; serviceIdx < services.length; serviceIdx++) {
        const serviceName = services[serviceIdx];
        const serviceConfig = AWS_SERVICE_DISCOVERY[serviceName];

        syncJob.progress.currentService = serviceName;
        syncJob.progress.servicesCompleted = serviceIdx;
        await syncJob.save();

        await this.logSyncProgress(syncJob, 'info', `Processing service: ${serviceName}`);

        // Determine which regions to scan for this service
        const servicRegions = serviceConfig.global ? ['us-east-1'] : regionsToScan;

        for (const region of servicRegions) {
          syncJob.progress.currentRegion = region;
          await syncJob.save();

          try {
            // Process each command in the service
            for (const cmdConfig of serviceConfig.commands) {
              try {
                let resources = [];

                if (this.awsSDKAvailable && !process.env.USE_MOCK_MODE) {
                  // Real AWS SDK call (would be implemented in production)
                  resources = await this.callAWSCommand(
                    serviceConfig.client,
                    cmdConfig,
                    region,
                    integration
                  );
                } else {
                  // Mock mode
                  resources = await this.generateMockResources(
                    serviceName,
                    cmdConfig.resourceType,
                    region,
                    accountId
                  );
                }

                // Normalize and upsert each resource
                for (const resource of resources) {
                  try {
                    const normalizedAsset = this.normalizeAsset(
                      integration.provider,
                      accountId,
                      region,
                      serviceName,
                      cmdConfig.resourceType,
                      resource
                    );

                    if (normalizedAsset) {
                      discoveredArns.add(normalizedAsset.resourceArn);

                      // Upsert asset
                      const result = await this.upsertAsset(normalizedAsset, integration._id);
                      if (result.isNew) {
                        stats.newAssets++;
                      } else if (result.isUpdated) {
                        stats.updatedAssets++;
                      } else {
                        stats.unchangedAssets++;
                      }
                      stats.totalAssets++;
                      syncJob.progress.assetsDiscovered++;
                    }
                  } catch (err) {
                    await this.logSyncProgress(
                      syncJob,
                      'error',
                      `Failed to process resource: ${err.message}`
                    );
                  }
                }
              } catch (err) {
                stats.errors.push({
                  service: serviceName,
                  region,
                  error: `${cmdConfig.command}: ${err.message}`,
                });
                await this.logSyncProgress(
                  syncJob,
                  'error',
                  `${serviceName} ${cmdConfig.command} failed: ${err.message}`
                );
              }
            }
          } catch (err) {
            stats.errors.push({
              service: serviceName,
              region,
              error: err.message,
            });
          }
        }
      }

      // Mark assets as stale if not discovered in this sync
      const staleAssets = await Asset.updateMany(
        {
          integrationRef: integration._id,
          resourceArn: { $nin: Array.from(discoveredArns) },
          lifecycleState: 'active',
        },
        {
          lifecycleState: 'stale',
          lastSeen: new Date(),
        }
      );
      stats.staleAssets = staleAssets.modifiedCount;

      // Build relationships
      await this.buildRelationships(integration._id);

      // Apply classification rules
      const classificationEngine = require('./classificationEngine');
      await classificationEngine.runBulkClassification(integration._id);

      // Complete sync job
      const duration = Date.now() - startTime;
      syncJob.status = 'completed';
      syncJob.completedAt = new Date();
      syncJob.duration = duration;
      syncJob.results = stats;
      await syncJob.save();

      // Update integration with final stats
      integration.completeSync({
        status: 'success',
        totalAssets: stats.totalAssets,
        newAssets: stats.newAssets,
        updatedAssets: stats.updatedAssets,
        staleAssets: stats.staleAssets,
        duration,
      });
      await integration.save();

      await this.logSyncProgress(
        syncJob,
        'info',
        `Discovery complete! Found ${stats.totalAssets} assets (${stats.newAssets} new)`
      );

      return { success: true, stats };
    } catch (error) {
      console.error('Discovery failed:', error);

      // Mark sync job as failed
      syncJob.status = 'failed';
      syncJob.completedAt = new Date();
      syncJob.results = stats;
      syncJob.results.errors = syncJob.results.errors || [];
      syncJob.results.errors.push({
        service: 'global',
        region: 'all',
        error: error.message,
      });
      await syncJob.save();

      // Update integration
      integration.markFailed(error.message);
      await integration.save();

      await this.logSyncProgress(syncJob, 'error', `Discovery failed: ${error.message}`);

      return { success: false, error: error.message, stats };
    }
  }

  /**
   * Call actual AWS API command (placeholder)
   */
  async callAWSCommand(clientName, cmdConfig, region, integration) {
    // This would be fully implemented with real AWS SDK calls
    // Placeholder for real implementation
    return [];
  }

  /**
   * Normalize AWS resource to Asset schema
   */
  normalizeAsset(provider, accountId, region, service, resourceType, rawData) {
    try {
      if (!rawData) return null;

      // Extract ARN based on resource type
      const arn = this.buildArn(provider, accountId, region, service, resourceType, rawData);
      if (!arn) return null;

      // Extract resource ID and name
      const { resourceId, name, tags, isPublic } = this.extractResourceMetadata(
        service,
        resourceType,
        rawData
      );

      // Determine if internet exposed
      let isInternetExposed = isPublic;
      if (service === 'EC2' && resourceType === 'security-group') {
        isInternetExposed = this.isSecurityGroupPublic(rawData);
      } else if (service === 'S3' && resourceType === 'bucket') {
        isInternetExposed = this.isBucketPublic(rawData);
      } else if (service === 'RDS') {
        isInternetExposed = rawData.PubliclyAccessible === true;
      } else if (service === 'EC2' && resourceType === 'instance') {
        isInternetExposed = !!(rawData.PublicIpAddress || rawData.AssociationPublicIp);
      }

      const asset = {
        assetId: this.generateAssetId(provider, arn),
        provider,
        accountId,
        region,
        service,
        resourceType,
        resourceArn: arn,
        resourceId,
        name: name || resourceId,
        tags: new Map(Object.entries(tags || {})),
        metadata: rawData,
        configuration: this.extractConfiguration(service, resourceType, rawData),
        isInternetExposed,
        environment: this.determineEnvironment(tags),
        dataClassification: this.determineDataClassification(tags),
        criticality: this.determineCriticality(service, resourceType, tags),
        lastSeen: new Date(),
      };

      return asset;
    } catch (error) {
      console.error(`Error normalizing asset: ${error.message}`);
      return null;
    }
  }

  /**
   * Build ARN from AWS resource
   */
  buildArn(provider, accountId, region, service, resourceType, resource) {
    try {
      const arnParts = ['arn:aws'];

      switch (service) {
        case 'EC2':
          if (resourceType === 'instance') {
            return `arn:aws:ec2:${region}:${accountId}:instance/${resource.InstanceId}`;
          } else if (resourceType === 'security-group') {
            return `arn:aws:ec2:${region}:${accountId}:security-group/${resource.GroupId}`;
          } else if (resourceType === 'volume') {
            return `arn:aws:ec2:${region}:${accountId}:volume/${resource.VolumeId}`;
          } else if (resourceType === 'snapshot') {
            return `arn:aws:ec2:${region}:${accountId}:snapshot/${resource.SnapshotId}`;
          } else if (resourceType === 'ami') {
            return `arn:aws:ec2:${region}:${accountId}:image/${resource.ImageId}`;
          } else if (resourceType === 'vpc') {
            return `arn:aws:ec2:${region}:${accountId}:vpc/${resource.VpcId}`;
          } else if (resourceType === 'subnet') {
            return `arn:aws:ec2:${region}:${accountId}:subnet/${resource.SubnetId}`;
          } else if (resourceType === 'route-table') {
            return `arn:aws:ec2:${region}:${accountId}:route-table/${resource.RouteTableId}`;
          } else if (resourceType === 'internet-gateway') {
            return `arn:aws:ec2:${region}:${accountId}:internet-gateway/${resource.InternetGatewayId}`;
          } else if (resourceType === 'nat-gateway') {
            return `arn:aws:ec2:${region}:${accountId}:nat-gateway/${resource.NatGatewayId}`;
          } else if (resourceType === 'network-acl') {
            return `arn:aws:ec2:${region}:${accountId}:network-acl/${resource.NetworkAclId}`;
          }
          break;

        case 'S3':
          if (resourceType === 'bucket') {
            return `arn:aws:s3:::${resource.Name}`;
          }
          break;

        case 'RDS':
          if (resourceType === 'db-instance') {
            return `arn:aws:rds:${region}:${accountId}:db:${resource.DBInstanceIdentifier}`;
          } else if (resourceType === 'db-cluster') {
            return `arn:aws:rds:${region}:${accountId}:cluster:${resource.DBClusterIdentifier}`;
          }
          break;

        case 'IAM':
          if (resourceType === 'user') {
            return `arn:aws:iam::${accountId}:user/${resource.UserName}`;
          } else if (resourceType === 'role') {
            return `arn:aws:iam::${accountId}:role/${resource.RoleName}`;
          } else if (resourceType === 'policy') {
            return `arn:aws:iam::${accountId}:policy/${resource.PolicyName}`;
          }
          break;

        case 'Lambda':
          if (resourceType === 'function') {
            return `arn:aws:lambda:${region}:${accountId}:function:${resource.FunctionName}`;
          }
          break;

        case 'EKS':
          if (resourceType === 'cluster') {
            return `arn:aws:eks:${region}:${accountId}:cluster/${resource}`;
          }
          break;

        case 'DynamoDB':
          if (resourceType === 'table') {
            return `arn:aws:dynamodb:${region}:${accountId}:table/${resource.TableName}`;
          }
          break;

        case 'KMS':
          if (resourceType === 'key') {
            return `arn:aws:kms:${region}:${accountId}:key/${resource.KeyId}`;
          }
          break;

        case 'SecretsManager':
          if (resourceType === 'secret') {
            return `arn:aws:secretsmanager:${region}:${accountId}:secret:${resource.Name}`;
          }
          break;

        case 'CloudTrail':
          if (resourceType === 'trail') {
            return `arn:aws:cloudtrail:${region}:${accountId}:trail/${resource.Name}`;
          }
          break;

        case 'ELB':
          if (resourceType === 'load-balancer') {
            return resource.LoadBalancerArn;
          } else if (resourceType === 'target-group') {
            return resource.TargetGroupArn;
          }
          break;

        case 'SNS':
          if (resourceType === 'topic') {
            return resource.TopicArn;
          }
          break;

        case 'SQS':
          if (resourceType === 'queue') {
            return `arn:aws:sqs:${region}:${accountId}:${resource.QueueUrl.split('/').pop()}`;
          }
          break;

        default:
          return null;
      }

      return null;
    } catch (error) {
      console.error(`Error building ARN: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract resource metadata from raw AWS data
   */
  extractResourceMetadata(service, resourceType, resource) {
    const metadata = {
      resourceId: null,
      name: null,
      tags: {},
      isPublic: false,
    };

    try {
      // Extract resource ID
      if (resourceType === 'instance') metadata.resourceId = resource.InstanceId;
      else if (resourceType === 'security-group') metadata.resourceId = resource.GroupId;
      else if (resourceType === 'volume') metadata.resourceId = resource.VolumeId;
      else if (resourceType === 'snapshot') metadata.resourceId = resource.SnapshotId;
      else if (resourceType === 'ami') metadata.resourceId = resource.ImageId;
      else if (resourceType === 'vpc') metadata.resourceId = resource.VpcId;
      else if (resourceType === 'subnet') metadata.resourceId = resource.SubnetId;
      else if (resourceType === 'bucket') metadata.resourceId = resource.Name;
      else if (resourceType === 'db-instance') metadata.resourceId = resource.DBInstanceIdentifier;
      else if (resourceType === 'db-cluster') metadata.resourceId = resource.DBClusterIdentifier;
      else if (resourceType === 'user') metadata.resourceId = resource.UserName;
      else if (resourceType === 'role') metadata.resourceId = resource.RoleName;
      else if (resourceType === 'policy') metadata.resourceId = resource.PolicyName;
      else if (resourceType === 'function') metadata.resourceId = resource.FunctionName;
      else if (resourceType === 'cluster') metadata.resourceId = resource;
      else if (resourceType === 'table') metadata.resourceId = resource.TableName;
      else if (resourceType === 'key') metadata.resourceId = resource.KeyId;
      else if (resourceType === 'secret') metadata.resourceId = resource.Name;
      else if (resourceType === 'trail') metadata.resourceId = resource.Name;
      else if (resourceType === 'load-balancer') metadata.resourceId = resource.LoadBalancerName;
      else if (resourceType === 'target-group') metadata.resourceId = resource.TargetGroupName;
      else if (resourceType === 'topic') metadata.resourceId = resource.TopicArn.split(':').pop();
      else if (resourceType === 'queue') metadata.resourceId = resource.QueueUrl.split('/').pop();

      // Extract name from tags or resource properties
      if (resource.Tags) {
        for (const tag of resource.Tags) {
          metadata.tags[tag.Key] = tag.Value;
          if (tag.Key === 'Name') {
            metadata.name = tag.Value;
          }
        }
      } else if (resource.TagList) {
        for (const tag of resource.TagList) {
          metadata.tags[tag.Key] = tag.Value;
          if (tag.Key === 'Name') {
            metadata.name = tag.Value;
          }
        }
      }

      return metadata;
    } catch (error) {
      console.error(`Error extracting metadata: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Check if security group allows public access
   */
  isSecurityGroupPublic(sg) {
    if (!sg.IpPermissions) return false;

    for (const perm of sg.IpPermissions) {
      // Check for 0.0.0.0/0 or ::/0 (IPv6)
      if (perm.IpRanges) {
        for (const range of perm.IpRanges) {
          if (range.CidrIp === '0.0.0.0/0') return true;
        }
      }
      if (perm.Ipv6Ranges) {
        for (const range of perm.Ipv6Ranges) {
          if (range.CidrIpv6 === '::/0') return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if S3 bucket is public
   */
  isBucketPublic(bucket) {
    // In real implementation, would check bucket policy and ACL
    // For now, return false (assume private by default)
    return false;
  }

  /**
   * Extract service-specific configuration
   */
  extractConfiguration(service, resourceType, resource) {
    const config = {};

    try {
      if (service === 'RDS' && resourceType === 'db-instance') {
        config.engine = resource.Engine;
        config.engineVersion = resource.EngineVersion;
        config.dbInstanceClass = resource.DBInstanceClass;
        config.allocatedStorage = resource.AllocatedStorage;
        config.publicly_accessible = resource.PubliclyAccessible;
      } else if (service === 'EC2' && resourceType === 'instance') {
        config.instanceType = resource.InstanceType;
        config.state = resource.State?.Name;
        config.launchTime = resource.LaunchTime;
      } else if (service === 'Lambda' && resourceType === 'function') {
        config.runtime = resource.Runtime;
        config.memory = resource.MemorySize;
        config.timeout = resource.Timeout;
      }
    } catch (error) {
      console.error(`Error extracting configuration: ${error.message}`);
    }

    return config;
  }

  /**
   * Determine environment from tags
   */
  determineEnvironment(tags) {
    if (!tags) return 'unknown';

    const envTag = tags.Environment || tags.environment || tags.env;
    if (!envTag) return 'unknown';

    const envLower = envTag.toLowerCase();
    if (envLower.includes('prod')) return 'production';
    if (envLower.includes('stage')) return 'staging';
    if (envLower.includes('dev')) return 'development';
    if (envLower.includes('test')) return 'testing';

    return 'unknown';
  }

  /**
   * Determine data classification from tags
   */
  determineDataClassification(tags) {
    if (!tags) return 'unclassified';

    const classTag = tags.DataClassification || tags.Classification || tags.sensitivity;
    if (!classTag) return 'unclassified';

    const classLower = classTag.toLowerCase();
    if (classLower.includes('public')) return 'public';
    if (classLower.includes('internal')) return 'internal';
    if (classLower.includes('confidential')) return 'confidential';
    if (classLower.includes('restrict')) return 'restricted';

    return 'unclassified';
  }

  /**
   * Determine criticality from service type and tags
   */
  determineCriticality(service, resourceType, tags) {
    // Database services are typically high criticality
    if (service === 'RDS') return 'high';
    if (service === 'DynamoDB') return 'high';

    // IAM resources are critical
    if (service === 'IAM') return 'high';

    // Check tags for criticality indication
    if (tags) {
      const critTag = tags.Criticality || tags.criticality;
      if (critTag) {
        const critLower = critTag.toLowerCase();
        if (critLower.includes('critical')) return 'critical';
        if (critLower.includes('high')) return 'high';
        if (critLower.includes('medium')) return 'medium';
        if (critLower.includes('low')) return 'low';
      }
    }

    return 'unclassified';
  }

  /**
   * Generate asset ID
   */
  generateAssetId(provider, arn) {
    const hash = crypto
      .createHash('md5')
      .update(`${provider}-${arn}`)
      .digest('hex')
      .substring(0, 8);
    return `AST-${provider.toUpperCase()}-${hash}`;
  }

  /**
   * Upsert asset into database
   */
  async upsertAsset(assetData, integrationRef) {
    try {
      const existing = await Asset.findOne({ resourceArn: assetData.resourceArn });

      if (existing) {
        // Update existing
        const isUpdated = JSON.stringify(existing.metadata) !== JSON.stringify(assetData.metadata);

        Object.assign(existing, assetData);
        existing.integrationRef = integrationRef;
        await existing.save();

        return { isNew: false, isUpdated, asset: existing };
      } else {
        // Create new
        const asset = new Asset({
          ...assetData,
          integrationRef,
        });
        await asset.save();
        return { isNew: true, isUpdated: false, asset };
      }
    } catch (error) {
      console.error(`Error upserting asset: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build relationships between assets
   */
  async buildRelationships(integrationRef) {
    try {
      const assets = await Asset.find({ integrationRef });

      for (const asset of assets) {
        asset.relationships = [];

        // EC2 Instance relationships
        if (asset.service === 'EC2' && asset.resourceType === 'instance') {
          if (asset.metadata.VpcId) {
            const vpcArn = `arn:aws:ec2:${asset.region}:${asset.accountId}:vpc/${asset.metadata.VpcId}`;
            asset.relationships.push({
              relationType: 'belongs_to',
              targetArn: vpcArn,
              targetResourceType: 'vpc',
            });
          }
          if (asset.metadata.SubnetId) {
            const subnetArn = `arn:aws:ec2:${asset.region}:${asset.accountId}:subnet/${asset.metadata.SubnetId}`;
            asset.relationships.push({
              relationType: 'belongs_to',
              targetArn: subnetArn,
              targetResourceType: 'subnet',
            });
          }
          if (asset.metadata.SecurityGroups) {
            for (const sg of asset.metadata.SecurityGroups) {
              asset.relationships.push({
                relationType: 'secured_by',
                targetArn: `arn:aws:ec2:${asset.region}:${asset.accountId}:security-group/${sg.GroupId}`,
                targetResourceType: 'security-group',
              });
            }
          }
        }

        // Subnet relationships
        if (asset.service === 'EC2' && asset.resourceType === 'subnet') {
          if (asset.metadata.VpcId) {
            const vpcArn = `arn:aws:ec2:${asset.region}:${asset.accountId}:vpc/${asset.metadata.VpcId}`;
            asset.relationships.push({
              relationType: 'belongs_to',
              targetArn: vpcArn,
              targetResourceType: 'vpc',
            });
          }
        }

        // EBS Volume relationships
        if (asset.service === 'EC2' && asset.resourceType === 'volume') {
          if (asset.metadata.Attachments) {
            for (const attachment of asset.metadata.Attachments) {
              asset.relationships.push({
                relationType: 'attached_to',
                targetArn: `arn:aws:ec2:${asset.region}:${asset.accountId}:instance/${attachment.InstanceId}`,
                targetResourceType: 'instance',
              });
            }
          }
        }

        // RDS relationships
        if (asset.service === 'RDS') {
          if (asset.metadata.VpcSecurityGroups) {
            for (const sgInfo of asset.metadata.VpcSecurityGroups) {
              asset.relationships.push({
                relationType: 'secured_by',
                targetArn: `arn:aws:ec2:${asset.region}:${asset.accountId}:security-group/${sgInfo.VpcSecurityGroupId}`,
                targetResourceType: 'security-group',
              });
            }
          }
          if (asset.metadata.DBSubnetGroup?.DBSubnetGroupName) {
            asset.relationships.push({
              relationType: 'backed_by',
              targetArn: asset.metadata.DBSubnetGroup.DBSubnetGroupName,
              targetResourceType: 'subnet-group',
            });
          }
        }

        // Save relationships
        if (asset.relationships.length > 0) {
          await asset.save();
        }
      }

      console.log(`Built relationships for ${assets.length} assets`);
    } catch (error) {
      console.error(`Error building relationships: ${error.message}`);
    }
  }

  /**
   * Log sync progress
   */
  async logSyncProgress(syncJob, level, message) {
    try {
      syncJob.logs.push({
        timestamp: new Date(),
        level,
        message,
      });

      if (syncJob.logs.length % 10 === 0) {
        await syncJob.save();
      }
    } catch (error) {
      console.error(`Error logging sync progress: ${error.message}`);
    }
  }

  /**
   * Generate mock resources for demo/test mode
   */
  async generateMockResources(service, resourceType, region, accountId) {
    const resources = [];
    const resourceCount = {
      instance: 3,
      'security-group': 4,
      volume: 5,
      snapshot: 2,
      ami: 1,
      vpc: 2,
      subnet: 4,
      'route-table': 3,
      'internet-gateway': 1,
      'nat-gateway': 1,
      'network-acl': 2,
      bucket: 3,
      'db-instance': 2,
      'db-cluster': 1,
      user: 5,
      role: 4,
      policy: 3,
      function: 4,
      cluster: 1,
      table: 2,
      key: 2,
      secret: 3,
      trail: 1,
      'load-balancer': 2,
      'target-group': 3,
      topic: 2,
      queue: 3,
    };

    const count = resourceCount[resourceType] || 1;

    for (let i = 1; i <= count; i++) {
      const mockResource = this.generateMockResource(
        service,
        resourceType,
        region,
        accountId,
        i
      );
      if (mockResource) {
        resources.push(mockResource);
      }
    }

    return resources;
  }

  /**
   * Generate a single mock resource
   */
  generateMockResource(service, resourceType, region, accountId, index) {
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const envs = ['production', 'staging', 'development'];
    const env = envs[index % 3];
    const owners = ['platform-team', 'app-team', 'data-team'];
    const owner = owners[index % 3];

    const baseResource = {
      Tags: [
        { Key: 'Name', Value: `${service.toLowerCase()}-${resourceType}-${index}` },
        { Key: 'Environment', Value: env },
        { Key: 'Owner', Value: owner },
        { Key: 'Team', Value: 'engineering' },
        { Key: 'CostCenter', Value: 'CC-' + (1000 + index) },
      ],
    };

    switch (service) {
      case 'EC2':
        if (resourceType === 'instance') {
          return {
            ...baseResource,
            InstanceId: `i-${Math.random().toString(36).substr(2, 17)}`,
            InstanceType: index % 2 === 0 ? 't3.medium' : 't3.large',
            State: { Name: index % 3 === 0 ? 'stopped' : 'running' },
            LaunchTime: timestamp,
            VpcId: `vpc-${Math.random().toString(36).substr(2, 8)}`,
            SubnetId: `subnet-${Math.random().toString(36).substr(2, 8)}`,
            PublicIpAddress: index % 2 === 0 ? `203.0.113.${index}` : null,
            SecurityGroups: [
              {
                GroupId: `sg-${Math.random().toString(36).substr(2, 8)}`,
                GroupName: 'default',
              },
            ],
          };
        } else if (resourceType === 'security-group') {
          return {
            ...baseResource,
            GroupId: `sg-${Math.random().toString(36).substr(2, 8)}`,
            GroupName: `${service.toLowerCase()}-sg-${index}`,
            VpcId: `vpc-${Math.random().toString(36).substr(2, 8)}`,
            IpPermissions:
              index % 2 === 0
                ? [
                    {
                      FromPort: 443,
                      ToPort: 443,
                      IpProtocol: 'tcp',
                      IpRanges: [{ CidrIp: '10.0.0.0/8' }],
                    },
                  ]
                : [
                    {
                      FromPort: 80,
                      ToPort: 80,
                      IpProtocol: 'tcp',
                      IpRanges: [{ CidrIp: '0.0.0.0/0' }],
                    },
                  ],
          };
        } else if (resourceType === 'volume') {
          return {
            ...baseResource,
            VolumeId: `vol-${Math.random().toString(36).substr(2, 8)}`,
            Size: 10 + index * 10,
            VolumeType: index % 2 === 0 ? 'gp3' : 'gp2',
            State: 'available',
            CreateTime: timestamp,
            Attachments: [],
          };
        } else if (resourceType === 'snapshot') {
          return {
            ...baseResource,
            SnapshotId: `snap-${Math.random().toString(36).substr(2, 8)}`,
            VolumeSize: 10 + index * 10,
            State: 'completed',
            StartTime: timestamp,
          };
        } else if (resourceType === 'ami') {
          return {
            ...baseResource,
            ImageId: `ami-${Math.random().toString(36).substr(2, 8)}`,
            Name: `custom-ami-${index}`,
            State: 'available',
          };
        } else if (resourceType === 'vpc') {
          return {
            ...baseResource,
            VpcId: `vpc-${Math.random().toString(36).substr(2, 8)}`,
            CidrBlock: `10.${index}.0.0/16`,
            State: 'available',
          };
        } else if (resourceType === 'subnet') {
          return {
            ...baseResource,
            SubnetId: `subnet-${Math.random().toString(36).substr(2, 8)}`,
            VpcId: `vpc-${Math.random().toString(36).substr(2, 8)}`,
            CidrBlock: `10.${index}.${index * 2}.0/24`,
            AvailabilityZone: `${region}${String.fromCharCode(97 + (index % 3))}`,
            State: 'available',
          };
        }
        break;

      case 'S3':
        if (resourceType === 'bucket') {
          return {
            ...baseResource,
            Name: `grc-bucket-${accountId}-${index}`.toLowerCase(),
            CreationDate: timestamp,
            TagList: baseResource.Tags,
          };
        }
        break;

      case 'RDS':
        if (resourceType === 'db-instance') {
          return {
            ...baseResource,
            DBInstanceIdentifier: `db-instance-${index}`,
            DBInstanceClass: index % 2 === 0 ? 'db.t3.micro' : 'db.t3.small',
            Engine: index % 3 === 0 ? 'postgres' : 'mysql',
            EngineVersion: '14.7',
            AllocatedStorage: 20 + index * 10,
            DBInstanceStatus: 'available',
            Endpoint: {
              Address: `db-instance-${index}.xxxxx.${region}.rds.amazonaws.com`,
            },
            PubliclyAccessible: index % 5 === 0,
            VpcSecurityGroups: [
              {
                VpcSecurityGroupId: `sg-${Math.random().toString(36).substr(2, 8)}`,
              },
            ],
            TagList: baseResource.Tags,
          };
        } else if (resourceType === 'db-cluster') {
          return {
            ...baseResource,
            DBClusterIdentifier: `db-cluster-${index}`,
            Engine: 'aurora-mysql',
            Status: 'available',
            DBClusterMembers: [
              { DBInstanceIdentifier: `db-instance-${index}-1` },
              { DBInstanceIdentifier: `db-instance-${index}-2` },
            ],
            TagList: baseResource.Tags,
          };
        }
        break;

      case 'IAM':
        if (resourceType === 'user') {
          return {
            ...baseResource,
            UserName: `user-${owner}-${index}`,
            UserId: Math.random().toString(36).substr(2, 18).toUpperCase(),
            Arn: `arn:aws:iam::${accountId}:user/user-${owner}-${index}`,
            CreateDate: timestamp,
          };
        } else if (resourceType === 'role') {
          const assumeRolePolicies = [
            'ec2',
            'lambda',
            'ecs',
            'rds',
          ];
          return {
            ...baseResource,
            RoleName: `${assumeRolePolicies[index % 4]}-role-${index}`,
            RoleId: Math.random().toString(36).substr(2, 18).toUpperCase(),
            Arn: `arn:aws:iam::${accountId}:role/${assumeRolePolicies[index % 4]}-role-${index}`,
            CreateDate: timestamp,
            AssumeRolePolicyDocument: '{}',
          };
        } else if (resourceType === 'policy') {
          return {
            ...baseResource,
            PolicyName: `policy-${index}`,
            PolicyId: Math.random().toString(36).substr(2, 18).toUpperCase(),
            Arn: `arn:aws:iam::${accountId}:policy/policy-${index}`,
            CreateDate: timestamp,
            DefaultVersionId: 'v1',
          };
        }
        break;

      case 'Lambda':
        if (resourceType === 'function') {
          return {
            ...baseResource,
            FunctionName: `lambda-function-${index}`,
            Runtime: index % 3 === 0 ? 'python3.11' : 'nodejs18.x',
            Handler: index % 3 === 0 ? 'handler.main' : 'index.handler',
            MemorySize: 128 + index * 64,
            Timeout: 30 + index * 10,
            FunctionArn: `arn:aws:lambda:${region}:${accountId}:function:lambda-function-${index}`,
            CodeSize: 1000 + index * 100,
            LastModified: timestamp,
            TagList: baseResource.Tags,
          };
        }
        break;

      case 'EKS':
        if (resourceType === 'cluster') {
          return `eks-cluster-${index}`;
        }
        break;

      case 'DynamoDB':
        if (resourceType === 'table') {
          return {
            TableName: `dynamodb-table-${index}`,
            TableArn: `arn:aws:dynamodb:${region}:${accountId}:table/dynamodb-table-${index}`,
            TableStatus: 'ACTIVE',
            CreationDateTime: timestamp,
            ItemCount: 1000 + index * 500,
            TableSizeBytes: 10000 + index * 5000,
            BillingModeSummary: { BillingMode: index % 2 === 0 ? 'PAY_PER_REQUEST' : 'PROVISIONED' },
            Tags: baseResource.Tags,
          };
        }
        break;

      case 'KMS':
        if (resourceType === 'key') {
          return {
            KeyId: `${Math.random().toString(36).substr(2, 8)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 12)}`,
            Arn: `arn:aws:kms:${region}:${accountId}:key/${Math.random().toString(36).substr(2, 8)}`,
            CreationDate: timestamp,
            Enabled: true,
            KeyUsage: 'ENCRYPT_DECRYPT',
            Tags: baseResource.Tags,
          };
        }
        break;

      case 'SecretsManager':
        if (resourceType === 'secret') {
          return {
            ...baseResource,
            Name: `secret-${index}`,
            Arn: `arn:aws:secretsmanager:${region}:${accountId}:secret:secret-${index}`,
            LastAccessedDate: timestamp,
            LastRotatedDate: new Date(timestamp.getTime() + 30 * 24 * 60 * 60 * 1000),
            TagList: baseResource.Tags,
          };
        }
        break;

      case 'CloudTrail':
        if (resourceType === 'trail') {
          return {
            ...baseResource,
            Name: `trail-${index}`,
            S3BucketName: `cloudtrail-bucket-${index}`,
            IncludeGlobalServiceEvents: true,
            IsMultiRegionTrail: true,
            HasCustomEventSelectors: false,
            HasInsightSelectors: index % 2 === 0,
            IsOrganizationTrail: false,
            TagList: baseResource.Tags,
          };
        }
        break;

      case 'ELB':
        if (resourceType === 'load-balancer') {
          return {
            ...baseResource,
            LoadBalancerName: `alb-${index}`,
            LoadBalancerArn: `arn:aws:elasticloadbalancing:${region}:${accountId}:loadbalancer/app/alb-${index}/xxxxx`,
            Type: index % 2 === 0 ? 'application' : 'network',
            Scheme: index % 3 === 0 ? 'internal' : 'internet-facing',
            VpcId: `vpc-${Math.random().toString(36).substr(2, 8)}`,
            CreatedTime: timestamp,
            Tags: baseResource.Tags,
          };
        } else if (resourceType === 'target-group') {
          return {
            ...baseResource,
            TargetGroupName: `tg-${index}`,
            TargetGroupArn: `arn:aws:elasticloadbalancing:${region}:${accountId}:targetgroup/tg-${index}/xxxxx`,
            Protocol: index % 2 === 0 ? 'HTTP' : 'HTTPS',
            Port: index % 2 === 0 ? 80 : 443,
            VpcId: `vpc-${Math.random().toString(36).substr(2, 8)}`,
            TargetType: 'instance',
            CreatedTime: timestamp,
            Tags: baseResource.Tags,
          };
        }
        break;

      case 'SNS':
        if (resourceType === 'topic') {
          return {
            TopicArn: `arn:aws:sns:${region}:${accountId}:topic-${index}`,
            DisplayName: `Topic ${index}`,
            TagList: baseResource.Tags,
          };
        }
        break;

      case 'SQS':
        if (resourceType === 'queue') {
          return {
            QueueUrl: `https://sqs.${region}.amazonaws.com/${accountId}/queue-${index}`,
            Tags: baseResource.Tags,
          };
        }
        break;

      default:
        return baseResource;
    }

    return null;
  }
}

module.exports = new AWSDiscoveryService();
