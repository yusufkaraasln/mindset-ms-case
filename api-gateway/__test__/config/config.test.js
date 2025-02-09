import { expect } from 'chai';
import { config } from '../../src/config/index.js';
import { services } from '../../src/config/services.js';

describe('Configuration', () => {
  it('should have proper configuration values', () => {
    expect(config).to.have.property('env');
    expect(config).to.have.property('port');
    expect(config).to.have.property('services').that.deep.equals(services);
    expect(config).to.have.property('rateLimit').that.is.an('object');
    expect(config).to.have.property('cors').that.is.an('object');
  });
}); 