'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Configure = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _aureliaPath = require('aurelia-path');

var _deepExtend = require('deep-extend');

var _deepExtend2 = _interopRequireDefault(_deepExtend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Configure = exports.Configure = function () {
    function Configure() {
        _classCallCheck(this, Configure);

        this.environment = 'default';
        this.environments = false;
        this.directory = 'config';
        this.config_file = 'config.json';
        this.cascade_mode = true;

        this._config_object = {};
        this._config_merge_object = {};
    }

    Configure.prototype.setDirectory = function setDirectory(path) {
        this.directory = path;
    };

    Configure.prototype.setConfig = function setConfig(name) {
        this.config_file = name;
    };

    Configure.prototype.setEnvironment = function setEnvironment(environment) {
        this.environment = environment;
    };

    Configure.prototype.setEnvironments = function setEnvironments() {
        var environments = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (environments) {
            this.environments = environments;

            this.check();
        }
    };

    Configure.prototype.setCascadeMode = function setCascadeMode() {
        var bool = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        this.cascade_mode = bool;
    };

    Configure.prototype.is = function is(environment) {
        return environment === this.environment;
    };

    Configure.prototype.check = function check() {
        var hostname = window.location.hostname;

        if (this.environments) {
            for (var env in this.environments) {
                var hostnames = this.environments[env];

                if (hostnames) {
                    for (var _iterator = hostnames, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                        var _ref;

                        if (_isArray) {
                            if (_i >= _iterator.length) break;
                            _ref = _iterator[_i++];
                        } else {
                            _i = _iterator.next();
                            if (_i.done) break;
                            _ref = _i.value;
                        }

                        var host = _ref;

                        if (hostname.search(host) !== -1) {
                            this.setEnvironment(env);

                            return;
                        }
                    }
                }
            }
        }
    };

    Configure.prototype.environmentEnabled = function environmentEnabled() {
        return !(this.environment === 'default' || this.environment === '' || !this.environment);
    };

    Configure.prototype.environmentExists = function environmentExists() {
        return this.environment in this.obj;
    };

    Configure.prototype.get = function get(key) {
        var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        var returnVal = defaultValue;

        if (key.indexOf('.') === -1) {
            if (!this.environmentEnabled()) {
                return this.obj[key] ? this.obj[key] : defaultValue;
            }

            if (this.environmentEnabled()) {
                if (this.environmentExists() && this.obj[this.environment][key]) {
                    returnVal = this.obj[this.environment][key];
                } else if (this.cascade_mode && this.obj[key]) {
                    returnVal = this.obj[key];
                }

                return returnVal;
            }
        }

        if (key.indexOf('.') !== -1) {
            var splitKey = key.split('.');
            var parent = splitKey[0];
            var child = splitKey[1];

            if (!this.environmentEnabled()) {
                if (this.obj[parent]) {
                    return this.obj[parent][child] ? this.obj[parent][child] : defaultValue;
                }
            } else {
                if (this.environmentExists() && this.obj[this.environment][parent] && this.obj[this.environment][parent][child]) {
                    returnVal = this.obj[this.environment][parent][child];
                } else if (this.cascade_mode && this.obj[parent] && this.obj[parent][child]) {
                    returnVal = this.obj[parent][child];
                }

                return returnVal;
            }
        }

        return returnVal;
    };

    Configure.prototype.set = function set(key, val) {
        if (key.indexOf('.') === -1) {
            this.obj[key] = val;
        } else {
            var splitKey = key.split('.');
            var parent = splitKey[0];
            var child = splitKey[1];

            if (this.obj[parent] === undefined) {
                this.obj[parent] = {};
            }

            this.obj[parent][child] = val;
        }
    };

    Configure.prototype.merge = function merge(obj) {
        var currentConfig = this._config_object;

        this._config_object = (0, _deepExtend2.default)(currentConfig, obj);
    };

    Configure.prototype.lazyMerge = function lazyMerge(obj) {
        var currentMergeConfig = this._config_merge_object || {};

        this._config_merge_object = (0, _deepExtend2.default)(currentMergeConfig, obj);
    };

    Configure.prototype.setAll = function setAll(obj) {
        this._config_object = obj;
    };

    Configure.prototype.getAll = function getAll() {
        return this.obj;
    };

    Configure.prototype.loadConfig = function loadConfig() {
        var _this = this;

        return this.loadConfigFile((0, _aureliaPath.join)(this.directory, this.config), function (data) {
            return _this.setAll(data);
        }).then(function () {
            if (_this._config_merge_object) {
                _this.merge(_this._config_merge_object);
                _this._config_merge_object = null;
            }
        });
    };

    Configure.prototype.loadConfigFile = function loadConfigFile(path, action) {
        return new Promise(function (resolve, reject) {
            var pathClosure = path.toString();

            var xhr = new XMLHttpRequest();
            xhr.overrideMimeType('application/json');
            xhr.open('GET', pathClosure, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var data = JSON.parse(this.responseText);
                    action(data);
                    resolve(data);
                }
            };

            xhr.onloadend = function () {
                if (xhr.status == 404) {
                    reject('Configuration file could not be found: ' + path);
                }
            };

            xhr.onerror = function () {
                reject('Configuration file could not be found or loaded: ' + pathClosure);
            };

            xhr.send(null);
        });
    };

    Configure.prototype.mergeConfigFile = function mergeConfigFile(path, optional) {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
            _this2.loadConfigFile(path, function (data) {
                _this2.lazyMerge(data);
                resolve();
            }).catch(function (error) {
                if (optional === true) {
                    resolve();
                } else {
                    reject(error);
                }
            });
        });
    };

    _createClass(Configure, [{
        key: 'obj',
        get: function get() {
            return this._config_object;
        }
    }, {
        key: 'config',
        get: function get() {
            return this.config_file;
        }
    }]);

    return Configure;
}();