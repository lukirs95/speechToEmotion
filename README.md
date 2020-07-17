# speechToEmotion
Node JS app for interacting with your voice in 3D audio applications via osc (currently only german language supported!)

## info
You need a working nodeJS environment on your machine.
You can download it from: https://nodejs.org/en/download/

## usage
For normal localhost mode (Example: Max/MSP runs on this machine), 
just type: "node app.js".

### this means 
- reach web frontend just by typing the IP address of this machine in your chrome browser on your device. 
- receive compass data via OSC (0 - 360 deg) on port 8001.
- compass OSC address: /gyrosc/compass
- send speech to applications runnig on this machine via OSC on port 8002.
- compass range 0 - 360 degrees

## important
In order to use your microphone in chrome browser on a different device than this machine:
    
SET "Insecure origins treated as secure" Flag with the IP of this machine.

    1. In Chrome brower type: chrome://flags
    2. Search: Insecure origins treated as secure
    3. Add http://"IP Adress of this machine"
       (For Example http://192.168.1.123)
    4. Restart Chrome browser

## flags

 You can set custom IP and Ports for communicating with machines
 on your local network.

    syntax: "node app.js [flag value]"
    (Example: node app.js -i 192.168.1.124 -p 1234)
    
| Flag | Value                | if set                            |
|------|----------------------|-----------------------------------|
|   i  |     IPv4 address     |       change OSC receiver IP      |
|   s  |        NUMBER        |      change OSC receiver port     |
|   r  |        NUMBER        | change OSC receive port (compass) |
|   p  |        NUMBER        |        change Website port        |
|   f  |     has no value     |  constantly send compass segment  |
|   a  | /address/compass/... |     change compass OSC pattern    |
|   c  |     has no value     |     change compass {-180/180}     |

## change vocabulray 
in the file words.json you can see the words the system knows already. You can simply add your own words and categories.

#### structure

    vocab: {
      your-new-category: {
        words: ["some", "words", "or complete sentences" ]
        neg: "the opposite catagory in case of negation"
        }
    }
