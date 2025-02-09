import { expect } from 'chai';
import sinon from 'sinon';
import * as saleController from '../../src/controllers/saleController.js';
import { Sale } from '../../src/models/saleModel.js';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../src/utils/constants.js';
import { logger } from '../../src/utils/logger.js';

describe('Sale Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getSales', () => {
    it('should return sales with pagination', async () => {
      const fakeSales = [{ _id: '1', customerId: '123', currentStatus: 'New' }];
      const totalCount = 1;
      req.query = { page: '1', limit: '10', customerId: '123', status: 'New' };

      // Build a stub chain for the query methods (.skip(), .limit(), .sort())
      const skipStub = sinon.stub().returnsThis();
      const limitStub = sinon.stub().returnsThis();
      const sortStub = sinon.stub().resolves(fakeSales);

      sinon.stub(Sale, 'find').returns({
        skip: skipStub,
        limit: limitStub,
        sort: sortStub
      });
      sinon.stub(Sale, 'countDocuments').resolves(totalCount);

      await saleController.getSales(req, res);

      expect(res.status.calledWith(HTTP_STATUS.OK)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response).to.have.property('status', 'success');
      expect(response.data).to.have.property('sales').that.deep.equals(fakeSales);
      expect(response.data.pagination).to.include({
        total: totalCount,
        page: 1,
        pages: 1
      });
    });

    it('should handle errors in getSales', async () => {
      req.query = {};
      const error = new Error('DB error');
      sinon.stub(Sale, 'find').throws(error);
      const loggerErrorSpy = sinon.spy(logger, 'error');

      await saleController.getSales(req, res);

      expect(loggerErrorSpy.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.INTERNAL_SERVER)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response).to.have.property('status', 'error');
      expect(response).to.have.property('message', ERROR_MESSAGES.INTERNAL_SERVER);
    });
  });

  describe('getSaleById', () => {
    it('should return sale when found', async () => {
      const fakeSale = { _id: '1', customerId: '123', currentStatus: 'New' };
      req.params = { id: '1' };
      sinon.stub(Sale, 'findById').resolves(fakeSale);

      await saleController.getSaleById(req, res);

      expect(res.status.calledWith(HTTP_STATUS.OK)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response).to.have.property('status', 'success');
      expect(response.data).to.deep.equal(fakeSale);
    });

    it('should return 404 when sale is not found', async () => {
      req.params = { id: 'nonexistent' };
      sinon.stub(Sale, 'findById').resolves(null);

      await saleController.getSaleById(req, res);

      expect(res.status.calledWith(HTTP_STATUS.NOT_FOUND)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response).to.have.property('status', 'error');
      expect(response.message).to.include('not found');
    });

    it('should handle errors in getSaleById', async () => {
      req.params = { id: '1' };
      const error = new Error('DB error');
      sinon.stub(Sale, 'findById').throws(error);
      const loggerErrorSpy = sinon.spy(logger, 'error');

      await saleController.getSaleById(req, res);

      expect(loggerErrorSpy.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.INTERNAL_SERVER)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response).to.have.property('status', 'error');
      expect(response).to.have.property('message', ERROR_MESSAGES.INTERNAL_SERVER);
    });
  });

  describe('createSale', () => {
    it('should create a new sale successfully', async () => {
      req.body = {
        customerId: '123',
        currentStatus: 'New',
        notes: ['Initial note']
      };

      // Stub the save method on the Sale prototype so that new Sale().save() resolves.
      sinon.stub(Sale.prototype, 'save').resolves();

      await saleController.createSale(req, res);

      expect(res.status.calledWith(HTTP_STATUS.CREATED)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('success');
      expect(response.message).to.include(SUCCESS_MESSAGES.SALE_CREATED);
      expect(response.data).to.have.property('customerId', req.body.customerId);
    });

    it('should handle errors in createSale', async () => {
      req.body = { customerId: '123' };
      sinon.stub(Sale.prototype, 'save').throws(new Error('Save error'));
      const loggerErrorSpy = sinon.spy(logger, 'error');

      await saleController.createSale(req, res);

      expect(loggerErrorSpy.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.INTERNAL_SERVER)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('error');
      expect(response.message).to.equal(ERROR_MESSAGES.INTERNAL_SERVER);
    });
  });

  describe('updateSale', () => {
    it('should update sale status and notes successfully', async () => {
      req.params = { id: '1' };
      req.body = { currentStatus: 'Contacted', note: 'Contacted customer', notes: ['Updated note'] };

      const fakeSale = {
        _id: '1',
        customerId: '123',
        currentStatus: 'New',
        history: [],
        notes: [],
        save: sinon.stub().resolves()
      };

      sinon.stub(Sale, 'findById').resolves(fakeSale);

      await saleController.updateSale(req, res);

      // When the currentStatus is changing, an entry should be added in history.
      expect(fakeSale.history).to.have.length(1);
      expect(fakeSale.history[0]).to.include({ status: 'Contacted', note: 'Contacted customer' });
      expect(fakeSale.currentStatus).to.equal('Contacted');
      expect(fakeSale.notes).to.deep.equal(req.body.notes);

      expect(res.status.calledWith(HTTP_STATUS.OK)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('success');
      expect(response.message).to.include(SUCCESS_MESSAGES.SALE_UPDATED);
      expect(response.data).to.deep.equal(fakeSale);
    });

    it('should return 404 if sale is not found during updateSale', async () => {
      req.params = { id: 'nonexistent' };
      req.body = { currentStatus: 'Contacted' };

      sinon.stub(Sale, 'findById').resolves(null);

      await saleController.updateSale(req, res);

      expect(res.status.calledWith(HTTP_STATUS.NOT_FOUND)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('error');
      expect(response.message).to.include('not found');
    });

    it('should handle errors in updateSale', async () => {
      req.params = { id: '1' };
      req.body = { currentStatus: 'Contacted' };
      const error = new Error('Update error');
      sinon.stub(Sale, 'findById').throws(error);
      const loggerErrorSpy = sinon.spy(logger, 'error');

      await saleController.updateSale(req, res);

      expect(loggerErrorSpy.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.INTERNAL_SERVER)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('error');
      expect(response.message).to.equal(ERROR_MESSAGES.INTERNAL_SERVER);
    });
  });

  describe('deleteSale', () => {
    it('should delete sale successfully', async () => {
      req.params = { id: '1' };
      const fakeSale = { _id: '1', customerId: '123' };
      sinon.stub(Sale, 'findByIdAndDelete').resolves(fakeSale);

      await saleController.deleteSale(req, res);

      expect(res.status.calledWith(HTTP_STATUS.OK)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('success');
      expect(response.message).to.include(SUCCESS_MESSAGES.SALE_DELETED);
    });

    it('should return 404 if sale is not found during deleteSale', async () => {
      req.params = { id: 'nonexistent' };
      sinon.stub(Sale, 'findByIdAndDelete').resolves(null);

      await saleController.deleteSale(req, res);

      expect(res.status.calledWith(HTTP_STATUS.NOT_FOUND)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('error');
      expect(response.message).to.include('not found');
    });

    it('should handle errors in deleteSale', async () => {
      req.params = { id: '1' };
      const error = new Error('Delete error');
      sinon.stub(Sale, 'findByIdAndDelete').throws(error);
      const loggerErrorSpy = sinon.spy(logger, 'error');

      await saleController.deleteSale(req, res);

      expect(loggerErrorSpy.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.INTERNAL_SERVER)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('error');
      expect(response.message).to.equal(ERROR_MESSAGES.INTERNAL_SERVER);
    });
  });
}); 