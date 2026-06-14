import { useRef, useState, useEffect } from "react";
import { useSearchdexStore } from "../../stores/useSearchdexStore";
import "./Searchdex.css";
import { useShallow } from "zustand/shallow";
import { SearchEngineType } from "../../../_enums/SearchEngineTypeEnum";
import { SearchOpenTargetType } from "../../../_enums/SearchOpenTargetEnum";
import { useWallpaperStore } from "../../stores/useWallpaperStore";
import { WallpaperType } from "../../../_enums/WallpaperTypeEnum";
import { VisualSearchEngineOptions } from "../../../_enums/VisualSearchEngineOptionsEnum";


async function getGoogleSuggestions(query) {
    // * Never change the client perameter in this url as other wise the response will be different/complex
    const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data[1] || [];

    } catch (e) {
        console.log(e);
        if (e.message.includes("Failed to fetch") || e instanceof TypeError) {
            alert("Go to browser://extensions (replace browser with the name of your browser) and grant this extension access to https://suggestqueries.google.com/* to enable suggestions. If it still hasn't resolved then contact developer. Alternatively, you can turn off suggestions from the extension’s settings.");
        }
        else {
            alert("Something went wrong. Please turn off suggestions or contact the developer for help.");
        }
        // ! Removing this will cause loop of errors showing because the function will run again and again on I might change this part later
        document.activeElement.blur();
        return [];
    }
}


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
        lastQueries, addLastQuery,
        suggestions, suggestionsEnabled,
        autoSubmitVoiceSearch, searchOpenTarget,
        visualSearchEngine
    } = useSearchdexStore(
        useShallow((state) => ({
            suggestions: state.suggestions,
            lastQueries: state.lastQueries,
            addLastQuery: state.addLastQuery,
            searchEngineType: state.searchEngineType,
            searchOpenTarget: state.searchOpenTarget,
            searchEngines: state.searchEngines,
            currentSearchEngine: state.currentSearchEngine,
            suggestionsEnabled: state.suggestionsEnabled,
            autoSubmitVoiceSearch: state.autoSubmitVoiceSearch,
            visualSearchEngine: state.visualSearchEngine
        }))
    );

    const currentSuggestionsList = typedQuery.trim() === "" ? lastQueries : suggestions;
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

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                console.log("in use effect");
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);




    return (
        <>
            <div className="pokedex-search" ref={containerRef}>
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
                        value={inputValue}
                        onFocus={() => { setIsFocused(true); }}
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
                                    console.log("On escape");
                                    setSelectedSuggestionIndex(-1);
                                    break;
                            }
                        }}
                    />
                </form>


                <div className="extra-dot3" onClick={() => {
                    useWallpaperStore.setState((state) => ({ wallpaperType: state.wallpaperType === WallpaperType.STATIC ? WallpaperType.ANIMATED : WallpaperType.STATIC }));
                }} title="Toggle Wallpaper Type"></div>
                <div className="extra-dot2" title="Previous Wallpaper" onClick={() => {

                }}></div>
                <div className="extra-dot1" title="Next Wallpaper" onClick={() => {

                }}></div>
                <div className="extra-dot0" onClick={() => {
                    // ! Need to add custom role for this button
                }} title="Open Wallpaper Settings">
                </div>
                <div className={`search-btns ${isRecognitionActive ? "active" : ""}`} title="Search by Voice" tabIndex="0" onKeyUp={(e) => {
                    if (e.key === "Enter") {
                        e.target.click();
                    }
                }} onClick={() => {

                    if (!('webkitSpeechRecognition' in window)) {
                        alert('Your browser does not support voice recognition.');
                        return;
                    }

                    if (navigator.brave) {
                        alert("Sorry, Brave does not support this feature.");
                        return;
                    }

                    setIsRecognitionActive(true);

                    const recognition = new webkitSpeechRecognition();
                    recognition.lang = 'en-US';
                    recognition.interimResults = false; // Only return final results
                    recognition.start();

                    recognition.onaudiostart = () => {
                        // console.log("Voice recognition started.");
                    };

                    recognition.onspeechend = () => {
                        // console.log("Speech ended, processing...");
                        recognition.stop();
                    };

                    recognition.onresult = (event) => {
                        const query = event.results[0][0].transcript;
                        // console.log("Voice recognition result:", query);

                        setInputValue(query);
                        setTypedQuery(query);

                        if (autoSubmitVoiceSearch) {
                            formRef.current.requestSubmit();
                        }

                        setIsRecognitionActive(false);
                    };

                    recognition.onerror = (event) => {
                        console.error(event.error);

                        setIsRecognitionActive(false);
                        if (event.error === "aborted") {
                            alert('Voice recognition failed: ' + event.error + ", try refreshing your page.");
                        }
                        else if (event.error === "network")
                            alert('Voice recognition failed: ' + event.error + ",                Note that: This feature is not supported on Vivaldi.");
                    };

                    recognition.onend = () => {
                        // console.log("Recognition ended.");
                        setIsRecognitionActive(false);
                    };

                }}>
                    <img src="icons\voice-search.png" alt="voice search icon" class="search-btns-img" />
                </div>
                <div className="search-btns" id="img-search" title="Search by Image">
                    <a target={searchOpenTarget === SearchOpenTargetType.NEW_TAB ? "_blank" : "_self"} href={visualSearchEngine === VisualSearchEngineOptions.LENS ? "https://lens.google.com/search?" : "https://www.bing.com/visualsearch?"} >
                        <img src="icons\image-search.png" alt="image search icon" class="search-btns-img" />
                    </a>
                </div>


                {showDropdown && (
                    <div id="suggestions" style={{ display: 'block' }}>
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
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
            </div >
        </>
    );
}