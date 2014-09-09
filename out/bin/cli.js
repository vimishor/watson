(function() {
  var Watson, commander, initWatson, list, validateGlobalOptions, version;

  commander = require('commander');

  Watson = require('../lib/watson');

  version = require('package.json').version;

  validateGlobalOptions = function(opts) {
    if (!(opts.project && opts.milestone)) {
      return {
        error: true,
        message: 'No project and/or milestone has been specified.'
      };
    }
    if (!opts.plugins) {
      return {
        error: true,
        message: 'No plugins specified.'
      };
    }
    return {
      error: false
    };
  };

  list = function(val) {
    return val.split(',');
  };


  /*
   * Instantiate Watson and register plugins
   *
   * @return {Object} Watson
   */

  initWatson = function(opts) {
    var plugin, plugins, watson, _i, _len;
    plugins = opts.plugins;
    delete opts.plugins;
    watson = new Watson(opts);
    for (_i = 0, _len = plugins.length; _i < _len; _i++) {
      plugin = plugins[_i];
      watson.plugin.register(plugin, watson);
    }
    return watson;
  };

  commander.version(version).option('-p, --project <project>', 'Project name').option('-m, --milestone <milestone>', 'Milestone name').option('-d, --debug [level]', 'Debug', parseInt).option('--plugins <items>', 'Plugins to load.', list);

  commander.command('update').description('Fetch statistics from remote API(s)').action(function(opts) {
    var validation, watson;
    validation = validateGlobalOptions(opts.parent);
    if (validation.error) {
      console.error(validation.message);
      process.exit(1);
    }
    watson = initWatson({
      project: opts.parent.project,
      milestone: opts.parent.milestone,
      version: version,
      plugins: opts.parent.plugins,
      log_level: opts.parent.debug || 6
    });
    return watson.runStats(opts);
  });

  commander.command('build').description('Build static website.').option('-o, --output', 'Output directory where to store generated website.').action(function(opts) {
    var validation, watson;
    validation = validateGlobalOptions(opts.parent);
    if (validation.error) {
      console.error(validation.message);
      process.exit(1);
    }
    if (!opts.output) {
      opts.output = require('path').resolve(__dirname, '..', '..', 'build');
    }
    watson = initWatson({
      project: opts.parent.project,
      milestone: opts.parent.milestone,
      version: version,
      plugins: opts.parent.plugins,
      log_level: opts.parent.debug || 6,
      output_dir: opts.output
    });
    return watson.runBuild(opts);
  });

  if (commander.parse(process.argv).args.length === 0 && process.argv.length === 2) {
    commander.help();
  }

}).call(this);
