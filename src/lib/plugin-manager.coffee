{Base} = require('./base')

class PluginManager extends Base
    _plugins: {}

    constructor: (opts) ->
        super


    ###
    # @public
    # @param {String} name
    # @return {Bool}
    ###
    exists: (name) ->
        return name of @_plugins


    ###
    # Check if plugin has minimal required metadata
    #
    # @public
    # @param {String} name
    # @return {Bool}
    ###
    hasMeta: (plugin) ->
        if not plugin.name or not plugin.version
            return false

        return true


    ###
    # @public
    # @param {String} name
    # @return {Bool}
    ###
    register: (name, watson = {}) ->
        me = @

        if me.exists name
            me.emit "error", new Error("Plugin #{name} is already loaded.")
            return

        try
            module = require("watson-plugin-#{name}")(watson)
        catch e
            me.emit "error", e
            return

        if module
            @_plugins[module.name] = { module: module }


    ###
    # @public
    # @params {String=} name
    # @return {Bool}
    ###
    get: (name = '') ->
        me = @

        if not name
            return me._plugins

        if not me.exists name
            return null

        return @_plugins[name].module
    

module.exports = {PluginManager}
