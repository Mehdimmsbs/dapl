import Image from "next/image";

/* Renders the official My Day brand asset. */
export default function BrandLogo({
    width = 52,
    className = "",
}) {
    return (
        <Image
            className={`brandLogo ${className}`.trim()}
            src="/icons/my-day-logo.png"
            alt=""
            width={width}
            height={Math.round(width * 0.67)}
            priority
            aria-hidden="true"
        />
    );
}