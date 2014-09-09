(function() {
  var Client, pkg, querystring, req, url;

  req = require('request');

  url = require('url');

  querystring = require('querystring');

  pkg = require('package.json');


  /*
   * Simple HTTP client
   */

  Client = (function() {
    var _user_agent;

    function Client() {}

    _user_agent = "watson/" + pkg.version + " (" + pkg.repository.url + ")";

    Client.prototype.get = function(link, params, cb) {
      var client;
      if (params == null) {
        params = {};
      }
      client = this;
      return client.request(link, params, "GET", {}, cb);
    };

    Client.prototype.request = function(link, params, method, headers, cb) {
      var client, options;
      client = this;
      link = url.parse("" + link + "?" + (querystring.stringify(params)));
      options = {
        uri: link,
        method: 'GET',
        headers: {
          'user-agent': this._user_agent
        }
      };
      return req(options, function(err, response, body) {
        if (err) {
          return cb(err, null);
        }
        if (response.statusCode < 200 || response.statusCode > 200) {
          return cb(new Error("Response code was " + response.statusCode, null));
        }
        return cb(null, body);
      });
    };

    return Client;

  })();

  module.exports = {
    Client: Client
  };

}).call(this);
