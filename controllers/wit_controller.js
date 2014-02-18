var wit = require('./wit');
var url = require('url');
var http = require("http");
var sonos_controller = require('./sonos_controller');
/**
 * GET /
 * Home page.
 */

exports.wit = function(req, res) {
	res.render('wit', {
    	title: 'wit'
  	});	
};

//exports.handle_transcript = function(transcript){
//    var wit_request = wit.request_wit(transcript);
//    wit_request.when(function(err, response) {
//        if (err) console.log(err); // handle error here
//
//        var wemoSwitch = new WeMo('192.168.0.18',3083);
//        wemoSwitch.setBinaryState(0, function(err, result) { // switch on
//            if (err) console.error(err);
//            //console.log(result); // 1
//            wemoSwitch.getBinaryState(function(err, result) {
//                if (err) console.error(err);
//                //console.log(result); // 1
//            });
//        });
//        var data = response.outcome.intent;
//        if (data == "toggle_light")
//        {
//            //toggle_light();
//
//
//        };
//
//    });
//};

function toggle_light() {
    console.log("toggling the light");
    var options = {
        host: 'localhost',
        port: 5000,
        path: '/api/device/little_light',
        method: 'POST'
    };

    var req = http.request(options, function (res) {
        console.log("success");
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function () {
            console.log(output);
        });
    });

    req.on('error', function (err) {
        console.log(err);
    });

    req.end();
}
exports.handle_transcript = function(transcript){
    var wit_request = wit.request_wit(transcript);
    wit_request.when(function(err, response) {
        if (err) console.log(err); // handle error here

        var data = response.outcome.intent;
        var confidence = response.outcome.confidence;
        var entity = response.outcome.entities.value;

        if (data == "toggle_light") {
            if (confidence > 0.6){
                toggle_light();
            };
        } else if (data == "music_interaction"){
            if (confidence > 0.6){
                if (entity == 'on'){
                    sonos_controller.play();
                };

            };
        };

    });
};

exports.receive_intent = function(data) {
	if (data.intent == "toggle_light")
	{
		console.log("toggling the light");
		var options = {
		    host: 'localhost',
		    port: 5000,
		    path: '/api/device/little_light',
		    method: 'POST'
		};

	    var req = http.request(options, function(res)
	    {
	    	console.log("success");
	        var output = '';
	        console.log(options.host + ':' + res.statusCode);
	        res.setEncoding('utf8');

	        res.on('data', function (chunk) {
	            output += chunk;
	        });

	        res.on('end', function() {
	            console.log(output);
	        });
	    });

	    req.on('error', function(err) {
	        console.log(err);
	    });

	    req.end();
	};
};

// exports.receive_intent = function(req, res, next) {
// 	console.log("hi");
// 	if (req.body.intent == "toggle_light")
// 	{
// 		console.log("toggling the light");
// 		var options = {
// 		    host: 'localhost',
// 		    port: 5000,
// 		    path: '/api/device/little_light',
// 		    method: 'POST'
// 		};

// 	    var req = http.request(options, function(res)
// 	    {
// 	    	console.log("success");
// 	        var output = '';
// 	        console.log(options.host + ':' + res.statusCode);
// 	        res.setEncoding('utf8');

// 	        res.on('data', function (chunk) {
// 	            output += chunk;
// 	        });

// 	        res.on('end', function() {
// 	            console.log(output);
// 	        });
// 	    });

// 	    req.on('error', function(err) {
// 	        console.log(err);
// 	    });

// 	    req.end();
// 	};
// };
