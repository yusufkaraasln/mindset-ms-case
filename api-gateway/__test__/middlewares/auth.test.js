import { expect } from 'chai';
import sinon from 'sinon';
import { jwtErrorHandler, authorize } from '../../src/middlewares/auth.js';
import { HTTP_STATUS } from '../../src/utils/constants.js';
import { logger } from '../../src/utils/logger.js';

describe('Auth Middleware', () => {
  describe('jwtErrorHandler', () => {
    let req, res, next;

    beforeEach(() => {
      req = { id: 'test-id', headers: { authorization: 'Bearer token' } };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      next = sinon.stub();
    });

    it('should handle UnauthorizedError and return 401', () => {
      const err = new Error('Invalid token');
      err.name = 'UnauthorizedError';
      jwtErrorHandler(err, req, res, next);
      expect(res.status.calledWith(HTTP_STATUS.UNAUTHORIZED)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response).to.have.property('message', 'Authentication required');
      expect(response).to.have.property('details', err.message);
      expect(response).to.have.property('requestId', req.id);
      expect(next.called).to.be.false;
    });

    it('should call next for non-UnauthorizedError errors', () => {
      const err = new Error('Some other error');
      err.name = 'OtherError';
      jwtErrorHandler(err, req, res, next);
      expect(next.calledOnce).to.be.true;
    });
  });

  describe('authorize', () => {
    let req, res, next, middleware;

    beforeEach(() => {
      req = { id: 'test-id' };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      next = sinon.stub();
    });

    it('should return 403 if req.auth is not provided', () => {
      middleware = authorize(['ADMIN']);
      middleware(req, res, next);
      expect(res.status.calledWith(HTTP_STATUS.FORBIDDEN)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response).to.have.property('error', 'Forbidden');
    });

    it('should return 403 if req.auth.roles does not include any required roles', () => {
      req.auth = { roles: ['USER'] };
      middleware = authorize(['ADMIN']);
      middleware(req, res, next);
      expect(res.status.calledWith(HTTP_STATUS.FORBIDDEN)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response).to.have.property('error', 'Forbidden');
    });

    it('should call next if req.auth.roles includes one of the allowed roles', () => {
      req.auth = { roles: ['ADMIN', 'USER'] };
      middleware = authorize(['ADMIN']);
      middleware(req, res, next);
      expect(next.calledOnce).to.be.true;
    });
  });
}); 