import { expect } from 'chai';
import sinon from 'sinon';
import { errorHandler } from '../../src/middlewares/errorHandler.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../src/utils/constants.js';
import { logger } from '../../src/utils/logger.js';

describe('Global Error Handler', () => {
  let req, res, next;

  beforeEach(() => {
    req = { id: 'error-test-id' };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    next = sinon.stub();
  });

  it('should log error and respond with internal server error', () => {
    const err = new Error('Test error');
    const loggerSpy = sinon.spy(logger, 'error');

    errorHandler(err, req, res, next);

    expect(loggerSpy.calledWithMatch(`Error: ${err.message}`)).to.be.true;
    expect(res.status.calledWith(HTTP_STATUS.INTERNAL_SERVER)).to.be.true;
    const response = res.json.getCall(0).args[0];
    expect(response).to.have.property('error', ERROR_MESSAGES.INTERNAL_SERVER);
    expect(response).to.have.property('requestId', req.id);

    loggerSpy.restore();
  });
}); 