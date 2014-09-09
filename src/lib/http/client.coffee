req         = require('request')
url         = require('url')
querystring = require('querystring')
pkg         = require('package.json')

###
# Simple HTTP client
###
class Client
    _user_agent = "watson/#{pkg.version} (#{pkg.repository.url})"

    get: (link, params = {}, cb) ->
        client = @
        client.request link, params, "GET", {}, cb

    request: (link, params, method, headers, cb) ->
        client  = @
        link    = url.parse "#{link}?#{querystring.stringify(params)}"

        options = {
            uri: link,
            method: 'GET'
            headers: { 'user-agent': @_user_agent }
        }

        req options, (err, response, body) ->
            if err
                return cb(err, null)

            if response.statusCode < 200 || response.statusCode > 200
                return cb(new Error "Response code was #{response.statusCode}", null)

            return cb(null, body)
    
module.exports = {Client}
