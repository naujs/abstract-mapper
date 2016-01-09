'use strict';

var Component = require('@naujs/component')
  , PersistedModel = require('@naujs/persisted-model')
  , util = require('@naujs/util')
  , _ = require('lodash');

function checkFindParam(param) {
  if (!(param instanceof PersistedModel)) {
    throw 'Must be an instance of PersistedModel';
  }
}

function validateCriteria(criteria) {

}

var instance = null;

class AbstractMapper extends Component {

  /**
   * Gets the singleton instance of this mapper
   * @method AbstractMapper.getInstance
   * @return {AbstractMapper} AbstractMapper
   */
  static getInstance() {
    if (!instance) {
      instance = new this();
    }

    return instance;
  }

  /**
   * These methods must be implemented by concrete mappers
   */

  executeFind(name, criteria) {
    throw 'Must be implemented';
  }

  executeFindAll(name, criteria) {
    throw 'Must be implemented';
  }

  executeFindRelation(name, relation, criteria) {
    throw 'Must be implemented';
  }

  /**
   * Finds one model instance based on the criteria
   * @param  {PersistedModel} Model
   * @return {PersistedModel | null}
   */
  find(Model, criteria, options = {}) {
    validateCriteria(criteria);
    var name = Model.prototype.name();

    let onAfterFind = instance.onAfterFind(options);

    return this.executeFind(name, criteria).then((instance) => {
      return instance.onAfterFind(options).then(() => {
        return instance;
      });
    });
  }

  findAll(Model, criteria, options = {}) {
    validateCriteria(criteria);

    var name = Model.prototype.name();
    return this.executeFindAll(name, criteria).then((instances) => {
      var promises = _.map(instances, (instance) => {
        return instance.onAfterFind(options);
      });

      return util.getPromise().all(promises).then(() => {
        return instances;
      });
    });
  }

  findRelation(model, relationName, criteria) {
    validateCriteria(criteria);
  }

  create(model, options) {

  }

  update(model, options) {

  }

  save(model, options) {

  }

  delete(model, options) {

  }
}

module.exports = AbstractMapper;
