import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chromeExtensionStorage } from './_useStore';
import { SearchEngineType } from '../../_enums/SearchEngineTypeEnum';
import { SearchOpenTargetType } from '../../_enums/SearchOpenTargetEnum';
import { VisualSearchEngineOptions } from '../../_enums/VisualSearchEngineOptionsEnum';
import { ActionBtnRole } from '../../_enums/ActionBtnRoleEnum';
import { RecognitionLanguage } from '../../_enums/RecognitionLanguageEnum';


export const useSearchdexStore = create(
    persist(
        (set, get) => ({
            suggestions: [],

            lastQueries: [],
            addLastQuery: (query) => {
                set((state) => {
                    const filteredQueries = state.lastQueries.filter(q => q !== query);
                    const newLastQueries = [query, ...filteredQueries].slice(0, 10);
                    return { lastQueries: newLastQueries };
                });
            },
            removeLastQuery: (queryToRemove) => {
                set((state) => ({
                    lastQueries: state.lastQueries.filter(q => q !== queryToRemove)
                }));
            },
            cleanLastQueries: () => {
                set((state) => ({
                    lastQueries: []
                }));
            },

            searchEngineType: SearchEngineType.BUILTIN,
            searchOpenTarget: SearchOpenTargetType.CURRENT_TAB,
            visualSearchEngine: VisualSearchEngineOptions.LENS,
            searchEngines: [ {name: "Bing", searchUrl: "https://www.bing.com/search?q=%s"}, {name: "Wiki", searchUrl: "https://en.wikipedia.org/w/index.php?search=%s"}],
            currentSearchEngine: -1,
            suggestionsEnabled: true,
            
            trafficLightsEnabled: true,
            actionBtnEnabled: true,
            actionBtnRole: ActionBtnRole.SWITCH_SEARCH_ENGINE,
            
            lastQueriesEnabled: true,
            autoSubmitVoiceSearch: true,
            recognitionLanguage: RecognitionLanguage.EN_US,
        }),
        {
            name: 'searchdex-store',
            storage: chromeExtensionStorage,


            partialize: (state) => {
                const storableStates = Object.fromEntries(
                    Object.entries(state).filter(([key, value]) => typeof value !== 'function')
                );

                delete storableStates.suggestions;




                return storableStates;
            }
        }
    )
);



