
export const services = [
  {
    path: 'auth',
    target: 'http://localhost:4001',
  },
  {
    path: 'customers',
    target: 'http://localhost:4002',
  },
  {
    path: 'sales',
    target: 'http://localhost:4003',
  },
  {
    path: 'health-check',
    target: 'http://localhost:8081',
  }
]; 