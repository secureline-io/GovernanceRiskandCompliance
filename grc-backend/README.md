# GRC Platform Backend

A production-grade Express.js backend for a Governance, Risk, and Compliance (GRC) automation platform.

## Project Structure

```
grc-backend/
├── config/                    # Configuration files
│   ├── db.js                 # MongoDB connection setup with retry logic
│   └── constants.js          # Application enums and constants
├── middleware/               # Express middleware
│   └── errorHandler.js       # Global error handling and async wrapper
├── routes/                   # API route handlers
│   ├── auth.js              # Authentication endpoints
│   ├── dashboard.js         # Dashboard overview endpoints
│   ├── controls.js          # Control management endpoints
│   ├── frameworks.js        # Framework management endpoints
│   ├── policies.js          # Policy management endpoints
│   ├── evidences.js         # Evidence submission endpoints
│   ├── tests.js             # Test execution endpoints
│   ├── risks.js             # Risk assessment endpoints
│   ├── vendors.js           # Vendor management endpoints
│   └── audits.js            # Audit management endpoints
├── utils/                    # Utility functions
│   └── logger.js            # Structured logging
├── controllers/              # Business logic (placeholder)
├── models/                   # Mongoose schemas (placeholder)
├── seeds/                    # Database seeders (placeholder)
├── public/                   # Static files
├── server.js                # Main application entry point
├── package.json             # Dependencies and scripts
├── .env                     # Local environment variables
└── .env.example             # Environment template
```

## Prerequisites

- Node.js 14+ and npm
- MongoDB 4.4+ (local or remote)
- Git

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grc-platform
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Run Database Seeders
```bash
npm run seed
```

### Run Tests
```bash
npm test
```

## Available Endpoints

All endpoints are prefixed with `/api/v1`

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Refresh authentication token
- `GET /auth/me` - Get current user profile

### Dashboard
- `GET /dashboard/overview` - Get dashboard overview
- `GET /dashboard/statistics` - Get platform statistics
- `GET /dashboard/compliance-status` - Get compliance status
- `GET /dashboard/risk-summary` - Get risk summary

### Controls
- `GET /controls` - List all controls
- `GET /controls/:id` - Get control details
- `POST /controls` - Create new control
- `PUT /controls/:id` - Update control
- `DELETE /controls/:id` - Delete control
- `GET /controls/:id/history` - Get control change history

### Frameworks
- `GET /frameworks` - List all frameworks
- `GET /frameworks/:id` - Get framework details
- `POST /frameworks` - Create new framework
- `PUT /frameworks/:id` - Update framework
- `DELETE /frameworks/:id` - Delete framework
- `GET /frameworks/:id/controls` - Get framework controls

### Policies
- `GET /policies` - List all policies
- `GET /policies/:id` - Get policy details
- `POST /policies` - Create new policy
- `PUT /policies/:id` - Update policy
- `DELETE /policies/:id` - Delete policy
- `POST /policies/:id/upload` - Upload policy document

### Evidences
- `GET /evidences` - List all evidence
- `GET /evidences/:id` - Get evidence details
- `POST /evidences` - Create new evidence
- `PUT /evidences/:id` - Update evidence
- `DELETE /evidences/:id` - Delete evidence
- `POST /evidences/:id/upload` - Upload evidence file
- `GET /evidences/:id/download` - Download evidence file

### Tests
- `GET /tests` - List all tests
- `GET /tests/:id` - Get test details
- `POST /tests` - Create new test
- `PUT /tests/:id` - Update test
- `DELETE /tests/:id` - Delete test
- `POST /tests/:id/run` - Run a test
- `GET /tests/:id/results` - Get test results

### Risks
- `GET /risks` - List all risks
- `GET /risks/:id` - Get risk details
- `POST /risks` - Create new risk
- `PUT /risks/:id` - Update risk
- `DELETE /risks/:id` - Delete risk
- `POST /risks/:id/assess` - Assess a risk
- `POST /risks/:id/treat` - Create risk treatment

