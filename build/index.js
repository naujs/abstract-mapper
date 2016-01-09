'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Component = require('@naujs/component'),
    PersistedModel = require('@naujs/persisted-model'),
    util = require('@naujs/util'),
    _ = require('lodash');

function checkFindParam(param) {
  if (!(param instanceof PersistedModel)) {
    throw 'Must be an instance of PersistedModel';
  }
}

function validateCriteria(criteria) {}

var instance = null;

var AbstractMapper = (function (_Component) {
  _inherits(AbstractMapper, _Component);

  function AbstractMapper() {
    _classCallCheck(this, AbstractMapper);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(AbstractMapper).apply(this, arguments));
  }

  _createClass(AbstractMapper, [{
    key: 'executeFind',

    /**
     * These methods must be implemented by concrete mappers
     */

    value: function executeFind(name, criteria) {
      throw 'Must be implemented';
    }
  }, {
    key: 'executeFindAll',
    value: function executeFindAll(name, criteria) {
      throw 'Must be implemented';
    }
  }, {
    key: 'executeFindRelation',
    value: function executeFindRelation(name, relation, criteria) {
      throw 'Must be implemented';
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

      validateCriteria(criteria);
      var name = Model.prototype.name();

      return this.executeFind(name, criteria).then(function (instance) {
        return instance.onAfterFind(options).then(function () {
          return instance;
        });
      });
    }
  }, {
    key: 'findAll',
    value: function findAll(Model, criteria) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      validateCriteria(criteria);

      var name = Model.prototype.name();
      return this.executeFindAll(name, criteria).then(function (instances) {
        var promises = _.map(instances, function (instance) {
          return instance.onAfterFind(options);
        });

        return util.getPromise().all(promises).then(function () {
          return instances;
        });
      });
    }
  }, {
    key: 'findRelation',
    value: function findRelation(model, relationName, criteria) {
      validateCriteria(criteria);
    }
  }, {
    key: 'create',
    value: function create(model, options) {}
  }, {
    key: 'update',
    value: function update(model, options) {}
  }, {
    key: 'save',
    value: function save(model, options) {}
  }, {
    key: 'delete',
    value: function _delete(model, options) {}
  }], [{
    key: 'getInstance',

    /**
     * Gets the singleton instance of this mapper
     * @method AbstractMapper.getInstance
     * @return {AbstractMapper} AbstractMapper
     */
    value: function getInstance() {
      if (!instance) {
        instance = new this();
      }

      return instance;
    }
  }]);

  return AbstractMapper;
})(Component);

module.exports = AbstractMapper;