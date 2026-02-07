const Asset = require('../models/Asset');
const ClassificationRule = require('../models/ClassificationRule');

class ClassificationEngine {
  /**
   * Load active classification rules sorted by priority
   */
  async loadRules() {
    try {
      const rules = await ClassificationRule.find({
        isActive: true,
      })
        .sort({ priority: 1 })
        .exec();

      return rules;
    } catch (error) {
      console.error('Error loading classification rules:', error);
      return [];
    }
  }

  /**
   * Evaluate if a rule matches an asset
   */
  evaluateRule(rule, asset) {
    try {
      const conditions = rule.conditions;

      if (!conditions) return false;

      // Check rule type and evaluate accordingly
      switch (rule.ruleType) {
        case 'tag_match':
          return this.evaluateTagMatch(conditions, asset);

        case 'service_match':
          return this.evaluateServiceMatch(conditions, asset);

        case 'exposure_check':
          return this.evaluateExposureCheck(conditions, asset);

        case 'naming_pattern':
          return this.evaluateNamingPattern(conditions, asset);

        case 'composite':
          return this.evaluateComposite(conditions, asset);

        default:
          return false;
      }
    } catch (error) {
      console.error(`Error evaluating rule: ${error.message}`);
      return false;
    }
  }

  /**
   * Evaluate tag match rule
   */
  evaluateTagMatch(conditions, asset) {
    const { tagKey, tagValue, tagExists, operator } = conditions;

    if (!asset.tags) return false;

    // Check if tag key exists
    if (tagExists) {
      return asset.tags.has(tagKey);
    }

    // Check tag key and value
    if (tagKey) {
      const assetTagValue = asset.tags.get(tagKey);

      if (!assetTagValue) return false;

      // If tagValue specified, do exact or partial match
      if (tagValue) {
        return assetTagValue.toLowerCase().includes(tagValue.toLowerCase());
      }

      return true;
    }

    return false;
  }

  /**
   * Evaluate service match rule
   */
  evaluateServiceMatch(conditions, asset) {
    const { service, resourceType, operator } = conditions;
    const subConditions = conditions.subConditions || [];

    let matches = true;

    if (service && asset.service !== service) {
      matches = false;
    }

    if (resourceType && asset.resourceType !== resourceType) {
      matches = false;
    }

    // Evaluate sub-conditions if provided
    if (matches && subConditions.length > 0) {
      if (operator === 'OR') {
        matches = subConditions.some((subCond) => this.evaluateCondition(subCond, asset));
      } else {
        matches = subConditions.every((subCond) => this.evaluateCondition(subCond, asset));
      }
    }

    return matches;
  }

  /**
   * Evaluate exposure check rule
   */
  evaluateExposureCheck(conditions, asset) {
    return asset.isInternetExposed === true;
  }

  /**
   * Evaluate naming pattern rule
   */
  evaluateNamingPattern(conditions, asset) {
    const { namePattern } = conditions;

    if (!namePattern || !asset.name) return false;

    try {
      const regex = new RegExp(namePattern, 'i');
      return regex.test(asset.name);
    } catch (error) {
      console.error(`Invalid regex pattern: ${namePattern}`);
      return false;
    }
  }

  /**
   * Evaluate composite rule (combination of conditions)
   */
  evaluateComposite(conditions, asset) {
    const { operator, subConditions } = conditions;

    if (!subConditions || subConditions.length === 0) return false;

    if (operator === 'OR') {
      return subConditions.some((subCond) => this.evaluateCondition(subCond, asset));
    } else {
      return subConditions.every((subCond) => this.evaluateCondition(subCond, asset));
    }
  }

  /**
   * Generic condition evaluator (helper)
   */
  evaluateCondition(condition, asset) {
    if (condition.ruleType === 'tag_match') {
      return this.evaluateTagMatch(condition, asset);
    } else if (condition.ruleType === 'service_match') {
      return this.evaluateServiceMatch(condition, asset);
    } else if (condition.ruleType === 'exposure_check') {
      return this.evaluateExposureCheck(condition, asset);
    } else if (condition.ruleType === 'naming_pattern') {
      return this.evaluateNamingPattern(condition, asset);
    }
    return false;
  }

