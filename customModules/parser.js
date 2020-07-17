const fs = require("fs"); //get filesystem operations

const wordsJSON = fs.readFileSync("./words.json"); //read Buzzword List from file

const compTable = JSON.parse(wordsJSON); //convert Buzzword list to JSON Object
const compAdr = compTable.adressee;
const compVoc = compTable.vocab;

module.exports = (messageString) => {
  splitMessage = messageString.split(" "); //split sentence into words
  var result = { addressee: "", moodArray: [] };
  //compare every word of the sentence with the buzzword list.
  var addrTrTb = {};
  for (word of splitMessage) {
    for (vocabList in compAdr) {
      for (vocab of compAdr[vocabList]) {
        if (word == vocab) {
          addrTrTb[vocabList] = true;
        }
      }
    }
  }
  if (addrTrTb.firstPerson && !addrTrTb.thirdPerson && !addrTrTb.your) {
    result.addressee = "toMe";
  } else {
    result.addressee = "toYou";
  }
  for (mood in compVoc) {
    for (word of compVoc[mood].word) {
      messageString.includes(word) ? result.moodArray.push(mood) : null;
    }
  }
  result.mood = result.moodArray[0];
  result.mood = messageString.includes("nicht")
    ? compVoc[result.mood].neg
    : result.mood;
  return result;
};
