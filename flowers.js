//require path and fs modules
const path = require('path');
const fs = require('fs');
const http = require('http');

const directoryPath = path.join(__dirname, 'images');

const host = 'localhost';
const port = 9999;

const sharp = require("sharp");

function getFlower() {
}

const requestListener = function (req, res) {
  res.writeHead(200);

  var flower;
  var arrFlowers = []

  fs.readdir(directoryPath, function (err, files) {
    //handle errors
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    //list all files
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        arrFlowers.push(file);
    });

    var rand = Math.floor(Math.random() * arrFlowers.length);
    flower = arrFlowers[rand]

    var floutput = {}
    floutput.flower = flower
 	
    floutput = JSON.stringify(floutput)

    console.log(floutput)
    res.end(floutput);

  });
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

