"use client";

import { useState } from "react";

import AppSidebar from "./AppSidebar";
import MobileNav from "./MobileNav";
import Topbar from "./Topbar";

/* Provides one shared responsive layout for every page. */
export default function AppShell({
    activePage,
    children,
    displayDate = "",
    onOpenSettings,
}) {
    const [collapsed, setCollapsed] =
        useState(false);

    /* Opens or closes the desktop sidebar. */
    function toggleSidebar() {
        setCollapsed(
            (currentValue) => !currentValue,
        );
    }

    return (
        <div
            className={`appShell ${collapsed ? "sideCollapsed" : ""
                }`}
        >
            <AppSidebar
                activePage={activePage}
                collapsed={collapsed}
                displayDate={displayDate}
                onToggle={toggleSidebar}
            />

            <div className="main">
                <Topbar
                    activePage={activePage}
                    onOpenSettings={onOpenSettings}
                    onToggleMenu={toggleSidebar}
                />

                {children}

                <MobileNav
                    activePage={activePage}
                />
            </div>
        </div>
    );
}