  /**
   * Apply all active rules to asset and return classification
   */
  async applyRules(asset) {
    try {
      const rules = await this.loadRules();

      // Create a classification object with defaults
      const classification = {
        environment: asset.environment || 'unknown',
        owner: asset.owner,
        department: asset.department,
        dataClassification: asset.dataClassification || 'unclassified',
        criticality: asset.criticality || 'unclassified',
      };

      // Apply rules in priority order
      for (const rule of rules) {
        // Check if rule matches asset
        if (this.evaluateRule(rule, asset)) {
          // Apply rule actions
          if (rule.actions.setEnvironment) {
            classification.environment = rule.actions.setEnvironment;
          }

          if (rule.actions.setOwner) {
            classification.owner = rule.actions.setOwner;
          }

          if (rule.actions.setDepartment) {
            classification.department = rule.actions.setDepartment;
          }

          if (rule.actions.setDataClassification) {
            classification.dataClassification = rule.actions.setDataClassification;
          }

          if (rule.actions.setCriticality) {
            classification.criticality = rule.actions.setCriticality;
          }

          // For highest priority rules, we might want to stop after first match
          // Or continue to accumulate classifications
          // Current behavior: continue to allow multiple rules to contribute
        }
      }

      return classification;
    } catch (error) {
      console.error(`Error applying rules: ${error.message}`);
      return {
        environment: asset.environment || 'unknown',
        owner: asset.owner,
        department: asset.department,
        dataClassification: asset.dataClassification || 'unclassified',
        criticality: asset.criticality || 'unclassified',
      };
    }
  }

