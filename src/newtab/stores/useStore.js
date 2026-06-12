import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export const chromeExtensionStorage = {
    getItem: async (name) => {
        const result = await chrome.storage.local.get(name);
        return result[name] || null;
    },
    setItem: async (name, value) => {
        await chrome.storage.local.set({ [name]: value });
    },
    removeItem: async (name) => {
        await chrome.storage.local.remove(name);
    },
};


export const useStore = create(
    persist(
        (set) => ({




        }),
        {
            name: 'chrome-local-store',
            storage: chromeExtensionStorage,

            // ? Do not store anything that is a function
            // ! We will add otherthings here as well
            partialize: (state) =>
                Object.fromEntries(
                    Object.entries(state).filter(([key, value]) => typeof value !== 'function')
                ),
        }
    )
);



