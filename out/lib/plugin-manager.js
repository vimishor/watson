(function() {
  var Base, PluginManager,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Base = require('./base').Base;

  PluginManager = (function(_super) {
    __extends(PluginManager, _super);

    PluginManager.prototype._plugins = {};

    function PluginManager(opts) {
      PluginManager.__super__.constructor.apply(this, arguments);
    }


    /*
     * @public
     * @param {String} name
     * @return {Bool}
     */

    PluginManager.prototype.exists = function(name) {
      return name in this._plugins;
    };


    /*
     * Check if plugin has minimal required metadata
     *
     * @public
     * @param {String} name
     * @return {Bool}
     */

    PluginManager.prototype.hasMeta = function(plugin) {
      if (!plugin.name || !plugin.version) {
        return false;
      }
      return true;
    };


    /*
     * @public
     * @param {String} name
     * @return {Bool}
     */

    PluginManager.prototype.register = function(name, watson) {
      var e, me, module;
      if (watson == null) {
        watson = {};
      }
      me = this;
      if (me.exists(name)) {
        me.emit("error", new Error("Plugin " + name + " is already loaded."));
        return;
      }
      try {
        module = require("watson-plugin-" + name)(watson);
      } catch (_error) {
        e = _error;
        me.emit("error", e);
        return;
      }
      if (module) {
        return this._plugins[module.name] = {
          module: module
        };
      }
    };


    /*
     * @public
     * @params {String=} name
     * @return {Bool}
     */

    PluginManager.prototype.get = function(name) {
      var me;
      if (name == null) {
        name = '';
      }
      me = this;
      if (!name) {
        return me._plugins;
      }
      if (!me.exists(name)) {
        return null;
      }
      return this._plugins[name].module;
    };

    return PluginManager;

  })(Base);

  module.exports = {
    PluginManager: PluginManager
  };

}).call(this);
