//require path and fs modules
const env = require('dotenv').config();

const path = require('path');
const fs = require('fs');
const http = require('http');
const sharp = require("sharp");

const directoryPath = path.join(__dirname, '../images');
const getColors = require('get-image-colors');

const host = process.env.API_URL
const port = process.env.API_PORT

const html_colors = require("./colors.json");

var base_colors = [];
var base_color_names = [];

function getBaseColors() {
  for (var i in html_colors) {
    base_colors.push(html_colors[i]);
  }
}

function getColorName(hex) {
  var retval;

  for (var i in html_colors) {

    if (hex == html_colors[i]) {
      retval = i;
    }
  }

  return retval;
}

// https://stackoverflow.com/questions/4057475/rounding-colour-values-to-the-nearest-of-a-small-set-of-colours
function getSimilarColors (color) {
    getBaseColors();

    //base_colors=["660000","990000","cc0000","cc3333","ea4c88","993399","663399","333399","0066cc","0099cc","66cccc","77cc33","669900","336600","666600","999900","cccc33","ffff00","ffcc33","ff9900","ff6600","cc6633","996633","663300","000000","999999","cccccc","ffffff"];
    var color_r = color._rgb[0];
    var color_g = color._rgb[1];
    var color_b = color._rgb[2];

    //Create an emtyp array for the difference betwwen the colors
    var differenceArray=[];

    //Function to find the smallest value in an array
    Array.min = function( array ){
           return Math.min.apply( Math, array );
    };


    //Convert the HEX color in the array to RGB colors, split them up to R-G-B, then find out the difference between the "color" and the colors in the array
    for (var i = 0; i < base_colors.length; i++) {
        var value = base_colors[i]

        var base_color_rgb = hex2rgb(value);
        var base_colors_r = base_color_rgb.split(',')[0];
        var base_colors_g = base_color_rgb.split(',')[1];
        var base_colors_b = base_color_rgb.split(',')[2];

        //Add the difference to the differenceArray
        var val = (Math.sqrt((color_r-base_colors_r)*(color_r-base_colors_r)+(color_g-base_colors_g)*(color_g-base_colors_g)+(color_b-base_colors_b)*(color_b-base_colors_b)));
        differenceArray.push(val);

    }

    //Get the lowest number from the differenceArray
    var lowest = Array.min(differenceArray);

    //Get the index for that lowest number
    var index = differenceArray.indexOf(lowest);

    //Function to convert HEX to RGB
    function hex2rgb( colour ) {
        var r,g,b;
        if ( colour.charAt(0) == '#' ) {
            colour = colour.substr(1);
        }

        r = colour.charAt(0) + colour.charAt(1);
        g = colour.charAt(2) + colour.charAt(3);
        b = colour.charAt(4) + colour.charAt(5);

        r = parseInt( r,16 );
        g = parseInt( g,16 );
        b = parseInt( b ,16);
        return r+','+g+','+b;
    }

    //Return the HEX code
    return base_colors[index];

}

var metaColors = []

async function getMetadata(file, res) {
  try {

    var img = "../images/" + file.flower;

/*    getColors(path.join(__dirname, img)).then(colors => {
      // `colors` is an array of color objects
      if (colors) {
        for (var i = 0; i < colors.length; i++) {
          var color = colors[i];
          var similar = getSimilarColors(color);
          var name = getColorName(similar)

          metaColors.push(name);
        }
      }
    });

  */
    const metadata = await sharp(img).metadata();
    // file.meta = metadata;
    var meta = {}
    if (metadata.format) {
      meta.format = metadata.format;
    }
    meta.dpi = metadata.density;
    meta.width = metadata.width;
    meta.height = metadata.height;

    var mp = (meta.width * meta.height) / 1000000;
    meta.megapixels = Math.round(mp * 100) / 100;

    var qual = "low";
    if (meta.megapixels > 1) { qual = "medium"; }
    if (meta.megapixels > 3) { qual = "high"; }

    meta.quality = qual;
    meta.alpha = metadata.hasAlpha;
    meta.channels = metadata.channels;
    meta.space = metadata.space;
    meta.progressive = metadata.isProgressive;

    /*
    var colorSet = [...new Set(metaColors)];
    meta.colors = colorSet;
    // clear colors 
    metaColors = [];
    */
    file.meta = meta;

    if (file.meta.width > file.meta.height) {
      file.meta.display_mode = "landscape";
    }

    if (file.meta.width < file.meta.height) {
      file.meta.display_mode = "portrait";
    }

    if (Math.abs(file.meta.width - file.meta.height) <= 100) {
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

