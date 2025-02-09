import { expect } from 'chai';
import sinon from 'sinon';
import * as customerController from '../../src/controllers/customerController.js';
import { Customer } from '../../src/models/customerModel.js';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../src/utils/constants.js';
import { logger } from '../../src/utils/logger.js';

describe("Customer Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("createCustomer", () => {
    it("should create a new customer and respond with CREATED", async () => {
      req.body = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "1234567890",
        company: "Acme",
        status: "ACTIVE"
      };

      const fakeCustomer = new Customer(req.body);
      const saveStub = sinon.stub(Customer.prototype, "save").resolves(fakeCustomer);

      await customerController.createCustomer(req, res);

      expect(saveStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.CREATED)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("success");
      expect(response.message).to.equal(SUCCESS_MESSAGES.CUSTOMER_CREATED);
      expect(response.data.email).to.equal("john@example.com");
    });

    it("should respond with INTERNAL_SERVER if an error occurs while creating a customer", async () => {
      req.body = {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        phone: "9876543210",
        company: "Beta",
        status: "LEAD"
      };

      const error = new Error("Save failed");
      const saveStub = sinon.stub(Customer.prototype, "save").rejects(error);
      const loggerStub = sinon.stub(logger, "error");

      await customerController.createCustomer(req, res);

      expect(saveStub.calledOnce).to.be.true;
      expect(loggerStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.INTERNAL_SERVER)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.INTERNAL_SERVER);
    });
  });

  describe("getCustomerById", () => {
    it("should respond with customer data if a customer is found", async () => {
      const fakeCustomer = { _id: "1", firstName: "Alice" };
      req.params = { id: "1" };

      const findByIdStub = sinon.stub(Customer, "findById").resolves(fakeCustomer);

      await customerController.getCustomerById(req, res);

      expect(findByIdStub.calledWith("1")).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.OK)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("success");
      expect(response.data).to.deep.equal(fakeCustomer);
    });

    it("should respond with NOT_FOUND if the customer does not exist", async () => {
      req.params = { id: "2" };
      const findByIdStub = sinon.stub(Customer, "findById").resolves(null);

      await customerController.getCustomerById(req, res);

      expect(findByIdStub.calledWith("2")).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.NOT_FOUND)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    });

    it("should respond with INTERNAL_SERVER on an error", async () => {
      req.params = { id: "3" };
      const error = new Error("DB error");
      const findByIdStub = sinon.stub(Customer, "findById").rejects(error);
      const loggerStub = sinon.stub(logger, "error");

      await customerController.getCustomerById(req, res);

      expect(findByIdStub.calledWith("3")).to.be.true;
      expect(loggerStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.INTERNAL_SERVER)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.INTERNAL_SERVER);
    });
  });

  describe("getCustomers", () => {
    it("should return a list of customers with pagination", async () => {
      req.query = { page: "1", limit: "10", search: "john", company: "Acme" };
      const fakeCustomers = [{ _id: "1", firstName: "John" }, { _id: "2", firstName: "Doe" }];
      const fakeTotal = 2;

      const fakeQuery = {
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves(fakeCustomers)
      };

      const findStub = sinon.stub(Customer, "find").returns(fakeQuery);
      const countDocumentsStub = sinon.stub(Customer, "countDocuments").resolves(fakeTotal);

      await customerController.getCustomers(req, res);

      expect(findStub.called).to.be.true;
      expect(fakeQuery.sort.called).to.be.true;
      expect(fakeQuery.skip.called).to.be.true;
      expect(fakeQuery.limit.called).to.be.true;
      expect(countDocumentsStub.called).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.OK)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("success");
      expect(response.data.customers).to.deep.equal(fakeCustomers);
      expect(response.data.pagination.total).to.equal(fakeTotal);
      expect(response.data.pagination.page).to.equal(1);
      expect(response.data.pagination.pages).to.equal(Math.ceil(fakeTotal / 10));
    });

    it("should return INTERNAL_SERVER on error in getCustomers", async () => {
      req.query = {};
      const error = new Error("Database error");
      const findStub = sinon.stub(Customer, "find").throws(error);
      const loggerStub = sinon.stub(logger, "error");

      await customerController.getCustomers(req, res);

      expect(findStub.called).to.be.true;
      expect(loggerStub.called).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.INTERNAL_SERVER)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.INTERNAL_SERVER);
    });
  });

  describe("updateCustomer", () => {
    it("should update a customer and respond with updated data", async () => {
      req.params = { id: "1" };
      req.body = { email: "updated@example.com" };

      const updatedCustomer = { _id: "1", email: req.body.email };
      const findByIdAndUpdateStub = sinon.stub(Customer, "findByIdAndUpdate").resolves(updatedCustomer);

      await customerController.updateCustomer(req, res);

      expect(findByIdAndUpdateStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.OK)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("success");
      expect(response.message).to.equal(SUCCESS_MESSAGES.CUSTOMER_UPDATED);
      expect(response.data.email).to.equal(req.body.email);
    });

    it("should respond with NOT_FOUND if customer to update does not exist", async () => {
      req.params = { id: "2" };
      req.body = { email: "notfound@example.com" };

      const findByIdAndUpdateStub = sinon.stub(Customer, "findByIdAndUpdate").resolves(null);

      await customerController.updateCustomer(req, res);

      expect(findByIdAndUpdateStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.NOT_FOUND)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    });

    it("should return INTERNAL_SERVER on error in updateCustomer", async () => {
      req.params = { id: "3" };
      req.body = { email: "error@example.com" };

      const error = new Error("Update failed");
      const findByIdAndUpdateStub = sinon.stub(Customer, "findByIdAndUpdate").rejects(error);
      const loggerStub = sinon.stub(logger, "error");

      await customerController.updateCustomer(req, res);

      expect(findByIdAndUpdateStub.calledOnce).to.be.true;
      expect(loggerStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.INTERNAL_SERVER)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.INTERNAL_SERVER);
    });
  });

  describe("deleteCustomer", () => {
    it("should delete a customer and respond with success message", async () => {
      req.params = { id: "1" };

      const deletedCustomer = { _id: "1", firstName: "ToDelete" };
      const findByIdAndDeleteStub = sinon.stub(Customer, "findByIdAndDelete").resolves(deletedCustomer);

      await customerController.deleteCustomer(req, res);

      expect(findByIdAndDeleteStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.OK)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("success");
      expect(response.message).to.equal(SUCCESS_MESSAGES.CUSTOMER_DELETED);
    });

    it("should respond with NOT_FOUND if customer to delete does not exist", async () => {
      req.params = { id: "2" };

      const findByIdAndDeleteStub = sinon.stub(Customer, "findByIdAndDelete").resolves(null);

      await customerController.deleteCustomer(req, res);

      expect(findByIdAndDeleteStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.NOT_FOUND)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    });

    it("should return INTERNAL_SERVER on error in deleteCustomer", async () => {
      req.params = { id: "3" };

      const error = new Error("Delete failed");
      const findByIdAndDeleteStub = sinon.stub(Customer, "findByIdAndDelete").rejects(error);
      const loggerStub = sinon.stub(logger, "error");

      await customerController.deleteCustomer(req, res);

      expect(findByIdAndDeleteStub.calledOnce).to.be.true;
      expect(loggerStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.INTERNAL_SERVER)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.INTERNAL_SERVER);
    });
  });

  describe("addNote", () => {
    it("should add a note to a customer", async () => {
      req.params = { id: "1" };
      req.body = { content: "New note" };

      const fakeCustomer = {
        _id: "1",
        notes: [],
        save: sinon.stub().resolvesThis()
      };

      const findByIdStub = sinon.stub(Customer, "findById").resolves(fakeCustomer);

      await customerController.addNote(req, res);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(fakeCustomer.notes).to.have.lengthOf(1);
      expect(fakeCustomer.notes[0]).to.have.property("content", "New note");
      expect(fakeCustomer.save.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.OK)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("success");
      expect(response.data.notes).to.deep.equal(fakeCustomer.notes);
    });

    it("should respond with NOT_FOUND if customer to add note does not exist", async () => {
      req.params = { id: "2" };
      req.body = { content: "Test note" };

      const findByIdStub = sinon.stub(Customer, "findById").resolves(null);

      await customerController.addNote(req, res);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.NOT_FOUND)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    });

    it("should return INTERNAL_SERVER on error in addNote", async () => {
      req.params = { id: "3" };
      req.body = { content: "Note error" };

      const error = new Error("Error adding note");
      const findByIdStub = sinon.stub(Customer, "findById").rejects(error);
      const loggerStub = sinon.stub(logger, "error");

      await customerController.addNote(req, res);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(loggerStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.INTERNAL_SERVER)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.INTERNAL_SERVER);
    });
  });

  describe("updateNote", () => {
    it("should update an existing note", async () => {
      req.params = { id: "1", noteId: "n1" };
      req.body = { content: "Updated note" };

      const fakeNote = { _id: "n1", content: "Old note" };
      const fakeCustomer = {
        _id: "1",
        notes: {
          id: sinon.stub().returns(fakeNote)
        },
        save: sinon.stub().resolvesThis()
      };

      const findByIdStub = sinon.stub(Customer, "findById").resolves(fakeCustomer);

      await customerController.updateNote(req, res);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(fakeNote.content).to.equal("Updated note");
      expect(fakeCustomer.save.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.OK)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("success");
      expect(response.data).to.deep.equal(fakeCustomer);
    });

    it("should respond with NOT_FOUND if customer for note update does not exist", async () => {
      req.params = { id: "2", noteId: "n1" };
      req.body = { content: "Update attempt" };

      const findByIdStub = sinon.stub(Customer, "findById").resolves(null);

      await customerController.updateNote(req, res);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.NOT_FOUND)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    });

    it("should respond with NOT_FOUND if note is not found", async () => {
      req.params = { id: "3", noteId: "n2" };
      req.body = { content: "Non-existent note update" };

      const fakeCustomer = {
        _id: "3",
        notes: {
          id: sinon.stub().returns(null)
        },
        save: sinon.stub().resolvesThis()
      };

      const findByIdStub = sinon.stub(Customer, "findById").resolves(fakeCustomer);

      await customerController.updateNote(req, res);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.NOT_FOUND)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal("Note not found");
    });

    it("should return INTERNAL_SERVER on error in updateNote", async () => {
      req.params = { id: "4", noteId: "n4" };
      req.body = { content: "Note error" };

      const error = new Error("Update note error");
      const findByIdStub = sinon.stub(Customer, "findById").rejects(error);
      const loggerStub = sinon.stub(logger, "error");

      await customerController.updateNote(req, res);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(loggerStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.INTERNAL_SERVER)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.INTERNAL_SERVER);
    });
  });

  describe("deleteNote", () => {
    it("should delete an existing note", async () => {
      req.params = { id: "1", noteId: "n1" };

      const fakeNote = { _id: "n1", content: "To be removed", remove: sinon.stub() };
      const fakeCustomer = {
        _id: "1",
        notes: {
          id: sinon.stub().returns(fakeNote)
        },
        save: sinon.stub().resolvesThis()
      };

      fakeNote.remove.callsFake(() => {});
      const findByIdStub = sinon.stub(Customer, "findById").resolves(fakeCustomer);

      await customerController.deleteNote(req, res);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(fakeNote.remove.calledOnce).to.be.true;
      expect(fakeCustomer.save.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.OK)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("success");
      expect(response.data).to.deep.equal(fakeCustomer);
    });

    it("should respond with NOT_FOUND if customer for note deletion does not exist", async () => {
      req.params = { id: "2", noteId: "n1" };

      const findByIdStub = sinon.stub(Customer, "findById").resolves(null);

      await customerController.deleteNote(req, res);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.NOT_FOUND)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    });

    it("should respond with NOT_FOUND if note does not exist for deletion", async () => {
      req.params = { id: "3", noteId: "n2" };

      const fakeCustomer = {
        _id: "3",
        notes: {
          id: sinon.stub().returns(null)
        },
        save: sinon.stub().resolvesThis()
      };

      const findByIdStub = sinon.stub(Customer, "findById").resolves(fakeCustomer);

      await customerController.deleteNote(req, res);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.NOT_FOUND)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    });

    it("should return INTERNAL_SERVER on error in deleteNote", async () => {
      req.params = { id: "4", noteId: "n4" };

      const error = new Error("Delete note error");
      const findByIdStub = sinon.stub(Customer, "findById").rejects(error);
      const loggerStub = sinon.stub(logger, "error");

      await customerController.deleteNote(req, res);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(loggerStub.calledOnce).to.be.true;
      expect(res.status.calledWith(HTTP_STATUS.INTERNAL_SERVER)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal("error");
      expect(response.message).to.equal(ERROR_MESSAGES.INTERNAL_SERVER);
    });
  });
});