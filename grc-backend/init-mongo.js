// MongoDB initialization script
// Creates database user and initializes collections

db = db.getSiblingDB('grc-platform');

// Create application user if it doesn't exist
db.createUser({
  user: 'grc-app',
  pwd: process.env.MONGO_APP_PASSWORD || 'app-password-change-me',
  roles: [
    {
      role: 'readWrite',
      db: 'grc-platform'
    }
  ]
});

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'firstName', 'lastName', 'role'],
      properties: {
        _id: { bsonType: 'objectId' },
        email: { bsonType: 'string' },
        password: { bsonType: 'string' },
        firstName: { bsonType: 'string' },
        lastName: { bsonType: 'string' },
        role: { enum: ['admin', 'auditor', 'manager', 'user'] },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('assessments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'status', 'framework'],
      properties: {
        _id: { bsonType: 'objectId' },
        name: { bsonType: 'string' },
        status: { enum: ['draft', 'in-progress', 'completed', 'archived'] },
        framework: { bsonType: 'string' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('controls', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['controlId', 'name', 'framework'],
      properties: {
        _id: { bsonType: 'objectId' },
        controlId: { bsonType: 'string' },
        name: { bsonType: 'string' },
        framework: { bsonType: 'string' },
        description: { bsonType: 'string' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

db.assessments.createIndex({ status: 1 });
db.assessments.createIndex({ framework: 1 });
db.assessments.createIndex({ createdAt: 1 });

db.controls.createIndex({ controlId: 1 }, { unique: true });
db.controls.createIndex({ framework: 1 });
db.controls.createIndex({ createdAt: 1 });

print('MongoDB initialization completed successfully');
