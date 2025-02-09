export const services = [
  {
    path: 'auth',
    target: process.env.USER_SERVICE_URL || 'http://localhost:4001',
  },
  {
    path: 'customers',
    target: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:4002',
  },
  {
    path: 'sales',
    target: process.env.SALES_SERVICE_URL || 'http://localhost:4003',
  },
  {
    path: 'health-check',
    target: process.env.HEALTH_CHECK_URL || 'http://localhost:8081',
  }
]; 