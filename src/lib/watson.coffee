{Base}          = require('./base')
{PluginManager} = require('./plugin-manager')
{TaskGroup}     = require('taskgroup')
ncp             = require('ncp')

class Watson extends Base

    constructor: (opts) ->
        { @project, @milestone, @version } = opts

        me          = @
        @plugin     = opts.plugin || new PluginManager

        super

        @tasks = {
            build: new TaskGroup "Build tasks", concurrency:3
            stats: new TaskGroup "Stats update tasks", concurrency:3
        }

        @plugin.on "error", (err) ->
            me.log err.stack || err, "error"

        @plugin.on "disabled", (opts) ->
            me.log  "Plugin #{opts.name} is disabled." , "warn"

        @plugin.on "enabled", (opts) ->
            me.log  "Plugin #{opts.name} is enabled." , "warn"

    ###
    # Start stats update
    ###
    runStats: (opts) ->
        me = @

        @tasks.stats.done (err, results) ->
            if err
                me.log err, "error"
                return

            me.log "Done."

        me.log "Fetching new data ...", "info"
        @tasks.stats.run()

    ###
    # Build static website
    ###
    runBuild: (opts) ->
        me = @
        
        # populate build dir
        ncp "#{me.getRootPath()}/src/web", @output_dir, (err) ->
            if err
                me.log err, "error"
                me.log "Build failed", "warn"
                return

            me.log "Building static website ..."
            
            # 1. collect and handle assets from plugins
            me._handleAssets()
            
            # 2. collect data from plugins
            me.tasks.build.done (err, results) ->
                if err
                    me.log err, "error"
                    return

                # data = []
                # results.map (item) ->
                #     data.push(item[1])

                data = {}
                results.map (item) ->
                    data[item[1].name] = item[1].data

                # @todo: handle errors
                me.writeFileSync "#{me.output_dir}/stats.json", JSON.stringify(data)
                me.log "Done."

            me.tasks.build.run()

    ###
    # Collect and concatenate assets from plugins
    #
    # @private
    # @return {undefined}
    ###
    _handleAssets: () ->
        @log 'step: _handleAssets()'
        
        bucket = { 'partial': [], 'styles': [], 'scripts': [] }

        # start with main files
        html = @getFileContentSync "#{@output_dir}/index.html"
        bucket.styles.push @getFileContentSync "#{@output_dir}/assets/css/main.css"
        bucket.scripts.push @getFileContentSync "#{@output_dir}/assets/js/main.js"

        # include files from plugins
        for name, plugin of @plugin.get()
            @log "Collecting assets from plugin #{name}", "debug"

            bucket = @_collectAssets(plugin.module, bucket)

        if bucket.partial
            html = html.replace "{{content}}", bucket.partial.join('')

        html = html.replace "{{build_date}}", new Date()

        # write main html and assets file(s)
        @writeFileSync "#{@output_dir}/index.html", html
        @_writeAssets(bucket)

    _writeAssets: (bucket) ->
        if bucket.styles
            @writeFileSync "#{@output_dir}/assets/css/main.css", bucket.styles.join('')

        if bucket.scripts
            @writeFileSync "#{@output_dir}/assets/js/main.js", bucket.scripts.join('')

    _collectAssets: (plugin, bucket) ->
        me = @
        ['partial', 'styles', 'scripts'].map (segment) ->
            if plugin[segment]
                bucket[segment].push me.getFileContentSync("#{me.getPluginPath(plugin.name)}/#{plugin[segment]}")

        return bucket

    addTask: (group, fn) ->
        @tasks[group].addTask(fn)

    ###
    # @public
    # @return {Object} Plugin
    ###
    plugin: () ->
        return @plugin
    
module.exports = Watson
