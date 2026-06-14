import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chromeExtensionStorage } from './_useStore';
import { SearchEngineType } from '../../_enums/SearchEngineTypeEnum';
import { SearchOpenTargetType } from '../../_enums/SearchOpenTargetEnum';
import { VisualSearchEngineOptions } from '../../_enums/VisualSearchEngineOptionsEnum';


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

            searchEngineType: SearchEngineType.BUILTIN,
            searchOpenTarget: SearchOpenTargetType.CURRENT_TAB,
            visualSearchEngine: VisualSearchEngineOptions.LENS,
            searchEngines: [],
            currentSearchEngine: -1,
            suggestionsEnabled: true,
            autoSubmitVoiceSearch: true
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



