import { expect } from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import { authorizeRoles } from '../../src/middleware/authorize.js';
import { HTTP_STATUS } from '../../src/utils/constants.js';

describe('Authorize Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call next if req.user already exists', () => {
    req.user = { roles: ['ADMIN'] };
    const middleware = authorizeRoles(['ADMIN']);
    middleware(req, res, next);
    expect(next.calledOnce).to.be.true;
  });

  it('should return unauthorized if no authorization header is provided', () => {
    const middleware = authorizeRoles(['ADMIN']);
    middleware(req, res, next);
    expect(res.status.calledWith(HTTP_STATUS.UNAUTHORIZED)).to.be.true;
    const response = res.json.getCall(0).args[0];
    expect(response.message).to.include('Authorization header missing');
  });

  it('should return unauthorized if token is invalid', () => {
    req.headers.authorization = 'Bearer invalidToken';
    const middleware = authorizeRoles(['ADMIN']);
    sinon.stub(jwt, 'verify').throws(new Error('Invalid token'));
    middleware(req, res, next);
    expect(res.status.calledWith(HTTP_STATUS.UNAUTHORIZED)).to.be.true;
    const response = res.json.getCall(0).args[0];
    expect(response.message).to.include('Invalid or expired token');
  });

  it('should return forbidden if user does not have allowed roles', () => {
    req.headers.authorization = 'Bearer validToken';
    // Simulate a decoded token with insufficient roles.
    sinon.stub(jwt, 'verify').returns({ roles: ['USER'] });
    const middleware = authorizeRoles(['ADMIN']);
    middleware(req, res, next);
    expect(res.status.calledWith(HTTP_STATUS.FORBIDDEN)).to.be.true;
    const response = res.json.getCall(0).args[0];
    expect(response.message).to.include('Access denied');
  });

  it('should call next if token is valid and user has allowed roles', () => {
    req.headers.authorization = 'Bearer validToken';
    const decodedUser = { roles: ['ADMIN'] };
    sinon.stub(jwt, 'verify').returns(decodedUser);
    const middleware = authorizeRoles(['ADMIN']);
    middleware(req, res, next);
    expect(req.user).to.deep.equal(decodedUser);
    expect(next.calledOnce).to.be.true;
  });
}); 