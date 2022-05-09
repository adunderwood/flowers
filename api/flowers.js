//require path and fs modules
const path = require('path');
const fs = require('fs');
const http = require('http');
const sharp = require("sharp");

const directoryPath = path.join(__dirname, '../images');

const host = 'localhost';
const port = 9999;

async function getMetadata(file, res) {
  try {

    var img = "../images/" + file.flower;

    const metadata = await sharp(img).metadata();
    // file.meta = metadata;
    var meta = {}
    if (metadata.format) {
      meta.format = metadata.format;
    }
    meta.dpi = metadata.density;
    meta.width = metadata.width;
    meta.height = metadata.height;
    meta.alpha = metadata.hasAlpha;
    meta.progressive = metadata.isProgressive;

    file.meta = meta;

    if (file.meta.width > file.meta.height) {
      file.meta.display_mode = "landscape";
    }

    if (file.meta.width < file.meta.height) {
      file.meta.display_mode = "portrait";
    }

    if (file.meta.width == file.meta.height) {
      file.meta.display_mode = "square";
    }
    console.log(file);

  } catch (error) {
    console.log(`An error occurred during processing: ${error}`);
  }

  // try to attach meta data, if not, just send what you got
  sendData(file, res);
}


function sendData(file, res) {
  res.writeHead(200);

  floutput = JSON.stringify(file)
  res.end(floutput);

}

const requestListener = function (req, res) {

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

    getMetadata(floutput, res)

//    console.log(floutput)

  });
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

