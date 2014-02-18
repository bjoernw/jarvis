var socket = io.connect('http://localhost');




var mic = new Wit.Microphone(document.getElementById("microphone"));
var info = function (msg) {
  document.getElementById("info").innerHTML = msg;
};
mic.onready = function () {
  info("Microphone is ready to record");
};
mic.onaudiostart = function () {
  info("Recording started");
};
mic.onaudioend = function () {
  info("Recording stopped, processing started");
};
mic.onerror = function (err) {
  info("Error: " + err);
};
mic.onresult = function (intent, entities) {
  var r = kv("intent", intent);
  var data = { "intent": intent, "entities": entities };
  socket.emit('voice_event',data);
  //$.post( "/wit/receive",  data);

  document.getElementById("result").innerHTML = r;
};
mic.connect("FUUCK4O7DSWJ2WUQKBRWN423XRHHVTE6");
// mic.start();
// mic.stop();

function kv (k, v) {
  if (toString.call(v) !== "[object String]") {
    v = JSON.stringify(v);
  }
  return k + "=" + v + "\n";
}