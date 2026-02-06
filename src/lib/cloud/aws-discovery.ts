/**
 * AWS Cloud Asset Discovery Engine
 * 
 * Discovers cloud resources across AWS services using STS AssumeRole.
 * Normalizes discovered resources into the unified Asset schema.
 */

// AWS service types we discover
export const AWS_SERVICES = [
  'ec2', 's3', 'rds', 'vpc', 'iam', 'lambda', 'eks', 'ecs',
  'dynamodb', 'kms', 'secretsmanager', 'cloudtrail', 'guardduty',
  'ebs', 'elb', 'cloudfront', 'route53', 'sns', 'sqs',
  'autoscaling', 'securityhub', 'config'
] as const;

export type AWSService = typeof AWS_SERVICES[number];

// Standard AWS regions
export const AWS_REGIONS = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'sa-east-1', 'ca-central-1',
  'me-south-1', 'af-south-1'
] as const;

export type AWSRegion = typeof AWS_REGIONS[number];

// Normalized asset from discovery
export interface DiscoveredAsset {
  resource_id: string;
  resource_arn: string;
  resource_type: string;
  resource_name: string;
  service: AWSService;
  provider: 'aws';
  account_id: string;
  region: string;
  tags: Record<string, string>;
  configuration: Record<string, unknown>;
  relationships: Array<{ type: string; target_arn: string; target_type: string }>;
  internet_exposed: boolean;
}

// Discovery job result
export interface DiscoveryResult {
  assets: DiscoveredAsset[];
  services_scanned: string[];
  regions_scanned: string[];
  errors: Array<{ service: string; region: string; error: string }>;
  duration_ms: number;
}

// Connection test result
export interface ConnectionTestResult {
  success: boolean;
  account_id?: string;
  account_alias?: string;
  identity_arn?: string;
  error?: string;
  regions_accessible?: string[];
}

/**
 * Test AWS connection via AssumeRole
 */
export async function testAWSConnection(
  roleArn: string,
  externalId: string
): Promise<ConnectionTestResult> {
  try {
    // In production, this would use AWS SDK:
    // const sts = new STSClient({ region: 'us-east-1' });
    // const assumeRole = await sts.send(new AssumeRoleCommand({
    //   RoleArn: roleArn,
    //   ExternalId: externalId,
    //   RoleSessionName: 'secureline-grc-test',
    //   DurationSeconds: 900
    // }));
    
    // For now, validate the ARN format and return mock success
    const arnRegex = /^arn:aws:iam::\d{12}:role\/.+$/;
    if (!arnRegex.test(roleArn)) {
      return { success: false, error: 'Invalid IAM Role ARN format. Expected: arn:aws:iam::<account-id>:role/<role-name>' };
    }

    const accountId = roleArn.split(':')[4];
    
    return {
      success: true,
      account_id: accountId,
      identity_arn: roleArn,
      account_alias: `aws-account-${accountId}`,
      regions_accessible: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    };
  }
}

/**
 * Discover AWS assets for a given account
 * In production, this would call AWS APIs. For now, generates realistic mock data.
 */
export async function discoverAWSAssets(
  accountId: string,
  regions: string[],
  services?: AWSService[]
): Promise<DiscoveryResult> {
  const startTime = Date.now();
  const assets: DiscoveredAsset[] = [];
  const errors: DiscoveryResult['errors'] = [];
  const servicesToScan = services || ['ec2', 's3', 'rds', 'vpc', 'iam', 'lambda', 'eks', 'dynamodb', 'kms', 'ebs', 'elb'];

  for (const region of regions) {
    for (const service of servicesToScan) {
      try {
        const discovered = generateServiceAssets(accountId, region, service);
        assets.push(...discovered);
      } catch (err) {
        errors.push({
          service,
          region,
          error: err instanceof Error ? err.message : 'Discovery failed',
        });
      }
    }
  }

  return {
    assets,
    services_scanned: servicesToScan,
    regions_scanned: regions,
    errors,
    duration_ms: Date.now() - startTime,
  };
}

/**
 * Generate realistic mock assets for a service/region combination.
 * In production, replace with actual AWS SDK calls.
 */
