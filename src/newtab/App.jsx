import "./App.css";
import { Wallpaper } from "./Components/Wallpaper/Wallpaper";
import { Searchdex } from "./Components/Searchdex/Searchdex";

export default function App() {
  return (
    <div className="app-container">
      <Wallpaper />
      <Searchdex />
    </div>
  );
}