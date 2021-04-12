const button = document.querySelector(".talk"); //bind button
const content = document.querySelector(".content"); //bind content (h3 in div)
const mic = document.querySelector(".mic"); //bind microphone icon

const remoteIP = `https://${window.location.host}`;

// load speech Recognition function
const SpeechRecognition = window.webkitSpeechRecognition;

const rec = new SpeechRecognition();

let isRecording = false;
const RECORD = "recording";
const STOP = "stop";

function status(status) {
  const msg = button.querySelector("h1");
  switch (status) {
    case "recording":
      isRecording = true;
      msg.textContent = "Listening ...";
      mic.classList.add("blink_me"); //start blink microphone icon
      content.textContent = "";
      break;
    case "stop":
      isRecording = false;
      msg.textContent = "Tap to talk!";
      mic.classList.remove("blink_me"); //stop blink microphone icon
      break;
    default:
      break;
  }
}

function sendPostRequest(message) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest(); //prepare Server Request
    let url = `${remoteIP}/recognition`; // set server api url
    xhr.open("POST", url); //set Request to post
    xhr.setRequestHeader("Content-type", "application/json"); //prepare Request header
    //xhr.responseType = "json";
    let data = JSON.stringify(message);
    xhr.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 200) {
          resolve({
            text: `Successfully sent: ${JSON.stringify(
              message
            )}: Ready State: ${this.response}`,
            response: JSON.parse(this.response),
          });
        } else {
          reject(
            Error(
              `An error occurred by sending ${JSON.stringify(
                message
              )}! error code: ${this.response}`
            )
          );
        }
      }
    };
    xhr.onerror = () => {
      reject("There was a network error!");
    };
    xhr.send(data); //Send spoken sentence to api via Post Request
  });
}

//On Recording start...
rec.onstart = () => {
  let request = sendPostRequest({ status: "recStart" });
  request.then(
    (response) => {
      status(RECORD);
    },
    (error) => {
      console.error(error);
    }
  );
};

rec.onend = () => {
  status(STOP);
};

//On Recording finish...
rec.onresult = (message) => {
  isRecording = false;
  let resultIndex = event.resultIndex; //store message index
  let request = sendPostRequest({
    status: "recStop",
    message: event.results[resultIndex][0].transcript,
  });
  request.then(
    (response) => {
      let mood = response.response.mood ? response.response.mood : null;
      content.innerHTML = `Erkennung: "${
        message.results[resultIndex][0].transcript
      }"<br>Auswertung: ${mood ? mood : "Keine Stimmung erkannt."}`; //print message to the user on the screen
    },
    (error) => {
      console.error(error);
    }
  );
};

//Make Screen clickable
button.addEventListener("click", () => {
  isRecording ? rec.stop() : rec.start(); //on click start recording or abort
});