  /**
   * Run bulk classification on all assets for an integration
   */
  async runBulkClassification(integrationId) {
    try {
      const assets = await Asset.find({
        integrationRef: integrationId,
      });

      console.log(`Classifying ${assets.length} assets for integration ${integrationId}`);

      let classifiedCount = 0;

      for (const asset of assets) {
        try {
          // Skip if asset has manual overrides
          const hasOverrides = Object.values(asset.classificationOverrides || {}).some(
            (override) => override && override.value
          );

          if (hasOverrides) {
            // Only apply rules for non-overridden fields
            const classification = await this.applyRules(asset);

            if (!asset.classificationOverrides.environment?.value && classification.environment) {
              asset.environment = classification.environment;
            }
            if (!asset.classificationOverrides.owner?.value && classification.owner) {
              asset.owner = classification.owner;
            }
            if (!asset.classificationOverrides.department?.value && classification.department) {
              asset.department = classification.department;
            }
            if (
              !asset.classificationOverrides.dataClassification?.value &&
              classification.dataClassification
            ) {
              asset.dataClassification = classification.dataClassification;
            }
            if (!asset.classificationOverrides.criticality?.value && classification.criticality) {
              asset.criticality = classification.criticality;
            }
          } else {
            // Apply all rules
            const classification = await this.applyRules(asset);
            asset.environment = classification.environment;
            asset.owner = classification.owner;
            asset.department = classification.department;
            asset.dataClassification = classification.dataClassification;
            asset.criticality = classification.criticality;
          }

          await asset.save();
          classifiedCount++;
        } catch (err) {
          console.error(`Error classifying asset ${asset._id}: ${err.message}`);
        }
      }

      console.log(`Successfully classified ${classifiedCount} assets`);
      return { success: true, classifiedCount };
    } catch (error) {
      console.error(`Error running bulk classification: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create default classification rules
   */
  async createDefaultRules(userId) {
    try {
      // Check if defaults already exist
      const existingCount = await ClassificationRule.countDocuments();
      if (existingCount > 0) {
        console.log('Default rules already exist');
        return { created: 0, message: 'Default rules already exist' };
      }

      const defaultRules = [
        {
          name: 'Environment: Production',
          description: 'Classify resources with Environment=production tag',
          isActive: true,
          priority: 10,
          ruleType: 'tag_match',
          conditions: {
            tagKey: 'Environment',
            tagValue: 'production',
          },
          actions: {
            setEnvironment: 'production',
            setCriticality: 'high',
          },
          createdBy: userId,
        },
        {
          name: 'Environment: Staging',
          description: 'Classify resources with Environment=staging tag',
          isActive: true,
          priority: 20,
          ruleType: 'tag_match',
          conditions: {
            tagKey: 'Environment',
            tagValue: 'staging',
          },
          actions: {
            setEnvironment: 'staging',
            setCriticality: 'medium',
          },
          createdBy: userId,
        },
        {
          name: 'Environment: Development',
          description: 'Classify resources with Environment=dev tag',
          isActive: true,
          priority: 30,
          ruleType: 'tag_match',
          conditions: {
            tagKey: 'Environment',
            tagValue: 'dev',
          },
          actions: {
            setEnvironment: 'development',
            setCriticality: 'low',
          },
          createdBy: userId,
        },
        {
          name: 'Database Services - High Criticality',
          description: 'RDS and DynamoDB resources are high criticality',
          isActive: true,
          priority: 15,
          ruleType: 'service_match',
          conditions: {
            service: 'RDS',
            operator: 'OR',
            subConditions: [
              { service: 'RDS' },
              { service: 'DynamoDB' },
            ],
          },
          actions: {
            setCriticality: 'high',
            setDataClassification: 'confidential',
          },
          createdBy: userId,
        },
        {
          name: 'IAM Resources - Critical',
          description: 'IAM users, roles, and policies are critical',
          isActive: true,
          priority: 5,
          ruleType: 'service_match',
          conditions: {
            service: 'IAM',
          },
          actions: {
            setCriticality: 'critical',
            setDataClassification: 'restricted',
          },
          createdBy: userId,
        },
        {
          name: 'Internet Exposed Resources',
          description: 'Resources with internet exposure are high risk',
          isActive: true,
          priority: 25,
          ruleType: 'exposure_check',
          conditions: {},
          actions: {
            setDataClassification: 'internal',
            setCriticality: 'high',
          },
          createdBy: userId,
        },
        {
          name: 'Owner Tag Assignment',
          description: 'Extract owner from Owner tag',
          isActive: true,
          priority: 100,
          ruleType: 'tag_match',
          conditions: {
            tagKey: 'Owner',
            tagExists: true,
          },
          actions: {
            setOwner: 'from-tag',
          },
          createdBy: userId,
        },
        {
          name: 'Data Classification Tag',
          description: 'Extract data classification from DataClassification tag',
          isActive: true,
          priority: 105,
          ruleType: 'tag_match',
          conditions: {
            tagKey: 'DataClassification',
            tagExists: true,
          },
          actions: {
            setDataClassification: 'from-tag',
          },
          createdBy: userId,
        },
        {
          name: 'Sensitive Naming Pattern',
          description: 'Resources with "secret", "token", or "password" in name are confidential',
          isActive: true,
          priority: 12,
          ruleType: 'naming_pattern',
          conditions: {
            namePattern: '(secret|token|password|credential)',
          },
          actions: {
            setDataClassification: 'confidential',
            setCriticality: 'high',
          },
          createdBy: userId,
        },
        {
          name: 'Backup Resources - Medium Criticality',
          description: 'Snapshots and backups are medium criticality',
          isActive: true,
          priority: 35,
          ruleType: 'service_match',
          conditions: {
            resourceType: 'snapshot',
          },
          actions: {
            setCriticality: 'medium',
          },
          createdBy: userId,
        },
      ];

      const created = await ClassificationRule.insertMany(defaultRules);
      console.log(`Created ${created.length} default classification rules`);
      return { created: created.length, rules: created };
    } catch (error) {
      console.error(`Error creating default rules: ${error.message}`);
      return { created: 0, error: error.message };
    }
  }

  /**
   * Get classification statistics for an integration
   */
  async getClassificationStats(integrationId) {
    try {
      const stats = {
        total: 0,
        byEnvironment: {},
        byDataClassification: {},
        byCriticality: {},
        internetExposed: 0,
        unclassified: 0,
      };

      const assets = await Asset.find({
        integrationRef: integrationId,
      });

      stats.total = assets.length;

      for (const asset of assets) {
        // Count by environment
        if (asset.environment && asset.environment !== 'unknown') {
          stats.byEnvironment[asset.environment] =
            (stats.byEnvironment[asset.environment] || 0) + 1;
        }

        // Count by data classification
        if (asset.dataClassification && asset.dataClassification !== 'unclassified') {
          stats.byDataClassification[asset.dataClassification] =
            (stats.byDataClassification[asset.dataClassification] || 0) + 1;
        }

        // Count by criticality
        if (asset.criticality && asset.criticality !== 'unclassified') {
          stats.byCriticality[asset.criticality] =
            (stats.byCriticality[asset.criticality] || 0) + 1;
        }

        // Count internet exposed
        if (asset.isInternetExposed) {
          stats.internetExposed++;
        }

        // Count unclassified
        if (asset.dataClassification === 'unclassified' && asset.criticality === 'unclassified') {
          stats.unclassified++;
        }
      }

      return stats;
    } catch (error) {
      console.error(`Error getting classification stats: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * Update a rule
   */
  async updateRule(ruleId, updates, userId) {
    try {
      const rule = await ClassificationRule.findByIdAndUpdate(
        ruleId,
        {
          ...updates,
          updatedBy: userId,
        },
        { new: true }
      );

      if (!rule) {
        return { success: false, error: 'Rule not found' };
      }

      return { success: true, rule };
    } catch (error) {
      console.error(`Error updating rule: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a rule
   */
  async deleteRule(ruleId) {
    try {
      const rule = await ClassificationRule.findByIdAndDelete(ruleId);

      if (!rule) {
        return { success: false, error: 'Rule not found' };
      }

      return { success: true, message: 'Rule deleted' };
    } catch (error) {
      console.error(`Error deleting rule: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all rules with optional filtering
   */
  async getRules(filter = {}) {
    try {
      const query = ClassificationRule.find(filter).sort({ priority: 1 });

      const rules = await query.exec();
      return { success: true, rules };
    } catch (error) {
      console.error(`Error fetching rules: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ClassificationEngine();
