(function() {
  var Base, Client, EventEmitter, fs, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  EventEmitter = require('events').EventEmitter;

  Client = require('./http/client').Client;

  path = require('path');

  fs = require('fs');

  Base = (function(_super) {
    var log_levels, logger;

    __extends(Base, _super);

    logger = {};

    log_levels = ['log', 'info', 'warn', 'error', 'debug'];

    function Base(opts) {
      if (opts == null) {
        opts = {};
      }
      this.output_dir = opts.output_dir;
      this.logger = opts.logger || console;
      this.client = opts.client || new Client;
      if (typeof this.logger['debug'] === 'undefined') {
        this.logger['debug'] = console.log;
      }
    }


    /*
     * @public
     * @return {Object} Client
     */

    Base.prototype.client = function() {
      return this.client;
    };


    /*
     * @public
     * @return {Object}
     */

    Base.prototype.getLogger = function() {
      return this.logger;
    };


    /*
     * @todo: more powerful logger
     */

    Base.prototype.log = function() {
      var args, last, log_level, me;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      me = this;
      log_level = 'info';
      logger = this.getLogger();
      last = args[args.length - 1];
      if (__indexOf.call(log_levels, last) >= 0) {
        log_level = args.pop();
      }
      logger[log_level]("" + (log_level.toUpperCase()) + ": " + (args.join(' ')));
      return this;
    };


    /*
     * Get Watson's path
     *
     * @public
     * @return {String}
     */

    Base.prototype.getRootPath = function() {
      return this._root_path || (this._root_path = path.resolve(__dirname, '..', '..'));
    };


    /*
     * Get path to specified module
     *
     * @public
     * @return {String}
     */

    Base.prototype.getModulePath = function(name) {
      var me;
      me = this;
      return path.resolve(me.getRootPath(), 'node_modules', name);
    };


    /*
     * Get path to specified plugin
     *
     * Just a shortcut
     *
     * @public
     * @return {String}
     */

    Base.prototype.getPluginPath = function(name) {
      var me;
      me = this;
      return me.getModulePath("watson-plugin-" + name);
    };


    /*
     * Check if specified module actually exists
     *
     * @public
     * @return {Bool}
     */

    Base.prototype.isModule = function(name) {
      var err;
      try {
        return fs.lstatSync(this.getModulePath(name)).isDirectory();
      } catch (_error) {
        err = _error;
        return false;
      }
    };


    /*
     * @public
     * @return {String}
     */

    Base.prototype.getFileContentSync = function(file, encoding) {
      var err;
      if (encoding == null) {
        encoding = 'utf-8';
      }
      try {
        return fs.readFileSync(file, encoding);
      } catch (_error) {
        err = _error;
        this.log(err, "error");
        return '';
      }
    };


    /*
     * @public
     * @param {String} file
     * @param {String} content
     * @return {Bool}
     */

    Base.prototype.writeFileSync = function(file, content) {
      var err;
      try {
        fs.writeFileSync(file, content);
        return true;
      } catch (_error) {
        err = _error;
        this.log(err, "error");
        return false;
      }
    };

    return Base;

  })(EventEmitter);

  module.exports = {
    Base: Base
  };

}).call(this);
