(function(window, undefined) {
	var recorder = '' + 
'<div style="display:none">' + 
'    <span><a id="download" ><button type="button"> Download</button></a></span>' + 
'    <button type="button" id="stop" disabled>Stop</button>' + 
'    <button type="button" onclick="window.tracker.recordAudio()">Record Audio</button>' + 
'    <button type="button" onclick="window.tracker.recordVideo()">Record Video</button>' + 
'    <button type="button" onclick="window.tracker.recordScreen()">Record Screen</button>' + 
'    <div>' + 
'        <video autoplay height=\'480\' width="640" muted></video>' + 
'    </div>' + 
'    </div>' + 
'';
	var modal = '' + 
'<div id="myModal" class="modal">' + 
'' + 
'  <!-- Modal content -->' + 
'  <div class="modal-content">' + 
'    <span class="titleFont">Feedback composer</span><span class="close">&times;</span>' + 
'    <div class="displayFlex row mt45"><span class="basis20px">From</span><span class="flex1"><input class="w80 inputBox" value="ccsuser@cision.com" /></span></div>' + 
'	<div class="displayFlex row"><span class="basis20px">To</span><span class="flex1"><input  value="userssupport@cision.com" class="w80 inputBox" /></span></div>' + 
'	<div class="displayFlex row"><span class="basis20px">Subject</span><span class="flex1"><input class="w80 inputBox" value="Can someone please look into this ?" /></span></div>' + 
'	<div class="displayFlex row"><span class="basis20px">Body</span><span class="flex1"><textarea class="w80 inputArea" >Hi Team<br>Im facing a issue, Need a fix for this. <br>Thank you<br>-<br>User</textarea></span></div>' + 
'	<div class="displayFlex row"><span class="basis20px"></span><span class="btnContainer"><input class="inputBtn" type="button" value="Send" /></span></div>' + 
'  </div>' + 
'' + 
'</div>' + 
'';
 var divg = document.createElement("span");
document.body.appendChild(divg);
divg.innerHTML = recorder + modal;
  window.tracker = window.tracker || {};
	event = {onStartRecording: new Event('onStartRecording'), onStopRecording: new Event('onStopRecording')};
  
	let shouldStop = false;
	let stopped = false;
	let videoElement = document.getElementsByTagName("video")[0];
	let downloadLink = document.getElementById('download');
	let stopButton = document.getElementById('stop');
	
	let startRecord =() => {
		document.getElementsByTagName('body')[0].dispatchEvent(event.onStartRecording);
	}
	let stopRecord =()=> {
		document.getElementsByTagName('body')[0].dispatchEvent(event.onStopRecording);
	}
	let audioRecordConstraints = {
		echoCancellation: true
	}
	stopButton.addEventListener('click', function () {
		shouldStop = true;
	});

	let handleRecord = function ({stream, mimeType}) {
		startRecord()
		let recordedChunks = [];
		stopped = false;
		const mediaRecorder = new MediaRecorder(stream);

		mediaRecorder.ondataavailable = function (e) {
			if (e.data.size > 0) {
				recordedChunks.push(e.data);
			}

			if (shouldStop === true && stopped === false) {
				mediaRecorder.stop();
				stopped = true;
				setTimeout(function(){
				document.getElementById('download').click();
				}, 2000);
				
			}
		};

		mediaRecorder.onstop = function () {
			const blob = new Blob(recordedChunks, {
				type: mimeType
			});
			recordedChunks = []
			const filename = window.prompt('Enter file name');
			downloadLink.href = URL.createObjectURL(blob);
			downloadLink.download = `${filename || 'recording'}.webm`;
			stopRecord();
			videoElement.srcObject = null;
			modal.style.display = "block";
		};

		mediaRecorder.start(200);
	};

	async function recordAudio() {
		const mimeType = 'audio/webm';
		shouldStop = false;
		const stream = await navigator.mediaDevices.getUserMedia({audio: audioRecordConstraints});
		handleRecord({stream, mimeType})
	}

	async function recordVideo() {
		const mimeType = 'video/webm';
		shouldStop = false;
		const constraints = {
			audio: {
				"echoCancellation": true
			},
			video: {
				"width": {
					"min": 640,
					"max": 1024
				},
				"height": {
					"min": 480,
					"max": 768
				}
			}
		};
		const stream = await navigator.mediaDevices.getUserMedia(constraints);
		videoElement.srcObject = stream;
		handleRecord({stream, mimeType})
	}

	async function recordScreen() {
		const mimeType = 'video/webm';
		shouldStop = false;
		const constraints = {
			video: {
				cursor: 'motion'
			}
		};
		if(!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) {
			return window.alert('Screen Record not supported!')
		}
		let stream = null;
		const displayStream = await navigator.mediaDevices.getDisplayMedia({video: {cursor: "motion"}, audio: {'echoCancellation': true}});
		if(window.confirm("Record audio with screen?")){
			const audioContext = new AudioContext();

			const voiceStream = await navigator.mediaDevices.getUserMedia({ audio: {'echoCancellation': true}, video: false });
			const userAudio = audioContext.createMediaStreamSource(voiceStream);
			
			const audioDestination = audioContext.createMediaStreamDestination();
			userAudio.connect(audioDestination);

			if(displayStream.getAudioTracks().length > 0) {
				const displayAudio = audioContext.createMediaStreamSource(displayStream);
				displayAudio.connect(audioDestination);
			}

			const tracks = [...displayStream.getVideoTracks(), ...audioDestination.stream.getTracks()]
			stream = new MediaStream(tracks);
			handleRecord({stream, mimeType})
		} else {
			stream = displayStream;
			handleRecord({stream, mimeType});
		};
		videoElement.srcObject = stream;
	}

	tracker.recordAudio = recordAudio;
	tracker.recordVideo = recordVideo;
	tracker.recordScreen = recordScreen;
	
	// define a handler
	function doc_keyUp(e) {
		// this would test for whichever key is 40 (down arrow) and the ctrl key at the same time
		if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
			// call your function to do the thing
			tracker.recordAudio();
		}
		if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'v') {
			// // call your function to do the thing
			tracker.recordVideo();
		}
		console.log(e.shiftKey)
		if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
			// call your function to do the thing
			tracker.recordScreen();
		}
		
		if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
			// call your function to do the thing
			shouldStop = true;
			stopRecord();
		}
	}
	// register the handler 
	document.addEventListener('keyup', doc_keyUp, false);
	
	
	
	// Get the modal
	var modal = document.getElementById("myModal");

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
	  modal.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	  if (event.target == modal) {
		modal.style.display = "none";
	  }
	}
}(window));
     