### Vendors
- `GET /vendors` - List all vendors
- `GET /vendors/:id` - Get vendor details
- `POST /vendors` - Create new vendor
- `PUT /vendors/:id` - Update vendor
- `DELETE /vendors/:id` - Delete vendor
- `POST /vendors/:id/assess` - Conduct vendor assessment
- `GET /vendors/:id/assessment` - Get assessment results

### Audits
- `GET /audits` - List all audits
- `GET /audits/:id` - Get audit details
- `POST /audits` - Create new audit
- `PUT /audits/:id` - Update audit
- `DELETE /audits/:id` - Delete audit
- `POST /audits/:id/start` - Start an audit
- `POST /audits/:id/complete` - Complete an audit
- `GET /audits/:id/report` - Generate audit report

### Health Check
- `GET /health` - Server health status

## Configuration

### Constants
All application enums and constants are defined in `config/constants.js`:

**User Roles:**
- `ADMIN` - Full administrative access
- `MANAGER` - Can manage controls, policies, and submit evidence
- `AUDITOR` - Read-only access to reports and verification
- `VIEWER` - Read-only access

**Control Status:**
- `COMPLIANT` - Control is compliant
- `NON_COMPLIANT` - Control is not compliant
- `NOT_APPLICABLE` - Control is not applicable

**Risk Levels:**
- `LOW` - Low risk
- `MEDIUM` - Medium risk
- `HIGH` - High risk

**Frameworks:**
- `GDPR` - General Data Protection Regulation
- `SOC_2` - Service Organization Control 2
- `ISO_27001` - Information Security Management
- `HIPAA` - Health Insurance Portability and Accountability Act
- `PCI_DSS` - Payment Card Industry Data Security Standard

### Security Features

1. **Helmet** - Sets various HTTP headers for security
2. **CORS** - Cross-Origin Resource Sharing with configurable origins
3. **Rate Limiting** - Prevents abuse with configurable limits
4. **Input Validation** - Express-validator for request validation
5. **Error Handling** - Global error handler with consistent response format
6. **JWT Authentication** - JSON Web Tokens for stateless auth (to be implemented)

### Logging

The application uses structured logging with file output:
- `logs/app.log` - General application logs
- `logs/error.log` - Error logs
- `logs/http.log` - HTTP request logs

Log levels: DEBUG, INFO, WARN, ERROR

### Database Connection

MongoDB connection includes:
- Automatic retry logic (5 attempts with 5-second intervals)
- Connection event listeners
- Pool size configuration (min: 5, max: 10)
- Graceful shutdown handling

## Development

### Environment Variables
Copy `.env.example` to `.env` and update values for local development.

### Adding New Routes

1. Create a new file in `routes/` directory
2. Define route handlers using `asyncHandler` wrapper
3. Import and mount in `server.js`:
```javascript
const newRoutes = require('./routes/new');
app.use(`${apiV1}/new`, newRoutes);
```

### Adding New Constants
Update `config/constants.js` with new enums and constants.

### Error Handling
Use the `AppError` class for custom errors:
```javascript
const { AppError, asyncHandler } = require('../middleware/errorHandler');

router.get('/:id', asyncHandler(async (req, res) => {
  throw new AppError('Not found', 404);
}));
```

## Deployment

### Production Checklist
1. Set `NODE_ENV=production`
2. Update `JWT_SECRET` with a strong random string
3. Configure `MONGODB_URI` to use production database
4. Set `CORS_ORIGIN` to production domain
5. Enable HTTPS/TLS
6. Set up monitoring and alerting
7. Configure automatic backups for MongoDB
8. Use environment-specific error handling

### Docker Deployment
Create a Dockerfile:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t grc-backend .
docker run -p 5000:5000 --env-file .env grc-backend
```

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": {}
}
```

## Testing

Run tests with coverage:
```bash
npm test
```

## Contributing

1. Create a feature branch
2. Make changes with descriptive commits
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - GRC Platform

## Support

For issues or questions, contact the development team.
