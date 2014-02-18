/**
 * Created by bweidlich on 2/16/14.
 */
var Sonos = require('sonos').Sonos;
var sonos = new Sonos('192.168.0.22');

exports.play = function(){

    sonos.play(function(err, playing) {
        console.log([err, playing]);
    });
};

exports.stop = function(){

    sonos.stop(function(err, playing) {
        console.log([err, playing]);
    });
};

exports.louder = function(){
    sonos.getVolume(function(err, volume) {
        if (err) console.log(err);
        sonos.setVolume(volume + 5, function(err, data){
            if (err) console.log(err);
            if (data) console.log(data);
        });
    });
};

exports.quieter = function(){
    sonos.getVolume(function(err, volume) {
        if (err) console.log(err);
        sonos.setVolume(volume - 5, function(err, data){
            if (err) console.log(err);
            if (data) console.log(data);
        });
    });
};