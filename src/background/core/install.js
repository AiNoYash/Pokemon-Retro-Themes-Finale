import { defaultSettings } from "../../_utils/constants";

chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        
        // ! Don't need this here right now due to auto hidration of zustand
        // await chrome.storage.local.set(defaultSettings);
        
        
        // ? Maybe some other alarm type thing
        // chrome.alarms.create("ask-for-ratings-alarm", {
        //     delayInMinutes: 60
        // });

        chrome.tabs.create({ url: chrome.runtime.getURL("newtab.html") });
        // chrome.runtime.setUninstallURL('https://docs.google.com/forms/d/e/1FAIpQLSc1gqbiMHNq3ZUuJCpTXG5BSB8tu6lRwNM5NsB5LwjfsDT0Kg/viewform');
    }
    else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {


        // ! Don't need this here due to auto hidration of zustand
        // const settingsKeys = Object.keys(defaultSettings);
        
        // chrome.storage.local.get(settingsKeys, (existingSettings) => {
        //     const newSettings = {
        //         ...defaultSettings, ...existingSettings
        //     }
        //     chrome.storage.local.set(newSettings);
        // });
    }
});