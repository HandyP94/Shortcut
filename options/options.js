init();

let currentShortcutLength = 0;

function init() {
    // document.addEventListener("DOMContentLoaded", () => {
    //     openSettingsOrSwitch();
    // });
    $("#openSettingsButton").click(() => {
        openSettingsOrSwitch();
    });
}

function openSettingsOrSwitch() {
    browser.tabs.query({
            url: "moz-extension://*/settings_page/settings.html"
        })
        .then((tabs) => {
                if (tabs.length > 0) {
                    browser.tabs.update(tabs[0].id, {
                        active: true
                    });
                } else {
                    openSettings();
                }
            },
            () => openSettings()
        );
}

function openSettings() {
    browser.tabs.create({
        "url": "../settings_page/settings.html"
    });
}