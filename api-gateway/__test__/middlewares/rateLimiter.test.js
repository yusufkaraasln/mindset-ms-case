import { expect } from 'chai';
import sinon from 'sinon';
import { configureRateLimiter } from '../../src/middlewares/rateLimiter.js';

describe('Rate Limiter Middleware', () => {
  it('should register the rate limiter middleware on the app', () => {
    const app = {
      use: sinon.spy()
    };

    configureRateLimiter(app);
    // We expect app.use to be called at least one time with the rate limiter function.
    expect(app.use.called).to.be.true;
  });
});