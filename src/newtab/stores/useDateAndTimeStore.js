import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chromeExtensionStorage } from './_useStore';
import { ClockType } from '../../_enums/ClockTypeEnum';
import { TimeWidgetStyle } from '../../_enums/TimeWidgetStyleEnum';


export const useDateAndTimeStore = create(
    persist(
        (set, get) => ({
            timeFontSize: "64px",
            meridiemFontSize: "16px",

            clockType: ClockType.HR_12,
            secondsEnabled: true,
            timeWidgetStyle: TimeWidgetStyle.SUPERSCRIPTED
        }),
        {
            name: 'date-and-time-store',
            storage: chromeExtensionStorage,


            partialize: (state) => {
                const storableStates = Object.fromEntries(
                    Object.entries(state).filter(([key, value]) => typeof value !== 'function')
                );





                return storableStates;
            }
        }
    )
);



