
// ? For now we are only using this for wallpapers
const DB_NAME = "Pokemon Retro Themes Extension Database";
const WALLPAPER_STORE_NAME = "wallpaper-store";


const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(WALLPAPER_STORE_NAME)) {
                db.createObjectStore(WALLPAPER_STORE_NAME, { keyPath: "name" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};


export const saveWallpaperToDB = async (wallpaperName, files) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(WALLPAPER_STORE_NAME, "readwrite");
        const store = transaction.objectStore(WALLPAPER_STORE_NAME);


        const data = {
            name: wallpaperName,
            staticFile: files.staticFile,     
            animatedFile: files.animatedFile  
        };

        const request = store.put(data);

        request.onsuccess = () => resolve(true);
        request.onerror = (e) => reject(e.target.error);
    });
};

// * Some information about how above function works
// ? In normal RDBMS the problems like maintanance of ACID properties are taken care by the system itself
// ? But here we are in browser and so the browser wishes us that we do some things manually up front
// When we write:  
// * db.transaction(WALLPAPER_STORE_NAME, "readwrite");
//  We are kinda taking an "exclusive" lock on the WALLPAPER_STORE_NAME
// ? Since we are taking lock on this store via transaction we will then take the store from transaction only rather than taking it from DB


export const getWallpaperFromDB = async (wallpaperName) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(WALLPAPER_STORE_NAME, "readonly");
        const store = transaction.objectStore(WALLPAPER_STORE_NAME);

        const request = store.get(wallpaperName);

        request.onsuccess = (e) => {
            resolve(e.target.result);
        };

        request.onerror = (e) => reject(e.target.error);
    });
};