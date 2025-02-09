/**
 * @type {import('../types').ServiceConfig[]}
 */
export const services = [
  {
    path: 'auth',
    target: 'http://localhost:4001',
    auth: false
  },
  {
    path: 'health-check',
    target: 'http://localhost:8081',
    auth: false
  }
]; 