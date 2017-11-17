init();

let currentShortcutLength = 0;

function init() {
    $("#addButton").click(addNewLinkRow);
    $("#saveButton").click(saveOptions);
}

function addNewLinkRow() {
    currentShortcutLength++;
    addLinkRow(createRow(currentShortcutLength.toString()));
}

function addLinkRow(linkRow) {
    $("#tbody").append(linkRow);
}

function setFromStorage(storage) {
    let settings = storage.settings;
    setShortcutsFromStorage(settings["shortcuts"]);
}

function setShortcutsFromStorage(shortcuts) {
    if (shortcuts !== undefined) {
        let keys = Object.keys(shortcuts);
        keys = keys.sort((a, b) => {
            let aInt = Number.parseInt(a);
            let bInt = Number.parseInt(b);
            if (aInt < bInt) {
                return -1;
            }
            if (aInt > bInt) {
                return 1;
            }
            return 0;
        });
        currentShortcutLength = keys.length;
        for (let i = 0; i < currentShortcutLength; i++) {
            addLinkRow(createRow(keys[i], shortcuts[keys[i]]));
        }
    }
}

function createRow(shortcut, link) {
    let row = $("<tr>", {
        "class": "shortcutRow"
    });
    row.append($("<td>", {
        "class": "shortcutTd"
    }).text(shortcut));
    row.append(createInputTd(link));
    return row;
}

function createInputTd(link) {
    let td = $("<td>");
    td.append($("<input>", {
        "type": "url"
    }).val(link));
    return td;
}

function createSettings() {
    return {
        "shortcuts": createShortcutsForStorage()
    };
}

function createShortcutsForStorage() {
    let shortcuts = {};
    let shortcutRows = $(".shortcutRow");
    if (shortcutRows.length !== 0) {
        if (shortcutRows.length > 1) {
            for (let i = 0; i < shortcutRows.length; i++) {
                const row = shortcutRows[i];
                addRowToShortcuts(shortcuts, $(row));
            }
        } else {
            addRowToShortcuts(shortcuts, shortcutRows);
        }
    }
    return shortcuts;
}

function addRowToShortcuts(shortcuts, row) {
    let shortcut = row.find(".shortcutTd").text();
    let link = row.find("input").val();
    shortcuts[shortcut] = link;
}

function saveOptions(e) {
    e.preventDefault();
    browser.storage.local.set({
        settings: createSettings()
    });
}

function restoreOptions() {
    function onError(error) {
        console.log(`Error: ${error}`);
    }
    var getting = browser.storage.local.get("settings");
    getting.then(setFromStorage, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);