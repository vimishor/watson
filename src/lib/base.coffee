{EventEmitter}  = require('events')
{Client}        = require('./http/client')
path            = require('path')
fs              = require('fs')

class Base extends EventEmitter

    logger      = {}
    log_levels  = ['log', 'info', 'warn', 'error', 'debug']

    constructor: (opts = {}) ->
        { @output_dir } = opts

        @logger     = opts.logger || console
        @client     = opts.client || new Client

        # for console
        if typeof @logger['debug'] is 'undefined'
            @logger['debug'] = console.log

    ###
    # @public
    # @return {Object} Client
    ###
    client: () ->
        return @client

    ###
    # @public
    # @return {Object}
    ###
    getLogger: () ->
        return @logger

    ###
    # @todo: more powerful logger
    ###
    log: (args...) ->
        me          = @
        log_level   = 'info'
        logger      = @getLogger()

        [..., last] = args
        
        if last in log_levels
            log_level = args.pop()

        logger[log_level] "#{log_level.toUpperCase()}: #{args.join(' ')}"

        @

    ###
    # Get Watson's path
    #
    # @public
    # @return {String}
    ###
    getRootPath: () ->
        return @_root_path || @_root_path = path.resolve __dirname, '..', '..'

    ###
    # Get path to specified module
    #
    # @public
    # @return {String}
    ###
    getModulePath: (name) ->
        me = @
        return path.resolve me.getRootPath(), 'node_modules', name

    ###
    # Get path to specified plugin
    #
    # Just a shortcut
    #
    # @public
    # @return {String}
    ###
    getPluginPath: (name) ->
        me = @
        return me.getModulePath "watson-plugin-#{name}"

    ###
    # Check if specified module actually exists
    #
    # @public
    # @return {Bool}
    ###
    isModule: (name) ->
        try
            return fs.lstatSync(@getModulePath(name)).isDirectory()
        catch err
            return false

    ###
    # @public
    # @return {String}
    ###
    getFileContentSync: (file, encoding = 'utf-8') ->
        try
            return fs.readFileSync file, encoding
        catch err
            @log err, "error"
            return ''

    ###
    # @public
    # @param {String} file
    # @param {String} content
    # @return {Bool}
    ###
    writeFileSync: (file, content) ->
        try
            fs.writeFileSync file, content
            return true
        catch err
            @log err, "error"
            return false
        
module.exports = {Base}
