import { useRef, useState, useEffect } from "react";
import { useSearchdexStore } from "../../stores/useSearchdexStore";
import "./Searchdex.css";
import { useShallow } from "zustand/shallow";
import { SearchEngineType } from "../../../_enums/SearchEngineTypeEnum";
import { SearchOpenTargetType } from "../../../_enums/SearchOpenTargetEnum";
import { useWallpaperStore } from "../../stores/useWallpaperStore";
import { WallpaperType } from "../../../_enums/WallpaperTypeEnum";
import { VisualSearchEngineOptions } from "../../../_enums/VisualSearchEngineOptionsEnum";
import { X } from "lucide-react";
import { getGoogleSuggestions, recognizeVoice } from "./searchdex-helper";
import { ActionBtnRole } from "../../../_enums/ActionBtnRoleEnum";


export function Searchdex() {

    const [inputValue, setInputValue] = useState("");
    const [typedQuery, setTypedQuery] = useState("");

    const [isFocused, setIsFocused] = useState(false);
    const [isRecognitionActive, setIsRecognitionActive] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

    const timeoutRef = useRef(null);
    const containerRef = useRef(null);
    const formRef = useRef(null);


    const {
        searchEngineType, currentSearchEngine, searchEngines,
        lastQueries, addLastQuery, removeLastQuery, lastQueriesEnabled, cleanLastQueries,
        suggestions, suggestionsEnabled,
        autoSubmitVoiceSearch, searchOpenTarget, recognitionLanguage, visualSearchEngine,
        actionBtnEnabled, trafficLightsEnabled, actionBtnRole
    } = useSearchdexStore(
        useShallow((state) => ({
            suggestions: state.suggestions,
            lastQueries: state.lastQueries,
            addLastQuery: state.addLastQuery,
            removeLastQuery: state.removeLastQuery,
            cleanLastQueries: state.cleanLastQueries,

            searchEngineType: state.searchEngineType,
            searchEngines: state.searchEngines,
            currentSearchEngine: state.currentSearchEngine,
            searchOpenTarget: state.searchOpenTarget,

            suggestionsEnabled: state.suggestionsEnabled,
            autoSubmitVoiceSearch: state.autoSubmitVoiceSearch,
            visualSearchEngine: state.visualSearchEngine,

            recognitionLanguage: state.recognitionLanguage,
            lastQueriesEnabled: state.lastQueriesEnabled,
            actionBtnEnabled: state.actionBtnEnabled,
            trafficLightsEnabled: state.trafficLightsEnabled,
            actionBtnRole: state.actionBtnRole
        }))
    );

    const isShowingLastQueries = lastQueriesEnabled && typedQuery.trim() === "";
    const currentSuggestionsList = isShowingLastQueries ? lastQueries : suggestions;
    const showDropdown = isFocused && suggestionsEnabled && currentSuggestionsList.length > 0;

    const executeSearch = (query) => {
        if (!query.trim()) return;

        setInputValue("");
        setTypedQuery("");

        setIsFocused(false);
        setSelectedSuggestionIndex(-1);

        addLastQuery(query);

        // ! Now addLastQuery is a sync opr but in zustand it will do a async writting to chromeExtensionStorage 
        // ! It is not known yet but if this function is constantly failing to add a new query then we will consider adding a 25-50 ms timeout

        // setTimeout(() => {
        if (searchEngineType === SearchEngineType.BUILTIN) {
            chrome.search.query({
                text: query,
                disposition: searchOpenTarget === SearchOpenTargetType.NEW_TAB ? "NEW_TAB" : "CURRENT_TAB"
            });
        } else {
            window.open(
                searchEngines[currentSearchEngine].searchUrl.replace("%s", encodeURIComponent(query)),
                searchOpenTarget === SearchOpenTargetType.NEW_TAB ? "_blank" : "_self"
            );
        }
        // }, 50);
    };

    useEffect(() => {
        if (selectedSuggestionIndex > -1) {
            const activeItem = document.getElementById(`suggestion-${selectedSuggestionIndex}`);
            if (activeItem) {
                activeItem.scrollIntoView({ block: "nearest" });
            }
        }
    }, [selectedSuggestionIndex]);


    // * We could use on blur on input but it shouldn't be used as it will create problems in clicking suggestions 
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {

                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ? If the user wishes that we do not store it then we should delete stored ones
    useEffect(() => {
        if (!lastQueriesEnabled) {
            cleanLastQueries();
        }
    }, [lastQueriesEnabled]);


    return (
        <>
            <div className={`pokedex-search ${showDropdown ? "dropdown-active" : ""}`} ref={containerRef}>
                <form
                    ref={formRef}
                    onSubmit={(e) => {
                        e.preventDefault();
                        executeSearch(inputValue);
                    }}>

                    <input
                        type="text"
                        placeholder={`Search${searchEngineType === SearchEngineType.CUSTOM ? " " + searchEngines[currentSearchEngine].name : "..."}`}
                        autoComplete="off"
                        spellCheck="false"
                        value={inputValue}
                        onFocus={() => { setIsFocused(true); }}
                        onClick={() => { setIsFocused(true); }}
                        onChange={(e) => {
                            const query = e.target.value;
                            setInputValue(query);
                            setTypedQuery(query);
                            setSelectedSuggestionIndex(-1);

                            if (!suggestionsEnabled) return;
                            clearTimeout(timeoutRef.current);

                            if (!query.trim()) {
                                useSearchdexStore.setState({ suggestions: [] });
                                return;
                            }

                            timeoutRef.current = setTimeout(async () => {
                                const fetchedSuggestions = await getGoogleSuggestions(query);
                                const newSuggestions = [query, ...fetchedSuggestions.filter(s => s.toLowerCase() !== query.toLowerCase())];
                                useSearchdexStore.setState({ suggestions: newSuggestions });
                            }, 100);
                        }}
                        onKeyDown={(e) => {
                            if (!showDropdown) return;

                            switch (e.key) {
                                case 'ArrowDown':
                                    e.preventDefault();
                                    setSelectedSuggestionIndex(prev => {
                                        const nextIndex = Math.min(prev + 1, currentSuggestionsList.length - 1);
                                        setInputValue(currentSuggestionsList[nextIndex]);
                                        return nextIndex;
                                    });
                                    break;

                                case 'ArrowUp':
                                    e.preventDefault();
                                    if (selectedSuggestionIndex === -1) return;

                                    setSelectedSuggestionIndex(prev => {
                                        const prevIndex = Math.max(prev - 1, 0);
                                        setInputValue(currentSuggestionsList[prevIndex]);
                                        return prevIndex;
                                    });
                                    break;

                                case 'Escape':
                                    setIsFocused(false);
                                    setSelectedSuggestionIndex(-1);
                                    break;
                            }
                        }}
                    />
                </form>

                {trafficLightsEnabled && (<>
                    <div className="pokedex-dot red" onClick={() => {
                        useWallpaperStore.setState((state) => ({ wallpaperType: state.wallpaperType === WallpaperType.STATIC ? WallpaperType.ANIMATED : WallpaperType.STATIC }));
                    }} title="Toggle Wallpaper Type"></div>
                    <div className="pokedex-dot yellow" title="Previous Wallpaper" onClick={() => {

                    }}></div>
                    <div className="pokedex-dot green" title="Next Wallpaper" onClick={() => {

                    }}></div>
                </>)}

                {actionBtnEnabled && (
                    <div className="pokedex-action-btn" onClick={() => {
                        switch (actionBtnRole) {
                            case ActionBtnRole.SWITCH_SEARCH_ENGINE: {
                                if (currentSearchEngine >= searchEngines.length - 1) { // ? in case of  === searchEngines.Length -1 next time we need to have default one anyway
                                    useSearchdexStore.setState({
                                        searchEngineType: SearchEngineType.BUILTIN,
                                        currentSearchEngine: -1
                                    });
                                }
                                else {
                                    const newState = { currentSearchEngine: currentSearchEngine + 1 };
                                    if (currentSearchEngine === -1) {
                                        newState.searchEngineType = SearchEngineType.CUSTOM;
                                    }
                                    useSearchdexStore.setState(newState);
                                }
                            }
                                break;
                            case ActionBtnRole.OPEN_WALLPAPER_SETTINGS: {

                            }
                                break;
                            default:
                                break;
                        }
                    }} title="">
                    </div>
                )}



                <div className={`search-btns ${isRecognitionActive ? "active" : ""}`} title="Search by Voice" tabIndex="0" onKeyUp={(e) => {
                    if (e.key === "Enter") {
                        e.currentTarget.click();
                    }
                }} onClick={async () => {
                    const query = await recognizeVoice(setIsRecognitionActive, recognitionLanguage);

                    if (query) {
                        setInputValue(query);
                        setTypedQuery(query);

                        if (autoSubmitVoiceSearch) {
                            formRef.current.requestSubmit();
                        }
                    }
                }}>
                    <img src="icons\voice-search.png" alt="voice search icon" class="search-btns-img" />
                </div>
                <div className="search-btns" id="img-search" title="Search by Image" tabIndex="0"
                    onKeyUp={(e) => {
                        if (e.key === "Enter") {
                            e.currentTarget.firstElementChild.click();
                        }
                    }}
                >
                    <a target={searchOpenTarget === SearchOpenTargetType.NEW_TAB ? "_blank" : "_self"} href={visualSearchEngine === VisualSearchEngineOptions.LENS ? "https://lens.google.com/search?" : "https://www.bing.com/visualsearch?"} >
                        <img src="icons\image-search.png" alt="image search icon" class="search-btns-img" />
                    </a>
                </div>


                {showDropdown && (
                    <div className="suggestions-container">
                        <div id="suggestions">
                            {currentSuggestionsList.map((suggestion, index) => (
                                <div
                                    key={index}
                                    id={`suggestion-${index}`}
                                    className={`suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        executeSearch(suggestion);
                                    }}
                                >
                                    <span>{suggestion}</span>

                                    {isShowingLastQueries && (
                                        <div
                                            className="delete-query-btn"
                                            title="Remove from history"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeLastQuery(suggestion);
                                            }}
                                        >
                                            <X size={16} color=" #f0f8ffb3" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div >
        </>
    );
}