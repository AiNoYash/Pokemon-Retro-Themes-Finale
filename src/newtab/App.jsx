import "./App.css";
import { Wallpaper } from "./Components/Wallpaper/Wallpaper";
import { Searchdex } from "./Components/Searchdex/Searchdex";
import { TimeWidget } from "./Components/TimeWidget/TimeWidget";
import { EditingPane } from "./Components/EditingPane/EditingPane";


export default function App() {
  return (
    <div className="app-container">
      <Wallpaper />
      <Searchdex />
      <TimeWidget />
      <EditingPane />
    </div>
  );
}