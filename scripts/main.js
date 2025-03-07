// config
const API_URL = "/flowers/api";
const BASE_URL = "/flowers/images/";

// resize image quickly
var initial_buffer = 100;
var buffer = 2;
var delay = 5000;

// track the number of flowers the user has seen
var flowerCount = 1;
var historyCount = -1;
var totalCount = 1;

var firstUse = true;
var historySetting = true;

var automaticTimer;

function clearSpeedSelected() {
  for (var i = 0; i < 11; i++) {
    el = document.getElementById("speed_" + (i + 1));
    el.classList.remove("selected");
  }
}

function startAutomaticTimer(speed, el) {
  // select button
  clearSpeedSelected();
  el.classList.add("selected");

  clearTimer();
  automaticTimer = setInterval(function () {
    nextFlower(true); // increment flower
  }, speed);

  // save user value for comparison
  userSpeed = speed;
}

function clearTimer() {
  clearInterval(automaticTimer);
}

function stopAutomaticTimer(userInitiated = false) {
  clearSpeedSelected();
  clearInterval(automaticTimer);
}

var poll = setInterval(function () {
  var tmp = document.getElementById("page");
  var tmpLinks = tmp.getElementsByTagName("div");

  if (tmpLinks.length > buffer) {
    var wait_a_second = setTimeout(function () {
      console.log("GO!");

      var modal = document.getElementById("modal");
      modal.style.display = "none";

      // if you waited for the modal to clear, update the count normally
      firstUse = false;

      clearInterval(poll);
    }, delay);
  }

  //console.log(tmpLinks.length)
}, 250);

function setHistory() {
  var e = window.event;

  historySetting = !historySetting;
  e.stopPropagation();
}

function fadeIn(el, time) {
  el.style.opacity = 0;

  var last = +new Date();
  var tick = function () {
    el.style.opacity = +el.style.opacity + (new Date() - last) / time;
    last = +new Date();

    if (+el.style.opacity < 1) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) ||
        setTimeout(tick, 16);
    }
  };

  tick();
}

function fadeOut(element, toValue = 0, duration = 200, z = 1) {
  // Store our element's current opacity (or default to 1 if null)
  const fromValue = parseFloat(element.style.opacity) || 1;

  // Mark the start time (in ms). We use this to calculate a ratio
  // over time that applied to our supplied duration argument
  const startTime = Date.now();

  // Determines time (ms) between each frame. Sometimes you may not
  // want a full 60 fps for performance reasons or aesthetic
  const framerate = 1000 / 60; // 60fps

  // Store reference to interval (number) so we can clear it later
  let interval = setInterval(
    () => {
      const currentTime = Date.now();

      // This creates a normalized number between now vs when we
      // started and how far into our desired duration it goes
      const timeDiff = (currentTime - startTime) / duration;

      // Interpolate our values using the ratio from above
      const value = fromValue - (fromValue - toValue) * timeDiff;

      // If our ratio is >= 1, then we're done.. so stop processing
      if (timeDiff >= 1) {
        clearInterval(interval);
        interval = 0;
      }

      // Apply visual. Style attributes are strings.
      element.style.opacity = value.toString();
    },
    framerate,
    adjustZ(element, duration, z)
  );
}

function adjustZ(element, duration, z = 1) {
  t = setTimeout(() => {
    element.style.zIndex = z;
  }, duration);
}

function loaded() {
  console.log("READY!");

  for (var i = 0; i < initial_buffer; i++) {
    getNewImage();
  }
  getNewImage();

  console.log("SET!");

  var tmp = document.getElementById("page");
  var tmpLinks = tmp.getElementsByTagName("div");

  page.style.visibility = "visible";

  // alert(tmpLinks.length)
  nextFlower();
}

function showHelp() {
  // update flower count
  if (!firstUse) {
    var fc = document.getElementById("flowerCount");
    fc.innerHTML = flowerCount.toString(); // + " of " + totalCount.toString();
  }

  // close context menu
  var ctxMenu = document.getElementById("contextMenu");
  ctxMenu.style.display = "none";

  var modal = document.getElementById("help");
  //help.style.display = "block";
  modal.style.zIndex = 999;
  fadeIn(modal, 200);
}

