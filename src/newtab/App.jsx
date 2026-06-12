import "./App.css";
import "./stores/useStore";
import "./stores/useWallpaperStore";
import { Wallpaper } from "./Components/Wallpaper/Wallpaper";


export default function App() {
  return (
    <div className="app-container">
      <Wallpaper />
    </div>
  );
}