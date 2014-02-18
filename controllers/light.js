var http = require('http');
var Future = require('futures').future;
var request = require('request');

var toggle_light = function() {

    var options = {
      uri: 'http://localhost:5000/api/device/little_light',
      method: 'POST',
      json: {
        "state": "toggle"
      }
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body.id) // Print the shortened url.
        }
    });
}

module.exports.toggle_light = toggle_light;