function showAuto() {
  // close context menu
  var ctxMenu = document.getElementById("contextMenu");
  ctxMenu.style.display = "none";

  var modal = document.getElementById("automatic");
  //help.style.display = "block";
  modal.style.zIndex = 999;
  fadeIn(modal, 200);
}

function closeHelp() {
  var modal = document.getElementById("help");
  //help.style.display = "none";
  fadeOut(modal, 0, 200, 9);

  firstUse = false;
}

function closeAuto() {
  var modal = document.getElementById("automatic");
  //help.style.display = "none";
  fadeOut(modal, 0, 200, 9);

  firstUse = false;
}

function closeModal() {
  var modal = document.getElementById("modal");
  modal.style.display = "none";
}

function openFlower(action) {
  if (!action) {
    action = "save";
  }
  var page = document.getElementById("page");
  var flower = page.firstElementChild;

  var img = flower.style.backgroundImage.match(/url\(["']?([^"']*)["']?\)/)[1];

  // this is so dumb....
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = img;

  if (action == "save" || action == "download") {
    a.download = img;
  } else if (action == "tab" || action == "open") {
    a.target = "_blank";
  }

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function nextFlower(key = false) {
  var page = document.getElementById("page");
  page_flowers = page.getElementsByTagName("div");

  var nextFlower = page_flowers[1];
  var target = page_flowers[0];

  var e, w, posX, posY;

  if (!key) {
    // calculate mouse position
    e = window.event;
    w = window.screen.width;

    posX = e.clientX;
    posY = e.clientY;
  }

  if (posX > w * 0.2 || key) {
    // override on keystroke
    // 80% forward
    if (target) {
      //target.remove();
      moveToHistory(target);
    } else {
      // repopulate
      for (var i = 0; i < buffer * 2; i++) {
        getNewImage();
      }
    }
  } else {
    // left 20% back
    getHistory();
  }

  //page_flowers[0] = target.parentNode.removeChild(target);

  // load a buffer full of new images
  for (var i = 0; i < buffer; i++) {
    getNewImage();
  }

  return false;
}

function moveToHistory(target) {
  if (historySetting) {
    // only if user has history setting turned on
    var hist = document.getElementById("history");
    hist.appendChild(target);
  } else {
    target.remove();
  }

  if (flowerCount + historyCount == 0) {
    flowerCount++;
  }
  historyCount--;
  totalCount++;

  //console.log("Flower Count: " + flowerCount)
  //console.log("History Count: " + historyCount)
  //console.log("Total Count: " + totalCount)
}

function getHistory(num) {
  var hist = document.getElementById("history");
  var page = document.getElementById("page");

  if (hist.childElementCount > 0) {
    //flowerCount--;
    historyCount++;
    totalCount++;
  }

  if (!num) {
    num = 1;
  }

  for (var i = 0; i < num; i++) {
    var el = hist.lastChild;
    var firstHistItem = page.firstChild;

    if (el) {
      // only if there is a history
      page.insertBefore(el, firstHistItem);
    }
  }

  //console.log("Flower Count: " + flowerCount)
  //console.log("History Count: " + historyCount)
  //console.log("Total Count: " + totalCount)
}

function fixPageSize() {
  var page = document.getElementById("page");
  page.style.height = window.innerHeight + 4 + "px";
  page.style.width = window.width + 2 + "px";
  page.style.paddingRight = "4px";

  page.style.position = "absolute";
  page.style.left = "-1px";

  window.scrollTo(0, 0);
}

function getNewImage() {
  const promise = new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    var loading = document.getElementById("loading");
    var page = document.getElementById("page");

    var rnd_qs = Math.floor(Math.random() * 10000);
    request.open("GET", API_URL + "?q=" + rnd_qs);
    //console.log('/flowers/api?q=' + rnd_qs)

    request.onload = () => {
      if (request.status === 200) {
        resolve(request.response); // we got data here, so resolve the Promise
      } else {
        reject(Error(request.statusText)); // status is not 200 OK, so reject
      }
    };

    request.onerror = () => {
      reject(Error("Error fetching data.")); // error occurred, reject the  Promise
    };

    request.send(); // send the request
  });

  // console.log('Asynchronous request made.');

  promise.then(
    (data) => {
      //console.log('Got data! Promise fulfilled.');
      //console.log(JSON.parse(data));

      var flower = document.getElementById("flower");
      var flower_image = JSON.parse(data).flower;
      //flower.style.backgroundImage = 'url("images/' + flower_image + '")';

      // add a new flower to the end of the loading div on click
      var div = document.createElement("div");

      div.id = flower_image.replace(".jpg", "").replace(".jpeg", "");
      div.className = "flower-image";
      div.style.backgroundColor = "#222";
      div.style.backgroundImage = "url('" + BASE_URL + flower_image + "')";
      div.setAttribute("onclick", "return nextFlower()");

      if (flower_image) {
        page.appendChild(div);
      }
    },
    (error) => {
      console.log("Promise rejected.");
      console.log(error.message);
    }
  );
}

