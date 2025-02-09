import { login, createUser, getUsers, updateUser, deleteUser } from '../src/controllers/userController.js';
import { User } from '../src/models/userModel.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../src/utils/constants.js';
import jwt from 'jsonwebtoken';
import { expect } from 'chai';
import sinon from 'sinon';

 
describe('User Controller', function () {
  let req;
  let res;

  beforeEach(function () {
    req = { body: {}, params: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
  });

  afterEach(function () {
    sinon.restore();
  });

   describe('login', function () {
    it('should return 401 if user is not found', async function () {
      req.body = { email: 'test@example.com', password: 'anyPassword' };
      // Stub returns chainable "select" method
      sinon.stub(User, 'findOne').returns({
        select: () => Promise.resolve(null)
      });
      await login(req, res);
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({
        status: 'error',
        message: ERROR_MESSAGES.INVALID_CREDENTIALS
      })).to.be.true;
    });

    it('should return 401 if password is invalid', async function () {
      req.body = { email: 'test@example.com', password: 'wrongPassword' };
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        roles: ['USER'],
        comparePassword: sinon.stub().resolves(false)
      };
      sinon.stub(User, 'findOne').returns({
        select: () => Promise.resolve(mockUser)
      });
      await login(req, res);
      expect(mockUser.comparePassword.calledWith('wrongPassword')).to.be.true;
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({
        status: 'error',
        message: ERROR_MESSAGES.INVALID_CREDENTIALS
      })).to.be.true;
    });

    it('should login successfully and return a token', async function () {
      req.body = { email: 'test@example.com', password: 'correctPassword' };
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        roles: ['USER'],
        comparePassword: sinon.stub().resolves(true)
      };
      sinon.stub(User, 'findOne').returns({
        select: () => Promise.resolve(mockUser)
      });
      const fakeToken = 'faketoken';
      sinon.stub(jwt, 'sign').returns(fakeToken);
      await login(req, res);
      expect(mockUser.comparePassword.calledWith('correctPassword')).to.be.true;
      expect(res.json.calledWith({
        status: 'success',
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        token: fakeToken,
        user: {
          id: mockUser._id,
          email: mockUser.email,
          roles: mockUser.roles
        }
      })).to.be.true;
    });
  });

   describe('createUser', function () {
    it('should create a new user and return 201', async function () {
      req.body = { email: 'new@example.com', password: 'password123', roles: ['USER'] };
      const createdUser = { _id: '456', email: 'new@example.com', roles: ['USER'] };
      sinon.stub(User, 'create').resolves(createdUser);

      await createUser(req, res);

      expect(User.create.calledWith(req.body)).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({
        status: 'success',
        data: {
          user: {
            id: createdUser._id,
            email: createdUser.email,
            roles: createdUser.roles
          }
        }
      })).to.be.true;
    });

    it('should handle errors during user creation and return 400', async function () {
      req.body = { email: 'new@example.com', password: 'password123', roles: ['USER'] };
      sinon.stub(User, 'create').rejects(new Error('Validation Error'));

      await createUser(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({
        status: 'error',
        message: ERROR_MESSAGES.VALIDATION_ERROR
      })).to.be.true;
    });
  });

   describe('getUsers', function () {
    it('should retrieve and return a list of users', async function () {
      const users = [{ _id: '1', email: 'a@example.com' }, { _id: '2', email: 'b@example.com' }];
      sinon.stub(User, 'find').resolves(users);

      await getUsers(req, res);

      expect(User.find.called).to.be.true;
      expect(res.json.calledWith({
        status: 'success',
        data: { users }
      })).to.be.true;
    });

    it('should handle errors during fetching users and return 500', async function () {
      sinon.stub(User, 'find').rejects(new Error('Error'));

      await getUsers(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({
        status: 'error',
        message: ERROR_MESSAGES.INTERNAL_SERVER
      })).to.be.true;
    });
  });

   describe('updateUser', function () {
    it('should update and return the user', async function () {
      req.params.id = '789';
      req.body = { firstName: 'Updated' };
      const updatedUser = { _id: '789', email: 'test@example.com', firstName: 'Updated', roles: ['USER'] };
      sinon.stub(User, 'findByIdAndUpdate').resolves(updatedUser);

      await updateUser(req, res);

      expect(User.findByIdAndUpdate.calledWith('789', req.body, { new: true, runValidators: true })).to.be.true;
      expect(res.json.calledWith({
        status: 'success',
        data: { user: updatedUser }
      })).to.be.true;
    });

    it('should handle errors during updating user and return 400', async function () {
      req.params.id = '789';
      req.body = { firstName: 'Updated' };
      sinon.stub(User, 'findByIdAndUpdate').rejects(new Error('Error'));

      await updateUser(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({
        status: 'error',
        message: ERROR_MESSAGES.VALIDATION_ERROR
      })).to.be.true;
    });
  });

   describe('deleteUser', function () {
    it('should delete the user and return 204', async function () {
      req.params.id = '789';
      sinon.stub(User, 'findByIdAndDelete').resolves(null);

      await deleteUser(req, res);

      expect(User.findByIdAndDelete.calledWith('789')).to.be.true;
      expect(res.status.calledWith(204)).to.be.true;
      expect(res.json.calledWith({
        status: 'success',
        data: null
      })).to.be.true;
    });

    it('should handle errors during deletion and return 400', async function () {
      req.params.id = '789';
      sinon.stub(User, 'findByIdAndDelete').rejects(new Error('Error'));

      await deleteUser(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({
        status: 'error',
        message: ERROR_MESSAGES.VALIDATION_ERROR
      })).to.be.true;
    });
  });
}); 