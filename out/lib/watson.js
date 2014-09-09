(function() {
  var Base, PluginManager, TaskGroup, Watson, ncp,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Base = require('./base').Base;

  PluginManager = require('./plugin-manager').PluginManager;

  TaskGroup = require('taskgroup').TaskGroup;

  ncp = require('ncp');

  Watson = (function(_super) {
    __extends(Watson, _super);

    function Watson(opts) {
      var me;
      this.project = opts.project, this.milestone = opts.milestone, this.version = opts.version;
      me = this;
      this.plugin = opts.plugin || new PluginManager;
      Watson.__super__.constructor.apply(this, arguments);
      this.tasks = {
        build: new TaskGroup("Build tasks", {
          concurrency: 3
        }),
        stats: new TaskGroup("Stats update tasks", {
          concurrency: 3
        })
      };
      this.plugin.on("error", function(err) {
        return me.log(err.stack || err, "error");
      });
      this.plugin.on("disabled", function(opts) {
        return me.log("Plugin " + opts.name + " is disabled.", "warn");
      });
      this.plugin.on("enabled", function(opts) {
        return me.log("Plugin " + opts.name + " is enabled.", "warn");
      });
    }


    /*
     * Start stats update
     */

    Watson.prototype.runStats = function(opts) {
      var me;
      me = this;
      this.tasks.stats.done(function(err, results) {
        if (err) {
          me.log(err, "error");
          return;
        }
        return me.log("Done.");
      });
      me.log("Fetching new data ...", "info");
      return this.tasks.stats.run();
    };


    /*
     * Build static website
     */

    Watson.prototype.runBuild = function(opts) {
      var me;
      me = this;
      return ncp("" + (me.getRootPath()) + "/src/web", this.output_dir, function(err) {
        if (err) {
          me.log(err, "error");
          me.log("Build failed", "warn");
          return;
        }
        me.log("Building static website ...");
        me._handleAssets();
        me.tasks.build.done(function(err, results) {
          var data;
          if (err) {
            me.log(err, "error");
            return;
          }
          data = {};
          results.map(function(item) {
            return data[item[1].name] = item[1].data;
          });
          me.writeFileSync("" + me.output_dir + "/stats.json", JSON.stringify(data));
          return me.log("Done.");
        });
        return me.tasks.build.run();
      });
    };


    /*
     * Collect and concatenate assets from plugins
     *
     * @private
     * @return {undefined}
     */

    Watson.prototype._handleAssets = function() {
      var bucket, html, name, plugin, _ref;
      this.log('step: _handleAssets()');
      bucket = {
        'partial': [],
        'styles': [],
        'scripts': []
      };
      html = this.getFileContentSync("" + this.output_dir + "/index.html");
      bucket.styles.push(this.getFileContentSync("" + this.output_dir + "/assets/css/main.css"));
      bucket.scripts.push(this.getFileContentSync("" + this.output_dir + "/assets/js/main.js"));
      _ref = this.plugin.get();
      for (name in _ref) {
        plugin = _ref[name];
        this.log("Collecting assets from plugin " + name, "debug");
        bucket = this._collectAssets(plugin.module, bucket);
      }
      if (bucket.partial) {
        html = html.replace("{{content}}", bucket.partial.join(''));
      }
      html = html.replace("{{build_date}}", new Date());
      this.writeFileSync("" + this.output_dir + "/index.html", html);
      return this._writeAssets(bucket);
    };

    Watson.prototype._writeAssets = function(bucket) {
      if (bucket.styles) {
        this.writeFileSync("" + this.output_dir + "/assets/css/main.css", bucket.styles.join(''));
      }
      if (bucket.scripts) {
        return this.writeFileSync("" + this.output_dir + "/assets/js/main.js", bucket.scripts.join(''));
      }
    };

    Watson.prototype._collectAssets = function(plugin, bucket) {
      var me;
      me = this;
      ['partial', 'styles', 'scripts'].map(function(segment) {
        if (plugin[segment]) {
          return bucket[segment].push(me.getFileContentSync("" + (me.getPluginPath(plugin.name)) + "/" + plugin[segment]));
        }
      });
      return bucket;
    };

    Watson.prototype.addTask = function(group, fn) {
      return this.tasks[group].addTask(fn);
    };


    /*
     * @public
     * @return {Object} Plugin
     */

    Watson.prototype.plugin = function() {
      return this.plugin;
    };

    return Watson;

  })(Base);

  module.exports = Watson;

}).call(this);
