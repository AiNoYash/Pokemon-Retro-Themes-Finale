import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chromeExtensionStorage } from './useStore';
import { WallpaperMode } from '../../_enums/WallpaperModeEnum';
import { WallpaperType } from '../../_enums/WallpaperTypeEnum';
import { ThemeName } from '../../_enums/ThemeNameEnum';


export const useWallpaperStore = create(
    persist(
        (set, get) => ({
            wallpaperMode: WallpaperMode.BUILTIN,
            wallpaperType: WallpaperType.ANIMATED,
            themeName: ThemeName.MAY_AND_FRIENDS,
            darknessLevel: 0.3,
            customWallpapers: {}
        }),
        {
            name: 'wallpaper-store',
            storage: chromeExtensionStorage,

            // ? Do not store anything that is a function
            // ! We will add otherthings here as well
            partialize: (state) => {
                const storableStates = Object.fromEntries(
                    Object.entries(state).filter(([key, value]) => typeof value !== 'function')
                );

                if (storableStates.customWallpapers) {
                    storableStates.customWallpapers = Object.fromEntries(
                        Object.entries(storableStates.customWallpapers).map(
                            ([name, data]) => [name, { type: data?.type }]
                        )
                    );
                }

                return storableStates;
            }
        }
    )
);



