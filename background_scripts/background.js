console.log("background started!");

let settings;

let openNumber = 0;

init();

function init() {
    loadFromStorage();
    addListeners();
};

function loadFromStorage() {
    var getting = browser.storage.local.get("settings");
    getting.then((storage) => {
        settings = storage.settings;
    }, (error) => {
        console.log(`Error: ${error}`);
    });
}

function addListeners() {
    browser.commands.onCommand.addListener((command) => {
        if (command === "ctrl+q") {
            onOpenSpeedDial();
        } else if (command.startsWith("ctrl+")) {
            onCtrl(Number.parseInt(command.charAt(command.length - 1)));
        }
    });

    browser.runtime.onMessage.addListener((message) => {
        let number = Number.parseInt(message.number, 10);
        if (number !== NaN) {
            openNumber = number;;
            tryOpen();
        }
    });

    browser.storage.onChanged.addListener(() => {
        loadFromStorage();
    });
}

function onOpenSpeedDial() {
    getActiveTab((tab) => {
        browser.tabs.sendMessage(tab.id, "openSpeedDial");
    }, () => {
        console.log("couldn't get active tab");
    });
}

function tryOpen() {
    console.log("tryOpen")
    if (openNumber !== 0) {
        tryOpenNumber();
        openNumber = 0;
    }
}

function tryOpenNumber() {
    if (openNumber !== 0) {
        console.log("number: " + openNumber);
        updateCurrentTab(getUrlForNumber(openNumber));
    } else {
        console.log("number was 0");
    }
}

function getUrlForNumber(number) {
    if (settings !== undefined) {
        let url = settings.shortcuts[number];
        if (url !== undefined && url.length > 0) {
            return url;
        }
    }
    return null;
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

function getActiveTab(callback, error) {
    let tabs = browser.tabs.query({
        currentWindow: true,
        active: true
    });
    tabs.then((tabArray) => {
        if (tabArray.length > 0) {
            callback(tabArray[0]);
        } else {
            error();
        }
    }, error);
}

function updateCurrentTab(url) {
    if (url !== null) {
        getActiveTab((tab) => {
            let update = browser.tabs.update(tab.id, {
                url: url
            });
            update.then(() => {
                console.log("opened in current tab: " + url);
            }, () => {
                console.log("couldn't update current tab:" + url)
            });
        }, () => {
            console.log("couldn't query tabs")
        });
    }
}