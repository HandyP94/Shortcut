init();

let currentShortcutLength = 0;

function init() {
    document.addEventListener("DOMContentLoaded", () => {
        browser.tabs.create({
            "url": "../settings_page/settings_page.html"
        });
    });
    $("#openSettingsButton").click(() => {
        browser.tabs.create({
            "url": "../settings_page/settings_page.html"
        });
    });
}