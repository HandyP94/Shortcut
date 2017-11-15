console.log("background started!");

const DELAY = 0.01; // 2 seconds
const MAX_NUMBER_LENGTH = 3;

let settings;

let openNumber = 0;
let numberLength = 0;

init();

function init() {
    loadJson("settings.json", (json) => {
        settings = json;
    });
    addListeners();
};

function addListeners() {
    browser.commands.onCommand.addListener((command) => {
        if (command.startsWith("ctrl+")) {
            onCtrl(Number.parseInt(command.charAt(command.length - 1)));
        }
    });

    browser.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === "timeout") {
            onTimeout();
        }
    });
}


function onCtrl(number) {
    console.log(number);
    if (numberLength < MAX_NUMBER_LENGTH) {
        openNumber = (openNumber * 10) + number;
        numberLength++;
        if (numberLength === MAX_NUMBER_LENGTH) {
            browser.alarms.clear("timeout");
            tryOpen();
        } else {
            restartAlarm();
        }
    }
};

function restartAlarm() {
    console.log("restartAlarm")
    browser.alarms.clear("timeout");
    browser.alarms.create("timeout", {
        delayInMinutes: DELAY
    });
}

function onTimeout() {
    console.log("timeout")
    tryOpen();
}

function tryOpen() {
    console.log("tryOpen")
    if (numberLength !== 0) {
        tryOpenNumber();
        numberLength = 0;
        openNumber = 0;
    }
}

function tryOpenNumber() {
    if (openNumber !== 0) {
        console.log("number: " + openNumber);
        openTabForeground(getUrlForNumber(openNumber));
    } else {
        console.log("number was 0");
    }
}

function getUrlForNumber(number) {
    if (settings !== undefined) {
        let url = settings.shortcuts[number];
        if(url !== undefined && url.length > 0) {
            return url;
        }
    }
    return "https://www.google.com";
}

function openTabForeground(url) {
    let createTab = browser.tabs.create({
        active: true,
        url: url
    });
    createTab.then(() => {
        console.log("opened in new tab: " + url);
    }, () => {
        console.log("couldn't open: " + url);
    });
}

function loadJson(url, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == 200) {

            // .open will NOT return a value but simply returns undefined in async mode so use a callback
            callback(JSON.parse(xobj.responseText));
        } 
    }
    xobj.send(null);
}