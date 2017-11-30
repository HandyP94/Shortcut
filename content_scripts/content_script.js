const idRoot = "SpeedDialIdRoot";
const DELAY = 1000;
let isContentHTML;

let timeoutId;

init();

function init() {
    injectUI();
    addListeners();
    isContentHTML = $("#isSpeeedDialContentHTML").length !== 0;
    if(isContentHTML) {
        openSpeedDial();
    }
}

function addListeners() {
    browser.runtime.onMessage.addListener((message) => {
        if (message === "openSpeedDial") {
            openSpeedDial();
            if (!isContentHTML) {
                restartTimeout();
            }
        };
    });
}

function injectUI() {
    if ($("#" + idRoot + "outerDiv").length === 0) {
        $("body").append(generateUI());
        hideUI();
        addInputScripts();
    }
}

function addInputScripts() {
    let input = $("#" + idRoot + "input");
    input.keypress((event) => {
        var charCode = (event.which) ? event.which : event.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    });
    input.on("input", (e) => {
        console.log("input");
        if (input.val().length === 3) {
            sendNumberToBackground(input.val());
        } else {
            restartTimeout();
        }
    });
}

function sendNumberToBackground(number) {
    browser.runtime.sendMessage({
        number: number
    }).then(() => {
        return
    }, () => {
        console.log("error")
    });
    hideUI();
}

function hideUI() {
    $("#" + idRoot + "outerDiv").hide(0);
    $("#" + idRoot + "input").val("");
    $("#" + idRoot + "input").blur();
    $("#" + idRoot + "input").prop("disabled", true);
}

function restartTimeout() {
    console.log("restartTimeout")
    if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(onTimeout, DELAY)
}

function onTimeout() {
    let input = $("#" + idRoot + "input");
    if (input.val().length > 0) {
        sendNumberToBackground(input.val());
    }
    hideUI();
}

function generateUI() {
    let div = $("<div>", {
        "id": idRoot + "outerDiv"
    })
    let innerDiv = $("<div>", {
        "id": idRoot + "innerDiv"
    });
    innerDiv.append($("<input>", {
        "id": idRoot + "input",
        "type": "text",
        "maxlength": "3"
    }));
    div.append(innerDiv);
    return div;
}

function openSpeedDial() {
    $("#" + idRoot + "outerDiv").show(0);
    $("#" + idRoot + "input").prop("disabled", false);
    $("#" + idRoot + "input").focus();
}