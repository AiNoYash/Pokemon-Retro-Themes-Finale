import { useState, useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { ClockType } from "../../../_enums/ClockTypeEnum";
import { useDateAndTimeStore } from "../../stores/useDateAndTimeStore";
import "./TimeWidget.css";
import { TimeWidgetStyle } from "../../../_enums/TimeWidgetStyleEnum";



export function TimeWidget() {

    const {
        clockType,
        secondsEnabled,
        timeWidgetStyle,
        timeFontSize,
        meridiemFontSize
    } = useDateAndTimeStore(
        useShallow((state) => ({
            clockType: state.clockType,
            secondsEnabled: state.secondsEnabled,
            timeWidgetStyle: state.timeWidgetStyle,
            meridiemFontSize: state.meridiemFontSize,
            timeFontSize: state.timeFontSize
        }))
    );

    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setDate(new Date());
        }, 1000);


        return () => clearInterval(timerId);
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty('--meridiem-font-size', meridiemFontSize);
    }, [meridiemFontSize]);

    useEffect(() => {
        document.documentElement.style.setProperty('--time-font-size', timeFontSize);
    }, [timeFontSize]);



    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    let meridiem = hours >= 12 ? 'PM' : 'AM';

    if (clockType === ClockType.HR_24) {
        hours = hours.toString().padStart(2, '0');
    } else {
        hours = hours % 12 || 12;
        hours = hours.toString().padStart(2, '0');
    }


    const renderTimeWidget = () => {
        switch (timeWidgetStyle) {
            case TimeWidgetStyle.INLINE:
                return (
                    <div className="time-widget style-inline">
                        <div className="time-display">
                            {`${hours}:${minutes}${secondsEnabled ? ":" + seconds : ""}`}
                        </div>
                        &nbsp;
                        {clockType === ClockType.HR_12 && (
                            <div className="meridiem-display">{meridiem}</div>
                        )}
                    </div>
                );
            case TimeWidgetStyle.INLINE_REVERSE:
                return (
                    <div className="time-widget style-inline">
                        {clockType === ClockType.HR_12 && (
                            <div className="meridiem-display">{meridiem}</div>
                        )}
                        &nbsp;
                        <div className="time-display">
                            {`${hours}:${minutes}${secondsEnabled ? ":" + seconds : ""}`}
                        </div>

                    </div>
                );
            case TimeWidgetStyle.STACKED:
                return (
                    <div className="time-widget style-stacked">
                        <div className="time-display">
                            {`${hours}:${minutes}${secondsEnabled ? ":" + seconds : ""}`}
                        </div>
                        {clockType === ClockType.HR_12 && (
                            <div className="meridiem-display">{meridiem}</div>
                        )}
                    </div>
                );
            case TimeWidgetStyle.STACKED_REVERSE:
                return (
                    <div className="time-widget style-stacked">
                        {clockType === ClockType.HR_12 && (
                            <div className="meridiem-display">{meridiem}</div>
                        )}
                        <div className="time-display">
                            {`${hours}:${minutes}${secondsEnabled ? ":" + seconds : ""}`}
                        </div>
                    </div>
                );
            case TimeWidgetStyle.SUPERSCRIPTED:
                return (
                    <div className="time-widget style-superscripted">
                        <div className="time-display">
                            {`${hours}:${minutes}${secondsEnabled ? ":" + seconds : ""}`}
                            {clockType === ClockType.HR_12 && (
                                <sup className="meridiem-display">{meridiem}</sup>
                            )}
                        </div>
                    </div>
                );
            default:
                return <></>;
        }
    };

    return (
        <>
            {renderTimeWidget()}
        </>
    );
}