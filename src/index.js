'use strict';

var Component = require('@naujs/component')
  , PersistedModel = require('@naujs/persisted-model')
  , util = require('@naujs/util')
  , Promise = util.getPromise()
  , _ = require('lodash');

function checkPersistedModel(param) {
  if (!(param instanceof PersistedModel)) {
    throw 'Must be an instance of PersistedModel';
  }
}

function onAfterFind(instance, options) {
  let onAfterFind = instance.onAfterFind(options);

  return util.tryPromise(onAfterFind).then(() => {
    return instance;
  });
}

function onBeforeCreate(instance, options) {
  let onBeforeCreate = instance.onBeforeCreate(options);

  return util.tryPromise(onBeforeCreate).then((result) => {
    if (!result) {
      return false;
    }

    return instance;
  });
}

function onAfterCreate(instance, options) {
  let onAfterCreate = instance.onAfterCreate(options);

  return util.tryPromise(onAfterCreate).then(() => {
    return instance;
  });
}

function onBeforeUpdate(instance, options) {
  let onBeforeUpdate = instance.onBeforeUpdate(options);

  return util.tryPromise(onBeforeUpdate).then((result) => {
    if (!result) {
      return false;
    }

    return instance;
  });
}

function onAfterUpdate(instance, options) {
  let onAfterUpdate = instance.onAfterUpdate(options);

  return util.tryPromise(onAfterUpdate).then(() => {
    return instance;
  });
}

var instance = null;

class DataMapper extends Component {

  constructor(connector) {
    super();

    if (!connector) {
      throw 'Must provide connector';
    }

    this._connector = connector;
  }

  getConnector() {
    return this._connector;
  }

  /**
   * Finds one model instance based on the criteria
   * @param  {PersistedModel} Model
   * @return {PersistedModel | null}
   */
  find(Model, criteria, options = {}) {
    let name = Model.prototype.modelName();

    return this.getConnector().find(name, criteria, options).then((result) => {
      if (!result) {
        return null;
      }

      let instance = new Model(result);

      return onAfterFind(instance, options).then(() => {
        return instance;
      });
    });
  }

  findByPk(Model, value, options = {}) {
    let pk = Model.prototype.primaryKey();

    let where = {};
    where[pk] = value;

    return this.find(Model, {
      where: where
    }, options);
  }

  findAll(Model, criteria, options = {}) {
    let name = Model.prototype.modelName();
    return this.getConnector().findAll(name, criteria, options).then((results) => {
      if (!_.isArray(results) || !_.size(results)) {
        return [];
      }

      let promises = _.map(results, (result) => {
        let instance = new Model(result);
        return onAfterFind(instance, options).then(() => {
          return instance;
        });
      });

      return Promise.all(promises);
    });
  }

  findRelation(model, relationName, criteria) {

  }

  create(model, options) {
    checkPersistedModel(model);

    if (!model.isNew()) {
      return Promise.reject('Cannot create old model');
    }

    return model.validate(options).then((result) => {
      if (!result) {
        return false;
      }

      return onBeforeCreate(model, options).then((result) => {
        if (!result) {
          return false;
        }

        let attributes = model.getPersistableAttributes();
        let name = model.modelName();

        return this.getConnector().create(name, attributes, options).then((result) => {
          model.setAttributes(result);
          return onAfterCreate(model, options);
        });
      });
    });
  }

  update(model, options) {
    checkPersistedModel(model);

    if (model.isNew()) {
      return Promise.reject('Cannot update new model');
    }

    return model.validate(options).then((result) => {
      if (!result) {
        return false;
      }

      return onBeforeUpdate(model, options).then((result) => {
        if (!result) {
          return false;
        }

        let attributes = model.getPersistableAttributes();
        let name = model.modelName();
        let criteria = {};
        let primaryKey = model.primaryKey();
        criteria[primaryKey] = model.getPrimaryKeyValue();

        return this.getConnector().update(name, criteria, attributes, options).then((result) => {
          model.setAttributes(result);
          return onAfterUpdate(model, options);
        });
      });
    });
  }

  save(model, options) {
    checkPersistedModel(model);

    if (model.isNew()) {
      return this.create(model, options);
    }
    return this.update(model.options);
  }

  delete(model, options) {
    checkPersistedModel(model);

    if (model.isNew()) {
      return Promise.reject('Cannot delete new model');
    }
  }
}

module.exports = DataMapper;