// events
fixPageSize();

window.onload = function () {
  fixPageSize();
  loaded();
};

window.onresize = function () {
  fixPageSize();
};

window.onorientationchange = function () {
  fixPageSize();
};

window.mobileCheck = function () {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

window.mobileAndTabletCheck = function () {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

if (window.mobileAndTabletCheck()) {
  //delay = 500;
  //initial_buffer = 1;
  //buffer = 1;
  //showHelp();
}

document.onkeydown = function (e) {
  var ctxMenu = document.getElementById("contextMenu");
  ctxMenu.style.display = "none";

  if (
    e.key == "f" ||
    e.key == "n" ||
    e.code == "Enter" ||
    e.code == "Space" ||
    e.keyCode == "39"
  ) {
    closeHelp();
    closeModal();
    closeAuto();

    nextFlower(true); // send with keystroke indicator
  }

  if (e.key == "d") {
    closeHelp();
    closeModal();
    closeAuto();

    openFlower("download");
  }

  if (e.key == "t") {
    closeHelp();
    closeModal();
    closeAuto();

    openFlower("tab");
  }

  if (e.key == "h") {
    var help = document.getElementById("help");
    var o = help.style.zIndex;

    if (o != 999) {
      // only show if it's not already showing
      showHelp();
    } else {
      // hide it if it is
      closeHelp();
    }
  }

  //e.key == "a" ||
  if (e.key == "b" || e.keyCode == "37") {
    // back arrow
    closeHelp();
    closeModal();

    getHistory();
  }

  if (e.key == "a") {
    // back arrow
    closeHelp();
    closeModal();

    console.log("A key pressed.");
    showAuto();
  }

  if (e.key === "Escape" || e.keyCode == 27) {
    // escape
    //var modal = document.getElementById("modal");
    //modal.style.display = "none";
    stopAutomaticTimer(); // turn off automatic mode

    var ctxMenu = document.getElementById("contextMenu");
    ctxMenu.style.display = "none";

    closeHelp();
    closeAuto();
  }
};

var pageBody = document.getElementById("page");
pageBody.addEventListener(
  "contextmenu",
  function (event) {
    event.preventDefault();
    var ctxMenu = document.getElementById("contextMenu");
    ctxMenu.style.display = "block";
    ctxMenu.style.left = event.pageX - 10 + "px";
    ctxMenu.style.top = event.pageY - 10 + "px";
  },
  false
);
pageBody.addEventListener(
  "click",
  function (event) {
    var ctxMenu = document.getElementById("contextMenu");
    ctxMenu.style.display = "";
    ctxMenu.style.left = "";
    ctxMenu.style.top = "";
  },
  false
);

/*
let touchstartX = 0
let touchendX = 0
    
function checkDirection() {
  // back
  if (touchendX < touchstartX) {
    nextFlower();
  }

  // forward
  if (touchendX > touchstartX) {
    getHistory();
  }
}

document.addEventListener('touchstart', e => {
  touchstartX = e.changedTouches[0].screenX
})

document.addEventListener('touchend', e => {
  touchendX = e.changedTouches[0].screenX
  checkDirection()
})
*/
