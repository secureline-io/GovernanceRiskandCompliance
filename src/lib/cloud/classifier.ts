/**
 * Cloud Asset Classification Engine
 * 
 * Applies tag-driven rules and heuristics to classify assets.
 * Supports automatic classification + manual overrides.
 */

import { DiscoveredAsset, extractEnvironment, extractTeam, extractDataClassification, determineCriticality } from './aws-discovery';

export interface ClassificationResult {
  environment: string | null;
  team: string | null;
  data_classification: string | null;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  internet_exposed: boolean;
}

export interface ClassificationRule {
  id: string;
  name: string;
  rule_type: 'tag_match' | 'service_type' | 'exposure' | 'custom';
  conditions: {
    tag_key?: string;
    tag_value?: string;
    service?: string;
    resource_type?: string;
    internet_exposed?: boolean;
    region?: string;
  };
  actions: {
    set_environment?: string;
    set_criticality?: 'critical' | 'high' | 'medium' | 'low';
    set_data_classification?: string;
    set_team?: string;
  };
  priority: number;
  is_enabled: boolean;
}

// Default classification rules
export const DEFAULT_RULES: Omit<ClassificationRule, 'id'>[] = [
  // Tag-based environment detection
  {
    name: 'Production environment from tags',
    rule_type: 'tag_match',
    conditions: { tag_key: 'Environment', tag_value: 'production' },
    actions: { set_environment: 'production', set_criticality: 'high' },
    priority: 10,
    is_enabled: true,
  },
  {
    name: 'Staging environment from tags',
    rule_type: 'tag_match',
    conditions: { tag_key: 'Environment', tag_value: 'staging' },
    actions: { set_environment: 'staging', set_criticality: 'medium' },
    priority: 10,
    is_enabled: true,
  },
  {
    name: 'Development environment from tags',
    rule_type: 'tag_match',
    conditions: { tag_key: 'Environment', tag_value: 'development' },
    actions: { set_environment: 'development', set_criticality: 'low' },
    priority: 10,
    is_enabled: true,
  },
  // Service-type criticality
  {
    name: 'Databases are high criticality',
    rule_type: 'service_type',
    conditions: { service: 'rds' },
    actions: { set_criticality: 'high', set_data_classification: 'confidential' },
    priority: 20,
    is_enabled: true,
  },
  {
    name: 'KMS keys are critical',
    rule_type: 'service_type',
    conditions: { service: 'kms' },
    actions: { set_criticality: 'critical', set_data_classification: 'restricted' },
    priority: 20,
    is_enabled: true,
  },
  // Exposure-based rules
  {
    name: 'Internet-exposed resources are high priority',
    rule_type: 'exposure',
    conditions: { internet_exposed: true },
    actions: { set_criticality: 'high' },
    priority: 30,
    is_enabled: true,
  },
  // PII/PCI tag detection
  {
    name: 'PII data classification',
    rule_type: 'tag_match',
    conditions: { tag_key: 'DataClassification', tag_value: 'pii' },
    actions: { set_data_classification: 'restricted', set_criticality: 'critical' },
    priority: 5,
    is_enabled: true,
  },
];

/**
 * Classify a discovered asset using rules + tag extraction
 */
export function classifyAsset(
  asset: DiscoveredAsset,
  customRules?: ClassificationRule[]
): ClassificationResult {
  // Start with tag-based extraction
  let result: ClassificationResult = {
    environment: extractEnvironment(asset.tags),
    team: extractTeam(asset.tags),
    data_classification: extractDataClassification(asset.tags),
    criticality: determineCriticality(asset),
    internet_exposed: asset.internet_exposed,
  };

  // Apply custom rules (sorted by priority, lower = higher priority)
  if (customRules && customRules.length > 0) {
    const sorted = [...customRules].filter(r => r.is_enabled).sort((a, b) => a.priority - b.priority);
    
    for (const rule of sorted) {
      if (matchesRule(asset, rule)) {
        result = applyRuleActions(result, rule);
      }
    }
  }

  return result;
}

/**
 * Check if an asset matches a rule's conditions
 */
