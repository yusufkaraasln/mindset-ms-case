import { expect } from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import { authorizeRoles } from '../../src/middleware/authorize.js';
import { HTTP_STATUS, JWT_CONFIG } from '../../src/utils/constants.js';

describe("authorizeRoles middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should call next if req.user is already set with allowed role", () => {
    req.user = { roles: ["ADMIN", "USER"] };
    const middleware = authorizeRoles(["ADMIN"]);

    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
  });

  it("should return 401 if authorization header is missing and req.user is not set", () => {
    const middleware = authorizeRoles(["ADMIN"]);
    middleware(req, res, next);

    expect(res.status.calledWith(HTTP_STATUS.UNAUTHORIZED)).to.be.true;
    expect(res.json.calledWith({ error: "Authorization header is missing." })).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should return 401 if token is not provided in the header", () => {
    req.headers.authorization = "Bearer";
    const middleware = authorizeRoles(["ADMIN"]);
    middleware(req, res, next);

    expect(res.status.calledWith(HTTP_STATUS.UNAUTHORIZED)).to.be.true;
    expect(res.json.calledWith({ error: "Token not provided." })).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should return 401 if token is invalid", () => {
    req.headers.authorization = "Bearer invalidtoken";
    const errorMessage = "jwt malformed";
    sinon.stub(jwt, "verify").throws(new Error(errorMessage));

    const middleware = authorizeRoles(["ADMIN"]);
    middleware(req, res, next);

    expect(jwt.verify.calledWith("invalidtoken", JWT_CONFIG.SECRET)).to.be.true;
    expect(res.status.calledWith(HTTP_STATUS.UNAUTHORIZED)).to.be.true;
    expect(res.json.calledWith({ error: "Invalid token: " + errorMessage })).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should return 401 if decoded token does not contain roles", () => {
    req.headers.authorization = "Bearer validtoken";
    const decoded = { id: "123", email: "test@example.com" };
    sinon.stub(jwt, "verify").returns(decoded);

    const middleware = authorizeRoles(["ADMIN"]);
    middleware(req, res, next);

    expect(req.user).to.deep.equal(decoded);
    expect(res.status.calledWith(HTTP_STATUS.UNAUTHORIZED)).to.be.true;
    expect(res.json.calledWith({ error: "User roles not found. Unauthorized." })).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should return 403 if user's roles do not include allowed roles", () => {
    req.headers.authorization = "Bearer validtoken";
    const decoded = { id: "123", email: "test@example.com", roles: ["USER"] };
    sinon.stub(jwt, "verify").returns(decoded);

    const middleware = authorizeRoles(["ADMIN", "SALES_REP"]);
    middleware(req, res, next);

    expect(req.user).to.deep.equal(decoded);
    expect(res.status.calledWith(HTTP_STATUS.FORBIDDEN)).to.be.true;
    expect(res.json.calledWith({ error: "Forbidden. Insufficient permissions." })).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should call next if token is valid and user has allowed role", () => {
    req.headers.authorization = "Bearer validtoken";
    const decoded = { id: "123", email: "test@example.com", roles: ["ADMIN", "USER"] };
    sinon.stub(jwt, "verify").returns(decoded);

    const middleware = authorizeRoles(["ADMIN"]);
    middleware(req, res, next);

    expect(req.user).to.deep.equal(decoded);
    expect(next.calledOnce).to.be.true;
  });

  it("should use req.user if already present and skip token verification", () => {
    req.user = { id: "123", email: "test@example.com", roles: ["SALES_REP"] };
    req.headers.authorization = "Bearer sometoken"; // yalancı token
    const verifySpy = sinon.spy(jwt, "verify");
    const middleware = authorizeRoles(["SALES_REP"]);
    middleware(req, res, next);

    expect(verifySpy.notCalled).to.be.true;
    expect(next.calledOnce).to.be.true;
  });
}); 