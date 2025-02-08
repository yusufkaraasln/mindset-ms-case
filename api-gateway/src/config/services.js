/**
 * @type {import('../types').ServiceConfig[]}
 */
export const services = [
  
  {
    path: 'health-check',
    target: 'http://localhost:8081',
    auth: false
  }
]; 