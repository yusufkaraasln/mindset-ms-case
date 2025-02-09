process.env.JWT_SECRET = 'secretkey';

import { authorize } from '../src/middleware/auth.js';
import jwt from 'jsonwebtoken';
import { ERROR_MESSAGES } from '../src/utils/constants.js';
import { expect } from 'chai';
import sinon from 'sinon';

describe('Auth Middleware', function () {
  let req;
  let res;
  let next;

  beforeEach(function () {
    req = { headers: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    next = sinon.spy();
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should return 401 if no token is provided', function () {
    const middleware = authorize(['ADMIN']);
    middleware(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({
      status: 'error',
      message: ERROR_MESSAGES.UNAUTHORIZED
    })).to.be.true;
  });

  it('should return 401 if token is invalid', function () {
    req.headers.authorization = 'Bearer invalidtoken';
    const middleware = authorize(['ADMIN']);
    middleware(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.called).to.be.true;
  });

  it('should return 403 if user does not have required role', function () {
    const payload = { id: '1', email: 'user@example.com', roles: ['USER'] };
    const token = 'dummyToken';
    req.headers.authorization = `Bearer ${token}`;

    sinon.stub(jwt, 'verify').returns(payload);

    const middleware = authorize(['ADMIN']);
    middleware(req, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWith({
      status: 'error',
      message: ERROR_MESSAGES.FORBIDDEN
    })).to.be.true;
  });

  it('should call next if token is valid and user has required role', function () {
    const payload = { id: '1', email: 'admin@example.com', roles: ['ADMIN'] };
    const token = 'dummyToken';
    req.headers.authorization = `Bearer ${token}`;

    sinon.stub(jwt, 'verify').returns(payload);

    const middleware = authorize(['ADMIN']);
    middleware(req, res, next);

    expect(next.called).to.be.true;
  });
}); 