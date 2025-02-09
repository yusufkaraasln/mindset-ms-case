
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
    path: 'health-check',
    target: 'http://localhost:8081',
  }
]; 