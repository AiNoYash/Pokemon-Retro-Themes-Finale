import { WallpaperType } from "../_enums/WallpaperTypeEnum";
import { WallpaperMode } from "../_enums/WallpaperModeEnum";
import { ThemeName } from "../_enums/ThemeNameEnum";

// ? Everything is being stored in zustand via some sort of store key name so storing all these values directly makes no sense in install.js
// ! We may need it for something like version or stuff later
export const defaultSettings = {
    wallpaperType: WallpaperType.ANIMATED,
    wallpaperMode: WallpaperMode.BUILTIN,
    themeName: ThemeName.MAY_AND_FRIENDS,
    darknessLevel: 0.3
};

