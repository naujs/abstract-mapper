'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Component = require('@naujs/component'),
    PersistedModel = require('@naujs/persisted-model'),
    util = require('@naujs/util'),
    Promise = util.getPromise(),
    _ = require('lodash');

function checkPersistedModel(param) {
  if (!(param instanceof PersistedModel)) {
    throw 'Must be an instance of PersistedModel';
  }
}

function onAfterFind(instance, options) {
  var onAfterFind = instance.onAfterFind(options);

  return util.tryPromise(onAfterFind).then(function () {
    return instance;
  });
}

function onBeforeCreate(instance, options) {
  var onBeforeCreate = instance.onBeforeCreate(options);

  return util.tryPromise(onBeforeCreate).then(function (result) {
    if (!result) {
      return false;
    }

    return instance;
  });
}

function onAfterCreate(instance, options) {
  var onAfterCreate = instance.onAfterCreate(options);

  return util.tryPromise(onAfterCreate).then(function () {
    return instance;
  });
}

function onBeforeUpdate(instance, options) {
  var onBeforeUpdate = instance.onBeforeUpdate(options);

  return util.tryPromise(onBeforeUpdate).then(function (result) {
    if (!result) {
      return false;
    }

    return instance;
  });
}

function onAfterUpdate(instance, options) {
  var onAfterUpdate = instance.onAfterUpdate(options);

  return util.tryPromise(onAfterUpdate).then(function () {
    return instance;
  });
}

var instance = null;

var DataMapper = (function (_Component) {
  _inherits(DataMapper, _Component);

  function DataMapper(connector) {
    _classCallCheck(this, DataMapper);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DataMapper).call(this));

    if (!connector) {
      throw 'Must provide connector';
    }

    _this._connector = connector;
    return _this;
  }

  _createClass(DataMapper, [{
    key: 'getConnector',
    value: function getConnector() {
      return this._connector;
    }

    /**
     * Finds one model instance based on the criteria
     * @param  {PersistedModel} Model
     * @return {PersistedModel | null}
     */

  }, {
    key: 'find',
    value: function find(Model, criteria) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var name = Model.prototype.modelName();
      return this.getConnector().find(name, criteria, options).then(function (result) {
        if (!result) {
          return null;
        }

        var instance = new Model(result);

        return onAfterFind(instance, options).then(function () {
          return instance;
        });
      });
    }
  }, {
    key: 'findByPk',
    value: function findByPk(Model, value) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var pk = Model.prototype.primaryKey();

      var where = {};
      where[pk] = value;

      return this.find(Model, {
        where: where
      }, options);
    }
  }, {
    key: 'findAll',
    value: function findAll(Model, criteria) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var name = Model.prototype.modelName();
      return this.getConnector().findAll(name, criteria, options).then(function (results) {
        if (!_.isArray(results) || !_.size(results)) {
          return [];
        }

        var promises = _.map(results, function (result) {
          var instance = new Model(result);
          return onAfterFind(instance, options).then(function () {
            return instance;
          });
        });

        return Promise.all(promises);
      });
    }
  }, {
    key: 'findRelation',
    value: function findRelation(model, relationName, criteria) {}
  }, {
    key: 'create',
    value: function create(model) {
      var _this2 = this;

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      checkPersistedModel(model);

      if (!model.isNew()) {
        return Promise.reject('Cannot create old model');
      }

      return model.validate(options).then(function (result) {
        if (!result) {
          return false;
        }

        return onBeforeCreate(model, options).then(function (result) {
          if (!result) {
            return false;
          }

          var attributes = model.getPersistableAttributes();
          var name = model.modelName();

          return _this2.getConnector().create(name, attributes, options).then(function (result) {
            model.setAttributes(result);
            return onAfterCreate(model, options);
          });
        });
      });
    }
  }, {
    key: 'update',
    value: function update(model) {
      var _this3 = this;

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      checkPersistedModel(model);

      if (model.isNew()) {
        return Promise.reject('Cannot update new model');
      }

      return model.validate(options).then(function (result) {
        if (!result) {
          return false;
        }

        return onBeforeUpdate(model, options).then(function (result) {
          if (!result) {
            return false;
          }

          var attributes = model.getPersistableAttributes();
          var name = model.modelName();
          var criteria = {};
          var primaryKey = model.primaryKey();
          criteria[primaryKey] = model.getPrimaryKeyValue();

          return _this3.getConnector().update(name, criteria, attributes, options).then(function (result) {
            model.setAttributes(result);
            return onAfterUpdate(model, options);
          });
        });
      });
    }
  }, {
    key: 'save',
    value: function save(model) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      checkPersistedModel(model);

      if (model.isNew()) {
        return this.create(model, options);
      }
      return this.update(model, options);
    }
  }, {
    key: 'delete',
    value: function _delete(model) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      checkPersistedModel(model);

      if (model.isNew()) {
        return Promise.reject('Cannot delete new model');
      }
    }
  }]);

  return DataMapper;
})(Component);

module.exports = DataMapper;