function matchesRule(asset: DiscoveredAsset, rule: ClassificationRule): boolean {
  const { conditions } = rule;

  switch (rule.rule_type) {
    case 'tag_match': {
      if (!conditions.tag_key) return false;
      const tagValue = asset.tags[conditions.tag_key];
      if (!tagValue) return false;
      if (conditions.tag_value) {
        return tagValue.toLowerCase().includes(conditions.tag_value.toLowerCase());
      }
      return true;
    }

    case 'service_type': {
      if (conditions.service && asset.service !== conditions.service) return false;
      if (conditions.resource_type && asset.resource_type !== conditions.resource_type) return false;
      return true;
    }

    case 'exposure': {
      if (conditions.internet_exposed !== undefined) {
        return asset.internet_exposed === conditions.internet_exposed;
      }
      return true;
    }

    case 'custom': {
      // Check all conditions
      if (conditions.service && asset.service !== conditions.service) return false;
      if (conditions.resource_type && asset.resource_type !== conditions.resource_type) return false;
      if (conditions.region && asset.region !== conditions.region) return false;
      if (conditions.internet_exposed !== undefined && asset.internet_exposed !== conditions.internet_exposed) return false;
      if (conditions.tag_key) {
        const val = asset.tags[conditions.tag_key];
        if (!val) return false;
        if (conditions.tag_value && !val.toLowerCase().includes(conditions.tag_value.toLowerCase())) return false;
      }
      return true;
    }

    default:
      return false;
  }
}

/**
 * Apply rule actions to classification result
 */
function applyRuleActions(result: ClassificationResult, rule: ClassificationRule): ClassificationResult {
  const updated = { ...result };
  const { actions } = rule;

  if (actions.set_environment) updated.environment = actions.set_environment;
  if (actions.set_criticality) updated.criticality = actions.set_criticality;
  if (actions.set_data_classification) updated.data_classification = actions.set_data_classification;
  if (actions.set_team) updated.team = actions.set_team;

  return updated;
}

/**
 * Get service display info
 */
export const SERVICE_DISPLAY: Record<string, { label: string; category: string; icon: string }> = {
  ec2: { label: 'EC2', category: 'Compute', icon: '🖥️' },
  s3: { label: 'S3', category: 'Storage', icon: '🪣' },
  rds: { label: 'RDS', category: 'Database', icon: '🗄️' },
  vpc: { label: 'VPC', category: 'Network', icon: '🌐' },
  iam: { label: 'IAM', category: 'Identity', icon: '🔑' },
  lambda: { label: 'Lambda', category: 'Serverless', icon: '⚡' },
  eks: { label: 'EKS', category: 'Container', icon: '📦' },
  ecs: { label: 'ECS', category: 'Container', icon: '📦' },
  dynamodb: { label: 'DynamoDB', category: 'Database', icon: '🗄️' },
  kms: { label: 'KMS', category: 'Security', icon: '🔐' },
  secretsmanager: { label: 'Secrets Manager', category: 'Security', icon: '🔒' },
  ebs: { label: 'EBS', category: 'Storage', icon: '💾' },
  elb: { label: 'ELB/ALB', category: 'Network', icon: '⚖️' },
  cloudfront: { label: 'CloudFront', category: 'CDN', icon: '🌍' },
  route53: { label: 'Route 53', category: 'DNS', icon: '🗺️' },
  cloudtrail: { label: 'CloudTrail', category: 'Logging', icon: '📋' },
  guardduty: { label: 'GuardDuty', category: 'Security', icon: '🛡️' },
  securityhub: { label: 'Security Hub', category: 'Security', icon: '🛡️' },
  config: { label: 'Config', category: 'Monitoring', icon: '⚙️' },
  autoscaling: { label: 'Auto Scaling', category: 'Compute', icon: '📈' },
  sns: { label: 'SNS', category: 'Messaging', icon: '📨' },
  sqs: { label: 'SQS', category: 'Messaging', icon: '📬' },
};

/**
 * Get resource type display name
 */
export function getResourceTypeLabel(resourceType: string): string {
  const labels: Record<string, string> = {
    ec2_instance: 'EC2 Instance',
    s3_bucket: 'S3 Bucket',
    rds_instance: 'RDS Instance',
    vpc: 'VPC',
    iam_role: 'IAM Role',
    lambda_function: 'Lambda Function',
    eks_cluster: 'EKS Cluster',
    dynamodb_table: 'DynamoDB Table',
    kms_key: 'KMS Key',
    ebs_volume: 'EBS Volume',
    load_balancer: 'Load Balancer',
    security_group: 'Security Group',
    subnet: 'Subnet',
  };
  return labels[resourceType] || resourceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
