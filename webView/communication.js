const button = document.querySelector(".talk"); //bind button
const content = document.querySelector(".content"); //bind content (h3 in div)
const mic = document.querySelector(".mic"); //bind microphone icon

const remoteIP = `http://${window.location.host}`;

console.log(remoteIP);

// load speech Recognition function
const SpeechRecognition = window.webkitSpeechRecognition;

const rec = new SpeechRecognition();

function sendPostRequest(message) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest(); //prepare Server Request
    let url = `${remoteIP}/recognition`; // set server api url
    console.log(url);
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
      //console.log(response);
      mic.classList.add("blink_me"); //start blink microphone icon
    },
    (error) => {
      console.error(error);
    }
  );
  //console.log("Recognition started"); // print to the console
};

//On Recording finish...
rec.onresult = (message) => {
  let resultIndex = event.resultIndex; //store message index
  let request = sendPostRequest({
    status: "recStop",
    message: event.results[resultIndex][0].transcript,
  });
  request.then(
    (response) => {
      //console.log(response);
      let mood = response.response.mood ? response.response.mood : null;
      content.innerHTML = `Erkennung: "${
        message.results[resultIndex][0].transcript
      }"<br>Auswertung: ${mood ? mood : "Keine Stimmung erkannt."}`; //print message to the user on the screen
      //mic.classList.remove("blink_me"); //stop blink microphone icon
    },
    (error) => {
      console.error(error);
    }
  );
};

rec.onsoundend = () => {
  mic.classList.remove("blink_me"); //stop blink microphone icon
};

//Make Screen clickable
button.addEventListener("click", () => {
  rec.start(); //on click start recording
});
