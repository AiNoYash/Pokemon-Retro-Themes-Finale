import { useState, useEffect, useRef } from "react";
import "./EditingPane.css";

export function EditingPane() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const dragRef = useRef({
        startX: 0, startY: 0,
        lastX: 0, lastY: 0,
        currentX: 0, currentY: 0
    });

    const handlePointerDown = (e) => {
        setIsDragging(true);
        dragRef.current.startX = e.clientX;
        dragRef.current.startY = e.clientY;
    };

    useEffect(() => {
        const handlePointerMove = (e) => {
            if (!isDragging) return;

            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;

            const newX = dragRef.current.lastX + dx;
            const newY = dragRef.current.lastY + dy;

            dragRef.current.currentX = newX;
            dragRef.current.currentY = newY;

            setPosition({ x: newX, y: newY });
        };

        const handlePointerUp = () => {
            if (isDragging) {
                setIsDragging(false);
                dragRef.current.lastX = dragRef.current.currentX;
                dragRef.current.lastY = dragRef.current.currentY;
            }
        };

        if (isDragging) {
            window.addEventListener("pointermove", handlePointerMove);
            window.addEventListener("pointerup", handlePointerUp);
        }

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [isDragging]); // Only re-bind listeners when drag state actually changes

    return (
        <div
            className="editing-pane-container"
            style={{
                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`
            }}
        >
            <div
                className="editing-pane-heading"
                onPointerDown={handlePointerDown}
                style={{ cursor: isDragging ? "grabbing" : "grab" }}
            >
                Editing Pane
            </div>
            <div className="editing-pane-content-container">
                {/* Content goes here */}
            </div>
        </div>
    );
}