function generateServiceAssets(
  accountId: string,
  region: string,
  service: AWSService
): DiscoveredAsset[] {
  const assets: DiscoveredAsset[] = [];
  const envs = ['production', 'staging', 'development'];
  const teams = ['platform', 'backend', 'data', 'security', 'frontend', 'devops'];

  const generators: Partial<Record<AWSService, () => DiscoveredAsset[]>> = {
    ec2: () => {
      const count = Math.floor(Math.random() * 8) + 2;
      return Array.from({ length: count }, (_, i) => {
        const env = envs[Math.floor(Math.random() * envs.length)];
        const team = teams[Math.floor(Math.random() * teams.length)];
        const instanceId = `i-${Math.random().toString(36).substring(2, 12)}`;
        return {
          resource_id: instanceId,
          resource_arn: `arn:aws:ec2:${region}:${accountId}:instance/${instanceId}`,
          resource_type: 'ec2_instance',
          resource_name: `${env}-${team}-server-${i + 1}`,
          service: 'ec2' as AWSService,
          provider: 'aws' as const,
          account_id: accountId,
          region,
          tags: {
            Name: `${env}-${team}-server-${i + 1}`,
            Environment: env,
            Team: team,
            Owner: `${team}@company.com`,
            ManagedBy: 'terraform',
          },
          configuration: {
            instance_type: ['t3.micro', 't3.small', 't3.medium', 'm5.large', 'c5.xlarge'][Math.floor(Math.random() * 5)],
            state: 'running',
            vpc_id: `vpc-${Math.random().toString(36).substring(2, 10)}`,
            subnet_id: `subnet-${Math.random().toString(36).substring(2, 10)}`,
            security_groups: [`sg-${Math.random().toString(36).substring(2, 10)}`],
            public_ip: env === 'production' && Math.random() > 0.7 ? `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : null,
            private_ip: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          },
          relationships: [
            { type: 'in_vpc', target_arn: `arn:aws:ec2:${region}:${accountId}:vpc/vpc-abc123`, target_type: 'vpc' },
          ],
          internet_exposed: env === 'production' && Math.random() > 0.7,
        };
      });
    },

    s3: () => {
      const buckets = ['data-lake', 'logs', 'backups', 'static-assets', 'artifacts', 'configs', 'ml-models'];
      return buckets.slice(0, Math.floor(Math.random() * 5) + 2).map(name => {
        const env = envs[Math.floor(Math.random() * envs.length)];
        const bucketName = `${accountId}-${env}-${name}-${region.replace(/-/g, '')}`;
        const isPublic = name === 'static-assets' && env === 'production';
        return {
          resource_id: bucketName,
          resource_arn: `arn:aws:s3:::${bucketName}`,
          resource_type: 's3_bucket',
          resource_name: bucketName,
          service: 's3' as AWSService,
          provider: 'aws' as const,
          account_id: accountId,
          region,
          tags: {
            Name: bucketName,
            Environment: env,
            Purpose: name,
            DataClassification: name === 'data-lake' ? 'confidential' : name === 'logs' ? 'internal' : 'public',
          },
          configuration: {
            versioning: Math.random() > 0.3,
            encryption: Math.random() > 0.2 ? 'AES256' : 'aws:kms',
            public_access_block: !isPublic,
            logging_enabled: Math.random() > 0.4,
          },
          relationships: [],
          internet_exposed: isPublic,
        };
      });
    },

    rds: () => {
      const count = Math.floor(Math.random() * 3) + 1;
      return Array.from({ length: count }, (_, i) => {
        const env = envs[Math.floor(Math.random() * envs.length)];
        const dbId = `${env}-db-${['postgres', 'mysql', 'aurora'][i % 3]}-${i + 1}`;
        return {
          resource_id: dbId,
          resource_arn: `arn:aws:rds:${region}:${accountId}:db:${dbId}`,
          resource_type: 'rds_instance',
          resource_name: dbId,
          service: 'rds' as AWSService,
          provider: 'aws' as const,
          account_id: accountId,
          region,
          tags: {
            Name: dbId,
            Environment: env,
            Engine: ['postgres', 'mysql', 'aurora-postgresql'][i % 3],
            DataClassification: 'confidential',
          },
          configuration: {
            engine: ['postgres', 'mysql', 'aurora-postgresql'][i % 3],
            engine_version: '15.4',
            instance_class: ['db.t3.micro', 'db.r5.large', 'db.r6g.xlarge'][i % 3],
            multi_az: env === 'production',
            encrypted: true,
            publicly_accessible: false,
            backup_retention: env === 'production' ? 30 : 7,
          },
          relationships: [
            { type: 'in_vpc', target_arn: `arn:aws:ec2:${region}:${accountId}:vpc/vpc-abc123`, target_type: 'vpc' },
          ],
          internet_exposed: false,
        };
      });
    },

    vpc: () => {
      const vpcs = ['main', 'data', 'management'];
      return vpcs.slice(0, Math.floor(Math.random() * 2) + 1).map(name => {
        const vpcId = `vpc-${Math.random().toString(36).substring(2, 10)}`;
        return {
          resource_id: vpcId,
          resource_arn: `arn:aws:ec2:${region}:${accountId}:vpc/${vpcId}`,
          resource_type: 'vpc',
          resource_name: `${name}-vpc`,
          service: 'vpc' as AWSService,
          provider: 'aws' as const,
          account_id: accountId,
          region,
          tags: { Name: `${name}-vpc`, Purpose: name },
          configuration: {
            cidr_block: name === 'main' ? '10.0.0.0/16' : name === 'data' ? '10.1.0.0/16' : '10.2.0.0/16',
            enable_dns_hostnames: true,
            enable_dns_support: true,
          },
          relationships: [],
          internet_exposed: false,
        };
      });
    },

    iam: () => {
      const roles = ['admin-role', 'developer-role', 'readonly-role', 'ci-cd-role', 'lambda-exec-role'];
      return roles.map(name => ({
        resource_id: name,
        resource_arn: `arn:aws:iam::${accountId}:role/${name}`,
        resource_type: 'iam_role',
        resource_name: name,
        service: 'iam' as AWSService,
        provider: 'aws' as const,
        account_id: accountId,
        region: 'global',
        tags: { Name: name },
        configuration: { assume_role_policy: {}, max_session_duration: 3600 },
        relationships: [],
        internet_exposed: false,
      }));
    },

    lambda: () => {
      const count = Math.floor(Math.random() * 5) + 1;
      return Array.from({ length: count }, (_, i) => {
        const env = envs[Math.floor(Math.random() * envs.length)];
        const funcName = `${env}-${['api-handler', 'data-processor', 'event-trigger', 'cron-job', 'auth-handler'][i % 5]}`;
        return {
          resource_id: funcName,
          resource_arn: `arn:aws:lambda:${region}:${accountId}:function:${funcName}`,
          resource_type: 'lambda_function',
          resource_name: funcName,
          service: 'lambda' as AWSService,
          provider: 'aws' as const,
          account_id: accountId,
          region,
          tags: { Name: funcName, Environment: env, Runtime: 'nodejs20.x' },
          configuration: {
            runtime: 'nodejs20.x',
            memory_size: [128, 256, 512, 1024][Math.floor(Math.random() * 4)],
            timeout: [30, 60, 120, 300][Math.floor(Math.random() * 4)],
          },
          relationships: [],
          internet_exposed: funcName.includes('api-handler'),
        };
      });
    },

    eks: () => {
      if (Math.random() > 0.5) return [];
      const env = envs[Math.floor(Math.random() * envs.length)];
      return [{
        resource_id: `${env}-cluster`,
        resource_arn: `arn:aws:eks:${region}:${accountId}:cluster/${env}-cluster`,
        resource_type: 'eks_cluster',
        resource_name: `${env}-cluster`,
        service: 'eks' as AWSService,
        provider: 'aws' as const,
        account_id: accountId,
        region,
        tags: { Name: `${env}-cluster`, Environment: env },
        configuration: { kubernetes_version: '1.28', endpoint_access: 'public_and_private' },
        relationships: [],
        internet_exposed: true,
      }];
    },

    dynamodb: () => {
      const count = Math.floor(Math.random() * 3) + 1;
      return Array.from({ length: count }, (_, i) => {
        const tableName = ['sessions', 'events', 'cache'][i % 3];
        return {
          resource_id: tableName,
          resource_arn: `arn:aws:dynamodb:${region}:${accountId}:table/${tableName}`,
          resource_type: 'dynamodb_table',
          resource_name: tableName,
          service: 'dynamodb' as AWSService,
          provider: 'aws' as const,
          account_id: accountId,
          region,
          tags: { Name: tableName },
          configuration: { billing_mode: 'PAY_PER_REQUEST', encryption: 'DEFAULT' },
          relationships: [],
          internet_exposed: false,
        };
      });
    },

    kms: () => {
      return ['app-key', 'data-key', 'rds-key'].map(name => ({
        resource_id: `key-${Math.random().toString(36).substring(2, 10)}`,
        resource_arn: `arn:aws:kms:${region}:${accountId}:key/${name}`,
        resource_type: 'kms_key',
        resource_name: name,
        service: 'kms' as AWSService,
        provider: 'aws' as const,
        account_id: accountId,
        region,
        tags: { Name: name, Purpose: 'encryption' },
        configuration: { key_state: 'Enabled', key_usage: 'ENCRYPT_DECRYPT' },
        relationships: [],
        internet_exposed: false,
      }));
    },

    ebs: () => {
      const count = Math.floor(Math.random() * 5) + 2;
      return Array.from({ length: count }, (_, i) => {
        const volId = `vol-${Math.random().toString(36).substring(2, 12)}`;
        return {
          resource_id: volId,
          resource_arn: `arn:aws:ec2:${region}:${accountId}:volume/${volId}`,
          resource_type: 'ebs_volume',
          resource_name: `volume-${i + 1}`,
          service: 'ebs' as AWSService,
          provider: 'aws' as const,
          account_id: accountId,
          region,
          tags: { Name: `volume-${i + 1}` },
          configuration: {
            volume_type: ['gp3', 'gp2', 'io1'][Math.floor(Math.random() * 3)],
            size_gb: [20, 50, 100, 500][Math.floor(Math.random() * 4)],
            encrypted: Math.random() > 0.3,
            state: 'in-use',
          },
          relationships: [],
          internet_exposed: false,
        };
      });
    },

    elb: () => {
      if (Math.random() > 0.6) return [];
      return ['app-lb', 'api-lb'].map(name => ({
        resource_id: `arn:aws:elasticloadbalancing:${region}:${accountId}:loadbalancer/app/${name}/abc123`,
        resource_arn: `arn:aws:elasticloadbalancing:${region}:${accountId}:loadbalancer/app/${name}/abc123`,
        resource_type: 'load_balancer',
        resource_name: name,
        service: 'elb' as AWSService,
        provider: 'aws' as const,
        account_id: accountId,
        region,
        tags: { Name: name },
        configuration: { type: 'application', scheme: 'internet-facing', state: 'active' },
        relationships: [],
        internet_exposed: true,
      }));
    },
  };

  const generator = generators[service];
  if (generator && (region !== 'global' || service === 'iam')) {
    return generator();
  }
  return [];
}

/**
 * Extract environment from tags
 */
export function extractEnvironment(tags: Record<string, string>): string | null {
  const envTags = ['Environment', 'environment', 'Env', 'env', 'ENVIRONMENT', 'Stage', 'stage'];
  for (const key of envTags) {
    if (tags[key]) {
      const val = tags[key].toLowerCase();
      if (val.includes('prod')) return 'production';
      if (val.includes('stag')) return 'staging';
      if (val.includes('dev')) return 'development';
      if (val.includes('test')) return 'testing';
      if (val.includes('sandbox')) return 'sandbox';
      return val;
    }
  }
  return null;
}

/**
 * Extract team/owner from tags
 */
export function extractTeam(tags: Record<string, string>): string | null {
  const teamTags = ['Team', 'team', 'Owner', 'owner', 'CostCenter', 'Department'];
  for (const key of teamTags) {
    if (tags[key]) return tags[key];
  }
  return null;
}

/**
 * Extract data classification from tags
 */
export function extractDataClassification(tags: Record<string, string>): string | null {
  const classTags = ['DataClassification', 'data_classification', 'Classification', 'Sensitivity', 'PII', 'PCI'];
  for (const key of classTags) {
    if (tags[key]) {
      const val = tags[key].toLowerCase();
      if (val.includes('restrict') || val.includes('pci') || val.includes('pii')) return 'restricted';
      if (val.includes('confidential') || val.includes('secret')) return 'confidential';
      if (val.includes('internal') || val.includes('private')) return 'internal';
      if (val.includes('public')) return 'public';
      return val;
    }
  }
  return null;
}

/**
 * Determine criticality based on service type, environment, and exposure
 */
export function determineCriticality(
  asset: DiscoveredAsset
): 'critical' | 'high' | 'medium' | 'low' {
  const env = extractEnvironment(asset.tags);
  const isProduction = env === 'production';
  const isExposed = asset.internet_exposed;

  // Critical: production + internet-exposed databases or clusters
  if (isProduction && isExposed && ['rds_instance', 'eks_cluster', 'dynamodb_table'].includes(asset.resource_type)) {
    return 'critical';
  }

  // High: production resources or internet-exposed resources
  if (isProduction || (isExposed && ['ec2_instance', 'load_balancer', 's3_bucket'].includes(asset.resource_type))) {
    return 'high';
  }

  // Medium: staging or resources with data
  if (env === 'staging' || ['rds_instance', 'dynamodb_table', 's3_bucket', 'kms_key'].includes(asset.resource_type)) {
    return 'medium';
  }

  return 'low';
}
