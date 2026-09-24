"use client";

import {
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CirclePlus,
    House,
    Menu,
    Moon,
    RefreshCw,
    Settings,
    Sun,
} from "lucide-react";

const ICONS = {
    home: House,
    calendar: CalendarDays,
    add: CirclePlus,
    routines: RefreshCw,
    settings: Settings,
    moon: Moon,
    sun: Sun,
    menu: Menu,
    "chevron-left": ChevronLeft,
    "chevron-right": ChevronRight,
    "chevron-down": ChevronDown,
};

export default function AppIcon({
    name,
    size = 25,
    className = "",
    strokeWidth = 1.8,
}) {
    const Icon = ICONS[name];

    if (!Icon) {
        return null;
    }

    return (
        <Icon
            aria-hidden="true"
            focusable="false"
            size={size}
            strokeWidth={strokeWidth}
            className={`appIcon ${className}`.trim()}
        />
    );
}