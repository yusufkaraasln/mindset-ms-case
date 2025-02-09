import { expect } from 'chai';
import sinon from 'sinon';
import { configureSecurity } from '../../src/middlewares/security.js';

describe('Security Middleware', () => {
  it('should configure security middleware on the app', () => {
    const app = {
      use: sinon.spy(),
      disable: sinon.spy()
    };

    configureSecurity(app);
    // Expect that helmet and cors (at least 2 calls to app.use) are added
    expect(app.use.callCount).to.be.at.least(2);
    expect(app.disable.calledWith('x-powered-by')).to.be.true;
  });
}); 