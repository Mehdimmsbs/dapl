/* Defines installable application metadata. */
export default function manifest() {
    return {
        id: "/",
        name: "My Day – Personal Planner",
        short_name: "My Day",
        description:
            "A multilingual personal daily planner for tasks, routines and calendars.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#f6f8fd",
        theme_color: "#5b5cf6",
        lang: "en",
        dir: "auto",

        icons: [
            {
                src: "/icons/my-day-logo.png",
                sizes: "any",
                type: "image/png",
                purpose: "any maskable",
            },
        ],
    };
}