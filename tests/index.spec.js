'use strict';

var PersistedModel = require('@naujs/persisted-model')
  , DataMapper = require('../')
  , util = require('@naujs/util')
  , Promise = util.getPromise()
  , _ = require('lodash');

class DummyConnector {}
DummyConnector.prototype.find = jasmine.createSpy('find');
DummyConnector.prototype.findAll = jasmine.createSpy('findAll');
DummyConnector.prototype.create = jasmine.createSpy('create');
DummyConnector.prototype.update = jasmine.createSpy('update');
DummyConnector.prototype.delete = jasmine.createSpy('delete');

class DummyModel extends PersistedModel {
  primaryKey() {
    return 'id';
  }

  modelName() {
    return 'test';
  }

  attributes() {
    return {
      firstName: {
        type: PersistedModel.Types.string
      },
      lastName: {
        type: PersistedModel.Types.string
      },
      name: {
        type: PersistedModel.Types.string,
        persistable: false
      }
    };
  }
}

describe('DataMapper', () => {
  var mapper, connector;

  beforeEach(() => {
    connector = new DummyConnector();
    mapper = DataMapper.getInstance(connector);
    spyOn(DummyModel.prototype, 'onAfterFind').and.callThrough();
  });

  afterEach(() => {
    DummyModel.prototype.onAfterFind.calls.reset();
  });

  describe('#find', () => {
    it('should call #find on the connector', (done) => {
      connector.find.and.callFake(() => {
        return Promise.resolve({});
      });

      var criteria = {
        where: {a: '1'}
      };

      var options = {
        random: 'stuff'
      };

      mapper.find(DummyModel, criteria, options).then(() => {
        expect(connector.find).toHaveBeenCalledWith('test', criteria, options);
      }).catch(fail).then(done);
    });

    it('should populate the model with the result', (done) => {
      connector.find.and.callFake(() => {
        return Promise.resolve({
          id: 1,
          firstName: 'Tan',
          lastName: 'Nguyen'
        });
      });

      var criteria = {
        where: {a: '1'}
      };

      var options = {
        random: 'stuff'
      };

      mapper.find(DummyModel, criteria, options).then((instance) => {
        expect(instance instanceof DummyModel).toBe(true);
        expect(instance.id).toEqual(1);
        expect(instance.firstName).toEqual('Tan');
        expect(instance.lastName).toEqual('Nguyen');
      }).catch(fail).then(done);
    });

    it('should call #onAfterFind when found the instance', (done) => {
      connector.find.and.callFake(() => {
        return Promise.resolve({});
      });

      var options = {
        random: 'stuff'
      };

      mapper.find(DummyModel, {}, options).then(() => {
        expect(DummyModel.prototype.onAfterFind).toHaveBeenCalledWith(options);
        expect(DummyModel.prototype.onAfterFind.calls.count()).toEqual(1);
      }).catch(fail).then(done);
    });

  });

  describe('#findByPk', () => {
    it('should call #find with correct criteria', (done) => {
      spyOn(mapper, 'find').and.callFake(() => {
        return Promise.resolve({});
      });

      var options = {
        random: 'stuff'
      };

      mapper.findByPk(DummyModel, 1, options).then(() => {
        expect(mapper.find).toHaveBeenCalledWith(DummyModel, {
          where: {
            'id': 1
          }
        }, options);
      }).then(done, fail);
    });
  });

  describe('#findAll', () => {
    it('should call #findAll on the connector', (done) => {
      connector.findAll.and.callFake(() => {
        return Promise.resolve([
          {},
          {}
        ]);
      });

      var criteria = {
        where: {a: '1'}
      };

      var options = {
        random: 'stuff'
      };

      mapper.findAll(DummyModel, criteria, options).then(() => {
        expect(connector.findAll).toHaveBeenCalledWith('test', criteria, options);
      }).catch(fail).then(done);
    });

    it('should populate the model with the result', (done) => {
      connector.findAll.and.callFake(() => {
        return Promise.resolve([
          {
            id: 1,
            firstName: 'Tan',
            lastName: 'Nguyen'
          },
          {
            id: 2,
            firstName: 'Tan',
            lastName: 'Nguyen'
          }
        ]);
      });

      var criteria = {
        where: {a: '1'}
      };

      var options = {
        random: 'stuff'
      };

      mapper.findAll(DummyModel, criteria, options).then((instances) => {
        _.each(instances, (instance, index) => { //eslint-disable-line max-nested-callbacks
          expect(instance instanceof DummyModel).toBe(true);
          expect(instance.id).toEqual(index + 1);
          expect(instance.firstName).toEqual('Tan');
          expect(instance.lastName).toEqual('Nguyen');
        });
      }).catch(fail).then(done);
    });

    it('should call #onAfterFind on each instance found', (done) => {
      connector.findAll.and.callFake(() => {
        return Promise.resolve([{}, {}]);
      });

      var options = {
        random: 'stuff'
      };

      mapper.findAll(DummyModel, {}, options).then(() => {
        expect(DummyModel.prototype.onAfterFind.calls.count()).toEqual(2);
      }).catch(fail).then(done);
    });

  });

  describe('#create', () => {
    it('should call #create on the connector', (done) => {
      var instance = new DummyModel({
        firstName: 'Tan',
        lastName: 'Nguyen',
        name: 'Tan Nguyen'
      });

      connector.create.and.callFake(() => {
        return Promise.resolve(instance);
      });

      var options = {
        random: 'stuff'
      };

      mapper.create(instance, options).then(() => {
        expect(connector.create).toHaveBeenCalledWith('test', {
          firstName: 'Tan',
          lastName: 'Nguyen'
        }, options);
      }).catch(fail).then(done);
    });

    it('should set attributes for the model afterward', (done) => {
      var instance = new DummyModel({
        firstName: 'Tan',
        lastName: 'Nguyen',
        name: 'Tan Nguyen'
      });

      connector.create.and.callFake(() => {
        return Promise.resolve({
          id: 1,
          firstName: 'Tan',
          lastName: 'Nguyen'
        });
      });

      var options = {
        random: 'stuff'
      };

      mapper.create(instance, options).then((instance) => {
        expect(connector.create).toHaveBeenCalledWith('test', {
          firstName: 'Tan',
          lastName: 'Nguyen'
        }, options);

        expect(instance instanceof DummyModel).toBe(true);
        expect(instance.id).toEqual(1);
      }).catch(fail).then(done);
    });

    it('should call #validate on the model', (done) => {
      var instance = new DummyModel();
      connector.create.and.callFake(() => {
        return Promise.resolve(instance);
      });

      spyOn(instance, 'validate').and.callFake(() => {
        return Promise.resolve(true);
      });

      var options = {
        random: 'stuff'
      };

      mapper.create(instance, options).then(() => {
        expect(instance.validate).toHaveBeenCalledWith(options);
      }).catch(fail).then(done);
    });

    it('should call #onBeforeCreate on the model', (done) => {
      var instance = new DummyModel();
      connector.create.and.callFake(() => {
        return Promise.resolve(instance);
      });

      spyOn(instance, 'onBeforeCreate').and.callFake(() => {
        return Promise.resolve(true);
      });

      var options = {
        random: 'stuff'
      };

      mapper.create(instance, options).then(() => {
        expect(instance.onBeforeCreate).toHaveBeenCalledWith(options);
      }).catch(fail).then(done);
    });

    it('should not call #onBeforeCreate if validation fails', (done) => {
      var instance = new DummyModel();
      connector.create.and.callFake(() => {
        return Promise.resolve(instance);
      });

      spyOn(instance, 'validate').and.callFake(() => {
        return Promise.resolve(false);
      });

      spyOn(instance, 'onBeforeCreate').and.callFake(() => {
        return Promise.resolve(true);
      });

      var options = {
        random: 'stuff'
      };

      mapper.create(instance, options).then(() => {
        expect(instance.onBeforeCreate).not.toHaveBeenCalledWith(options);
      }).catch(fail).then(done);
    });

    it('should call #onAfterCreate on the model', (done) => {
      var instance = new DummyModel();
      connector.create.and.callFake(() => {
        return Promise.resolve(instance);
      });

      spyOn(instance, 'onAfterCreate').and.callFake(() => {
        return Promise.resolve(true);
      });

      var options = {
        random: 'stuff'
      };

      mapper.create(instance, options).then(() => {
        expect(instance.onAfterCreate).toHaveBeenCalledWith(options);
      }).catch(fail).then(done);
    });
  });

  describe('#update', () => {
    it('should call #update on the connector', (done) => {
      var instance = new DummyModel({
        id: 1,
        firstName: 'Tan',
        lastName: 'Nguyen',
        name: 'Tan Nguyen'
      });

      connector.update.and.callFake(() => {
        return Promise.resolve(instance);
      });

      var options = {
        random: 'stuff'
      };

      mapper.update(instance, options).then(() => {
        expect(connector.update).toHaveBeenCalledWith('test', {
          where: {
            id: 1
          }
        }, {
          firstName: 'Tan',
          lastName: 'Nguyen'
        }, options);
      }).catch(fail).then(done);
    });

    it('should set attributes for the model afterward', (done) => {
      var instance = new DummyModel({
        id: 1,
        firstName: 'Tan',
        name: 'Tan Nguyen'
      });

      connector.update.and.callFake(() => {
        return Promise.resolve({
          id: 1,
          firstName: 'Tan',
          lastName: 'Nguyen'
        });
      });

      var options = {
        random: 'stuff'
      };

      mapper.update(instance, options).then((instance) => {
        expect(instance instanceof DummyModel).toBe(true);
        expect(instance.id).toEqual(1);
        expect(instance.lastName).toEqual('Nguyen');
      }).catch(fail).then(done);
    });

    it('should call #validate on the model', (done) => {
      var instance = new DummyModel({
        id: 1
      });

      connector.update.and.callFake(() => {
        return Promise.resolve(instance);
      });

      spyOn(instance, 'validate').and.callFake(() => {
        return Promise.resolve(true);
      });

      var options = {
        random: 'stuff'
      };

      mapper.update(instance, options).then(() => {
        expect(instance.validate).toHaveBeenCalledWith(options);
      }).catch(fail).then(done);
    });

    it('should call #onBeforeUpdate on the model', (done) => {
      var instance = new DummyModel({
        id: 1
      });

      connector.update.and.callFake(() => {
        return Promise.resolve(instance);
      });

      spyOn(instance, 'onBeforeUpdate').and.callFake(() => {
        return Promise.resolve(true);
      });

      var options = {
        random: 'stuff'
      };

      mapper.update(instance, options).then(() => {
        expect(instance.onBeforeUpdate).toHaveBeenCalledWith(options);
      }).catch(fail).then(done);
    });

    it('should not call #onBeforeUpdate if validation fails', (done) => {
      var instance = new DummyModel({
        id: 1
      });

      connector.update.and.callFake(() => {
        return Promise.resolve(instance);
      });

      spyOn(instance, 'validate').and.callFake(() => {
        return Promise.resolve(false);
      });

      spyOn(instance, 'onBeforeUpdate').and.callFake(() => {
        return Promise.resolve(true);
      });

      var options = {
        random: 'stuff'
      };

      mapper.update(instance, options).then(() => {
        expect(instance.onBeforeUpdate).not.toHaveBeenCalledWith(options);
      }).catch(fail).then(done);
    });

    it('should call #onAfterUpdate on the model', (done) => {
      var instance = new DummyModel({
        id: 1
      });

      connector.update.and.callFake(() => {
        return Promise.resolve(instance);
      });

      spyOn(instance, 'onAfterUpdate').and.callFake(() => {
        return Promise.resolve(true);
      });

      var options = {
        random: 'stuff'
      };

      mapper.update(instance, options).then(() => {
        expect(instance.onAfterUpdate).toHaveBeenCalledWith(options);
      }).catch(fail).then(done);
    });
  });

  describe('#delete', () => {
    it('should call #delete on the connector', (done) => {
      var instance = new DummyModel({
        id: 1,
        firstName: 'Tan',
        lastName: 'Nguyen',
        name: 'Tan Nguyen'
      });

      connector.delete.and.callFake(() => {
        return Promise.resolve(instance);
      });

      var options = {
        random: 'stuff'
      };

      mapper.delete(instance, options).then(() => {
        expect(connector.delete).toHaveBeenCalledWith('test', {
          where: {
            id: 1
          }
        }, options);
      }).catch(fail).then(done);
    });

    it('should call #onBeforeDelete on the model', (done) => {
      var instance = new DummyModel({
        id: 1
      });

      connector.delete.and.callFake(() => {
        return Promise.resolve(instance);
      });

      spyOn(instance, 'onBeforeDelete').and.callFake(() => {
        return Promise.resolve(true);
      });

      var options = {
        random: 'stuff'
      };

      mapper.delete(instance, options).then(() => {
        expect(instance.onBeforeDelete).toHaveBeenCalledWith(options);
      }).catch(fail).then(done);
    });

    it('should call #onAfterDelete on the model', (done) => {
      var instance = new DummyModel({
        id: 1
      });

      connector.delete.and.callFake(() => {
        return Promise.resolve(instance);
      });

      spyOn(instance, 'onAfterDelete').and.callFake(() => {
        return Promise.resolve(true);
      });

      var options = {
        random: 'stuff'
      };

      mapper.delete(instance, options).then(() => {
        expect(instance.onAfterDelete).toHaveBeenCalledWith(options);
      }).catch(fail).then(done);
    });
  });

});
