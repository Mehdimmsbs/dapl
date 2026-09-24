import Image from "next/image";

const ICONS = {
    home: "/icons/home.png",
    calendar: "/icons/calendar.png",
    add: "/icons/new-task.png",
    routines: "/icons/routines.png",
    settings: "/icons/settings.png",
    moon: "/icons/moon.png",
};

export default function AppIcon({
    name,
    size = 22,
    className = "",
}) {
    const src = ICONS[name];

    if (!src) {
        return null;
    }

    return (
        <Image
            src={src}
            alt=""
            aria-hidden="true"
            width={size}
            height={size}
            className={`appIcon ${className}`.trim()}
        />
    );
}