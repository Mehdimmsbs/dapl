"use client";

import { useState } from "react";

import AppSidebar from "./AppSidebar";
import MobileNav from "./MobileNav";
import Topbar from "./Topbar";

export default function AppShell({
    activePage,
    children,
    displayDate = "",
    onOpenSettings,
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div
            className={[
                "appShell",
                collapsed ? "sideCollapsed" : "",
                mobileMenuOpen ? "mobileMenuOpen" : "",
            ].filter(Boolean).join(" ")}
        >
            {mobileMenuOpen && (
                <button
                    type="button"
                    className="mobileMenuBackdrop"
                    aria-label="Close menu"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <AppSidebar
                activePage={activePage}
                collapsed={collapsed}
                displayDate={displayDate}
                onToggle={() => {
                    if (window.matchMedia("(max-width: 900px)").matches) {
                        setMobileMenuOpen(false);
                    } else {
                        setCollapsed((value) => !value);
                    }
                }}
                onNavigate={() => setMobileMenuOpen(false)}
            />

            <div className="main">
                <Topbar
                    activePage={activePage}
                    onOpenSettings={onOpenSettings}
                    mobileMenuOpen={mobileMenuOpen}
                    onToggleMenu={() => setMobileMenuOpen((value) => !value)}
                />

                {children}

                <MobileNav activePage={activePage} />
            </div>
        </div>
    );
}