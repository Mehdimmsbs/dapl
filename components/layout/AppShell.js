"use client";

import { useEffect, useRef, useState } from "react";

import DepthExperience from "../ui/DepthExperience";
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

  const [mobile, setMobile] = useState(false);
  const shellRef = useRef(null);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px)");
    function sync() {
      setMobile(query.matches);
      if (!query.matches) setMobileMenuOpen(false);
    }
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen || !mobile) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const sidebar = shellRef.current?.querySelector(".sidebar");
    const controls = () => [
      ...sidebar.querySelectorAll("a[href], button:not(:disabled)"),
    ];
    controls()[0]?.focus();
    document.body.style.overflow = "hidden";
    function handleKey(event) {
      if (event.key === "Escape") setMobileMenuOpen(false);
      if (event.key !== "Tab") return;
      const items = controls();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [mobileMenuOpen, mobile]);

  return (
    <div
      ref={shellRef}
      className={[
        "appShell",
        collapsed ? "sideCollapsed" : "",
        mobileMenuOpen ? "mobileMenuOpen" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <DepthExperience />
      <button
        type="button"
        className="mobileMenuBackdrop"
        aria-label="Close menu"
        tabIndex={-1}
        aria-hidden={!mobileMenuOpen}
        onClick={() => setMobileMenuOpen(false)}
      />

      <AppSidebar
        hiddenOnMobile={mobile && !mobileMenuOpen}
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

      <div className="main" inert={mobile && mobileMenuOpen}>
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
