exports.init = function(io, witController){
	io.sockets.on('connection', function (socket) {
        socket.on('voice_event', function (data) {
            console.log(data);
            witController.receive_intent(data);
        });
        socket.on('transcript_received', function (transcript) {
            witController.handle_transcript(transcript);
        });
	});
}