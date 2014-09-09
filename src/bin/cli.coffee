commander   = require('commander')
Watson      = require('../lib/watson')
version     = require('package.json').version

validateGlobalOptions = (opts) ->
    unless opts.project and opts.milestone
        return {
            error: true,
            message: 'No project and/or milestone has been specified.'
        }

    unless opts.plugins
        return {
            error: true
            message: 'No plugins specified.'
        }

    return { error: false }


list = (val) ->
    return val.split(',')

###
# Instantiate Watson and register plugins
#
# @return {Object} Watson
###
initWatson = (opts) ->
    plugins = opts.plugins
    delete opts.plugins

    watson = new Watson opts

    for plugin in plugins
        watson.plugin.register plugin, watson

    return watson



commander
    .version(version)
    .option('-p, --project <project>', 'Project name')
    .option('-m, --milestone <milestone>', 'Milestone name')
    .option('-d, --debug [level]', 'Debug', parseInt)
    .option('--plugins <items>', 'Plugins to load.', list)


commander
    .command('update')
    .description('Fetch statistics from remote API(s)')
    .action (opts) ->
        validation = validateGlobalOptions opts.parent

        if validation.error
            console.error validation.message
            process.exit 1

        watson = initWatson {
            project:    opts.parent.project,
            milestone:  opts.parent.milestone,
            version:    version,
            plugins:    opts.parent.plugins,
            log_level:  opts.parent.debug || 6
        }

        watson.runStats(opts)

commander
    .command('build')
    .description('Build static website.')
    .option('-o, --output', 'Output directory where to store generated website.')
    .action (opts) ->
        validation = validateGlobalOptions opts.parent

        if validation.error
            console.error validation.message
            process.exit 1

        if not opts.output
            opts.output = require('path').resolve __dirname, '..', '..', 'build'

        watson = initWatson {
            project:    opts.parent.project,
            milestone:  opts.parent.milestone,
            version:    version,
            plugins:    opts.parent.plugins,
            log_level:  opts.parent.debug || 6,
            output_dir: opts.output
        }

        watson.runBuild(opts)

# Parse and fallback to help if no args
if commander.parse(process.argv).args.length is 0 and process.argv.length is 2
    commander.help()
