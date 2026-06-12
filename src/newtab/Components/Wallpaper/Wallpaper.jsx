import { useShallow } from "zustand/shallow";
import "./Wallpaper.css"
import { useEffect } from "react";
import { WallpaperMode } from "../../../_enums/WallpaperModeEnum";
import { themes } from "../../../_utils/themes";
import { WallpaperType } from "../../../_enums/WallpaperTypeEnum";


import { getWallpaperFromDB } from "../../stores/indexedDB";
import { useWallpaperStore } from "../../stores/useWallpaperStore";

export async function loadWallpaper(wallpaperName) {
    try {
        const dbEntry = await getWallpaperFromDB(wallpaperName);
        if (!dbEntry) return;

        const updates = {};

        if (dbEntry.staticFile) {
            updates["--static-wallpaper"] = URL.createObjectURL(dbEntry.staticFile);
        }
        if (dbEntry.animatedFile) {
            updates["--animated-wallpaper"] = URL.createObjectURL(dbEntry.animatedFile);
        }

        const { customWallpapers } = useWallpaperStore.getState();

        useWallpaperStore.setState({
            customWallpapers: {
                ...customWallpapers,
                [wallpaperName]: {
                    ...customWallpapers[wallpaperName],
                    ...updates
                }
            }
        });
    } catch (error) {
        console.error("Failed to load wallpaper:", error);
    }
}

export function Wallpaper() {

    const { themeName, wallpaperType, wallpaperMode, darknessLevel, customWallpapers } = useWallpaperStore(
        useShallow((state) => ({
            themeName: state.themeName,
            wallpaperType: state.wallpaperType,
            wallpaperMode: state.wallpaperMode,
            darknessLevel: state.darknessLevel,
            customWallpapers: state.customWallpapers
        }))
    );

    let animatedWallpaperUrl = null;

    if (wallpaperMode === WallpaperMode.BUILTIN) {
        if (wallpaperType === WallpaperType.ANIMATED) {
            animatedWallpaperUrl = themes[themeName]["--animated-wallpaper"];
        }
    }
    else {
        if (wallpaperType === WallpaperType.ANIMATED) {
            if (customWallpapers[themeName]?.type === "animated") {

                animatedWallpaperUrl = customWallpapers[themeName]["--animated-wallpaper"];
            }
        }
    }


    useEffect(() => {
        document.documentElement.style.setProperty('--darkness-level', darknessLevel);
    }, [darknessLevel]);


    useEffect(() => {
        if (wallpaperMode === WallpaperMode.BUILTIN) {
            if (wallpaperType === WallpaperType.STATIC) {
                document.documentElement.style.setProperty('--static-wallpaper', `url(${themes[themeName]["--static-wallpaper"]})`);
            }
        }
        else {
            const customWallpaper = customWallpapers[themeName];

            if (wallpaperType === WallpaperType.STATIC) {
                if (customWallpaper?.["--static-wallpaper"]) {
                    document.documentElement.style.setProperty('--static-wallpaper', `url(${customWallpaper["--static-wallpaper"]})`);
                } else {
                    loadWallpaper(themeName);
                }
            }
            else if (wallpaperType === WallpaperType.ANIMATED) {
                if (!customWallpaper?.["--animated-wallpaper"]) {
                    loadWallpaper(themeName);
                }
            }
        }
    }, [wallpaperType, wallpaperMode, themeName, customWallpapers]);



    const isAnimated = wallpaperType === WallpaperType.ANIMATED && animatedWallpaperUrl;

    return (
        <>
            {isAnimated ? (
                <div className="background-wallpaper animated">
                    <video src={animatedWallpaperUrl} autoPlay loop muted playsInline />
                </div>
            ) : (
                // ? This is a fallback for when wallpaper type is static or it is animated but url is not there
                <div className="background-wallpaper static" />
            )}
            <div className="brightness-overlay" />
        </>
    );
}