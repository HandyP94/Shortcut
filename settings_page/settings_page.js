init();

/*
 * shortcut-object:
 * {
 *     id: "id",
 *     link: "url"
 * }
 */

function init() {
    $("#addButton").click(addNewLinkRow);
    $("#saveButton").click(saveOptions);
    $("#resetButton").click(resetPage);
    $("#exportSettingsButton").click(exportSettings);

    let drake = dragula([document.querySelector('#container')], {
        revertOnSpill: false,
        removeOnSpill: false,
    });
    drake.on("drop", () => {
        refreshIndices();
    });
}

function addNewLinkRow() {
    if (checkUrlInput()) {
        let id = getNewId();
        let index = getNextIndex();
        let url = $("#urlInput").val();
        addLinkDiv(createLinkDiv(id, index, url));
        $("#urlInput").val("");
        $("#urlInput").focus();
    } else {
        console.log("url not ok")
    }
}

function checkUrlInput() {
    return $("#urlInput").val().trim().length > 0;
}

function getNewId() {
    return Date.now().toString();
}

function getNextIndex() {
    return ($("#container").children().length + 1).toString();
}

function addLinkDiv(linkRowDiv) {
    $("#container").append(linkRowDiv);
}

function setFromStorage(storage) {
    let settings = storage.settings;
    if (settings !== undefined) {
        setShortcutsFromStorage(settings["shortcuts"]);
    }
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
        for (let i = 0; i < keys.length; i++) {
            let shortcut = shortcuts[keys[i]];
            addLinkDiv(createLinkDiv(shortcut.id, keys[i], shortcut.link));
        }
    }
}

function createLinkDiv(id, index, link) {
    let row = $("<div>", {
        "id": "linkDiv" + id,
        "class": "shortcutDiv",
        "data-id": id
    });
    row.append($("<div>", {
        "class": "shortcutIndex"
    }).text(index));
    row.append($("<div>", {
        "class": "shortcutUrl"
    }).text(link));
    let removeButton = $("<img>", {
        "class": "deleteButton",
        "src": "../img/ic_delete.svg"
    });
    removeButton.click(() => {
        let shortcutId = removeButton.parent().attr("data-id");
        removeShortcut(shortcutId);
        refreshIndices();
    }).hover(() => {
        removeButton.attr("src", "../img/ic_delete_hover.svg");
    }).mouseleave(() => {
        removeButton.attr("src", "../img/ic_delete.svg");
    });
    row.append(removeButton);
    return row;
}

function removeShortcut(id) {
    $("#linkDiv" + id).remove();
}

function refreshIndices() {
    let index = 1;
    let children = $("#container").children();
    children.each((ind, child) => {
        $(child).find(".shortcutIndex").text(index.toString());
        index++;
    });
}

function createSettings() {
    return {
        "shortcuts": createShortcutsObjectForStorage()
    };
}

function createShortcutsObjectForStorage() {
    let shortcuts = {};
    let shortcutDivs = $(".shortcutDiv");
    if (shortcutDivs.length !== 0) {
        if (shortcutDivs.length > 1) {
            for (let i = 0; i < shortcutDivs.length; i++) {
                const div = shortcutDivs[i];
                addDivToShortcutsObject(shortcuts, $(div));
            }
        } else {
            addDivToShortcutsObject(shortcuts, shortcutDivs);
        }
    }
    return shortcuts;
}

function addDivToShortcutsObject(shortcuts, div) {
    let id = div.attr("data-id");
    let link = div.find(".shortcutUrl").text();
    let index = div.find(".shortcutIndex").text();
    shortcuts[index] = {
        id: id,
        link: link
    };
}

function resetPage() {
    $("#container").empty();
    restoreOptions();
}

function saveOptions(e) {
    e.preventDefault();
    browser.storage.local.set({
        settings: createSettings()
    });
}

function getSettingsFromStorage() {
    return browser.storage.local.get("settings");
}

function restoreOptions() {
    getSettingsFromStorage().then(setFromStorage, (error) => console.log(`Error: ${error}`));
}

function exportSettings() {
    getSettingsFromStorage().then(
        (settings) => downloadJsonObj(settings),
        (error) => console.log(`Error: ${error}`)
    );
}

function downloadJsonObj(objToDownload) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(objToDownload));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "shortcut.json");
    dlAnchorElem.click();
}

document.addEventListener("DOMContentLoaded", restoreOptions);