import { expect } from 'chai';
import sinon from 'sinon';
import { configureRoutes } from '../../src/routes/index.js';
import { services } from '../../src/config/services.js';

describe('Routes Configuration', () => {
  it('should register proxy routes for all configured services', () => {
    const app = {
      use: sinon.spy()
    };

    configureRoutes(app);

    // Verify that for each configured service, an app.use call was made with the correct route prefix.
    services.forEach((service) => {
      const expectedPath = `/api/${service.path}`;
      const callFound = app.use.getCalls().some(call => call.args[0] === expectedPath);
      expect(callFound, `Route ${expectedPath} not registered`).to.be.true;
    });

    // We expect exactly one app.use call per service.
    expect(app.use.callCount).to.equal(services.length);
  });
}); 