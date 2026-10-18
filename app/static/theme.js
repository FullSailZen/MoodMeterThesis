const THEME_STORAGE_KEY =
    "moodmeter-theme";

const CUSTOM_THEME_STORAGE_KEY =
    "moodmeter-custom-theme";


let activePresetName =
    null;

let customInputsDirty =
    false;


const themePresets = {

    moodmeter: {
        name:
            "MoodMeter",

        description:
            "Original purple, pink, and blue neon theme.",

        colors: {
            bg:
                "#160D35",

            bgDeep:
                "#0D061F",

            bgSoft:
                "#21104A",

            primary:
                "#6929FF",

            primarySoft:
                "#9C78FF",

            secondary:
                "#FF3DA5",

            secondarySoft:
                "#FF7FC3",

            accent:
                "#00A8FF",

            accentSoft:
                "#71D2FF",

            extra:
                "#FF7B3D",

            card:
                "#24134F",

            cardBright:
                "#301568",

            cardHover:
                "#391879",

            input:
                "#28145B",

            text:
                "#E6DDFF",

            textSoft:
                "#BCAEE2",

            border:
                "#5733A4",

            borderBright:
                "#7D50E0"
        }
    },


    ocean: {
        name:
            "Ocean",

        description:
            "Deep blue with bright cyan highlights.",

        colors: {
            bg:
                "#071B2D",

            bgDeep:
                "#020A12",

            bgSoft:
                "#0B3049",

            primary:
                "#0077FF",

            primarySoft:
                "#5CA8FF",

            secondary:
                "#00D4FF",

            secondarySoft:
                "#7CEAFF",

            accent:
                "#00FFA8",

            accentSoft:
                "#8AFFD5",

            extra:
                "#42A5FF",

            card:
                "#0D2940",

            cardBright:
                "#123A59",

            cardHover:
                "#174B70",

            input:
                "#0C3551",

            text:
                "#E6F8FF",

            textSoft:
                "#A9D2E5",

            border:
                "#17638E",

            borderBright:
                "#28AEE5"
        }
    },


    emerald: {
        name:
            "Emerald",

        description:
            "Dark green with emerald and teal accents.",

        colors: {
            bg:
                "#08251F",

            bgDeep:
                "#03100D",

            bgSoft:
                "#0B382F",

            primary:
                "#00A86B",

            primarySoft:
                "#58D7A8",

            secondary:
                "#12E2A3",

            secondarySoft:
                "#83FFD4",

            accent:
                "#00D9D2",

            accentSoft:
                "#7DFFFB",

            extra:
                "#D7E835",

            card:
                "#0E352C",

            cardBright:
                "#12493B",

            cardHover:
                "#175C4B",

            input:
                "#103E34",

            text:
                "#E7FFF7",

            textSoft:
                "#B0DCCD",

            border:
                "#217C65",

            borderBright:
                "#35C99F"
        }
    },


    crimson: {
        name:
            "Crimson",

        description:
            "Dark red with crimson and amber highlights.",

        colors: {
            bg:
                "#2B0A12",

            bgDeep:
                "#100307",

            bgSoft:
                "#44101C",

            primary:
                "#C1123C",

            primarySoft:
                "#FF657F",

            secondary:
                "#FF315D",

            secondarySoft:
                "#FF8CA4",

            accent:
                "#FFB000",

            accentSoft:
                "#FFD36B",

            extra:
                "#FF623D",

            card:
                "#3A101B",

            cardBright:
                "#501523",

            cardHover:
                "#661B2D",

            input:
                "#46131F",

            text:
                "#FFF0F3",

            textSoft:
                "#E7B7C0",

            border:
                "#8B2941",

            borderBright:
                "#DB4666"
        }
    },


    light: {
        name:
            "Light",

        description:
            "High-contrast light theme for readability.",

        colors: {
            bg:
                "#F1F5FA",

            bgDeep:
                "#DCE5EF",

            bgSoft:
                "#FFFFFF",

            primary:
                "#5130B8",

            primarySoft:
                "#7256CF",

            secondary:
                "#B00067",

            secondarySoft:
                "#C63D89",

            accent:
                "#006FAF",

            accentSoft:
                "#278FC9",

            extra:
                "#C45600",

            card:
                "#FFFFFF",

            cardBright:
                "#F4F6FA",

            cardHover:
                "#E8EDF4",

            input:
                "#FFFFFF",

            text:
                "#121821",

            textSoft:
                "#485565",

            border:
                "#AAB7C5",

            borderBright:
                "#64788D"
        }
    }
};


function hexToRgb(
    hex
) {
    const cleaned =
        hex.replace(
            "#",
            ""
        );


    if (
        cleaned.length !== 6
    ) {
        return {
            r: 0,
            g: 0,
            b: 0
        };
    }


    return {
        r:
            parseInt(
                cleaned.substring(
                    0,
                    2
                ),
                16
            ),

        g:
            parseInt(
                cleaned.substring(
                    2,
                    4
                ),
                16
            ),

        b:
            parseInt(
                cleaned.substring(
                    4,
                    6
                ),
                16
            )
    };
}


function rgba(
    hex,
    alpha
) {
    const rgb =
        hexToRgb(
            hex
        );


    return (
        `rgba(${rgb.r}, `
        +
        `${rgb.g}, `
        +
        `${rgb.b}, `
        +
        `${alpha})`
    );
}


function darkenColor(
    hex,
    amount
) {
    const rgb =
        hexToRgb(
            hex
        );


    const darken =
        function (
            value
        ) {
            return Math.max(
                0,
                Math.round(
                    value
                    *
                    (
                        1 - amount
                    )
                )
            );
        };


    const r =
        darken(
            rgb.r
        )
        .toString(16)
        .padStart(
            2,
            "0"
        );

    const g =
        darken(
            rgb.g
        )
        .toString(16)
        .padStart(
            2,
            "0"
        );

    const b =
        darken(
            rgb.b
        )
        .toString(16)
        .padStart(
            2,
            "0"
        );


    return (
        `#${r}${g}${b}`
    );
}


function lightenColor(
    hex,
    amount
) {
    const rgb =
        hexToRgb(
            hex
        );


    const lighten =
        function (
            value
        ) {
            return Math.min(
                255,
                Math.round(
                    value
                    +
                    (
                        255 - value
                    )
                    *
                    amount
                )
            );
        };


    const r =
        lighten(
            rgb.r
        )
        .toString(16)
        .padStart(
            2,
            "0"
        );

    const g =
        lighten(
            rgb.g
        )
        .toString(16)
        .padStart(
            2,
            "0"
        );

    const b =
        lighten(
            rgb.b
        )
        .toString(16)
        .padStart(
            2,
            "0"
        );


    return (
        `#${r}${g}${b}`
    );
}


function createCustomTheme(
    values
) {
    return {
        name:
            "Custom",

        description:
            "Custom MoodMeter colorway.",

        colors: {
            bg:
                values.background,

            bgDeep:
                darkenColor(
                    values.background,
                    0.48
                ),

            bgSoft:
                lightenColor(
                    values.background,
                    0.10
                ),

            primary:
                values.primary,

            primarySoft:
                lightenColor(
                    values.primary,
                    0.32
                ),

            secondary:
                values.secondary,

            secondarySoft:
                lightenColor(
                    values.secondary,
                    0.34
                ),

            accent:
                values.accent,

            accentSoft:
                lightenColor(
                    values.accent,
                    0.36
                ),

            extra:
                values.extra,

            card:
                values.card,

            cardBright:
                lightenColor(
                    values.card,
                    0.10
                ),

            cardHover:
                lightenColor(
                    values.card,
                    0.17
                ),

            input:
                lightenColor(
                    values.card,
                    0.07
                ),

            text:
                values.text,

            textSoft:
                values.textSoft,

            border:
                lightenColor(
                    values.card,
                    0.26
                ),

            borderBright:
                values.accent
        }
    };
}


function applyTheme(
    theme
) {
    if (
        !theme
        ||
        !theme.colors
    ) {
        return;
    }


    const colors =
        theme.colors;

    const root =
        document.documentElement;


    root.style.setProperty(
        "--mm-bg",
        colors.bg
    );

    root.style.setProperty(
        "--mm-bg-deep",
        colors.bgDeep
    );

    root.style.setProperty(
        "--mm-bg-soft",
        colors.bgSoft
    );

    root.style.setProperty(
        "--mm-purple",
        colors.primary
    );

    root.style.setProperty(
        "--mm-purple-soft",
        colors.primarySoft
    );

    root.style.setProperty(
        "--mm-pink",
        colors.secondary
    );

    root.style.setProperty(
        "--mm-pink-soft",
        colors.secondarySoft
    );

    root.style.setProperty(
        "--mm-pink-bright",
        colors.secondary
    );

    root.style.setProperty(
        "--mm-blue",
        colors.accent
    );

    root.style.setProperty(
        "--mm-blue-soft",
        colors.accentSoft
    );

    root.style.setProperty(
        "--mm-orange",
        colors.extra
    );

    root.style.setProperty(
        "--mm-orange-soft",
        lightenColor(
            colors.extra,
            0.30
        )
    );

    root.style.setProperty(
        "--mm-card",
        colors.card
    );

    root.style.setProperty(
        "--mm-card-bright",
        colors.cardBright
    );

    root.style.setProperty(
        "--mm-card-hover",
        colors.cardHover
    );

    root.style.setProperty(
        "--mm-input",
        colors.input
    );

    root.style.setProperty(
        "--mm-text",
        colors.text
    );

    root.style.setProperty(
        "--mm-text-soft",
        colors.textSoft
    );

    root.style.setProperty(
        "--mm-border",
        colors.border
    );

    root.style.setProperty(
        "--mm-border-bright",
        colors.borderBright
    );


    root.style.setProperty(
        "--theme-primary-rgba-08",
        rgba(
            colors.primary,
            0.08
        )
    );

    root.style.setProperty(
        "--theme-primary-rgba-10",
        rgba(
            colors.primary,
            0.10
        )
    );

    root.style.setProperty(
        "--theme-primary-rgba-16",
        rgba(
            colors.primary,
            0.16
        )
    );

    root.style.setProperty(
        "--theme-primary-rgba-18",
        rgba(
            colors.primary,
            0.18
        )
    );

    root.style.setProperty(
        "--theme-primary-rgba-30",
        rgba(
            colors.primary,
            0.30
        )
    );

    root.style.setProperty(
        "--theme-primary-rgba-40",
        rgba(
            colors.primary,
            0.40
        )
    );

    root.style.setProperty(
        "--theme-primary-rgba-46",
        rgba(
            colors.primary,
            0.46
        )
    );

    root.style.setProperty(
        "--theme-secondary-rgba-18",
        rgba(
            colors.secondary,
            0.18
        )
    );

    root.style.setProperty(
        "--theme-secondary-rgba-22",
        rgba(
            colors.secondary,
            0.22
        )
    );

    root.style.setProperty(
        "--theme-secondary-rgba-30",
        rgba(
            colors.secondary,
            0.30
        )
    );

    root.style.setProperty(
        "--theme-secondary-rgba-34",
        rgba(
            colors.secondary,
            0.34
        )
    );

    root.style.setProperty(
        "--theme-secondary-rgba-55",
        rgba(
            colors.secondary,
            0.55
        )
    );

    root.style.setProperty(
        "--theme-secondary-rgba-65",
        rgba(
            colors.secondary,
            0.65
        )
    );

    root.style.setProperty(
        "--theme-accent-rgba-18",
        rgba(
            colors.accent,
            0.18
        )
    );

    root.style.setProperty(
        "--theme-accent-rgba-22",
        rgba(
            colors.accent,
            0.22
        )
    );

    root.style.setProperty(
        "--theme-accent-rgba-35",
        rgba(
            colors.accent,
            0.35
        )
    );

    root.style.setProperty(
        "--theme-accent-rgba-55",
        rgba(
            colors.accent,
            0.55
        )
    );

    root.style.setProperty(
        "--theme-accent-rgba-70",
        rgba(
            colors.accent,
            0.70
        )
    );

    root.style.setProperty(
        "--theme-accent-rgba-85",
        rgba(
            colors.accent,
            0.85
        )
    );

    root.style.setProperty(
        "--theme-accent-rgba-95",
        rgba(
            colors.accent,
            0.95
        )
    );

    root.style.setProperty(
        "--theme-extra-rgba-12",
        rgba(
            colors.extra,
            0.12
        )
    );

    root.style.setProperty(
        "--theme-card-shadow",
        rgba(
            colors.bgDeep,
            0.62
        )
    );


    root.dataset.moodmeterTheme =
        theme.name;
}


function themeToCustomValues(
    theme
) {
    return {
        background:
            theme.colors.bg,

        card:
            theme.colors.card,

        primary:
            theme.colors.primary,

        secondary:
            theme.colors.secondary,

        accent:
            theme.colors.accent,

        extra:
            theme.colors.extra,

        text:
            theme.colors.text,

        textSoft:
            theme.colors.textSoft
    };
}


function setCustomInputs(
    values
) {
    document.getElementById(
        "theme-background"
    ).value =
        values.background;

    document.getElementById(
        "theme-card"
    ).value =
        values.card;

    document.getElementById(
        "theme-primary"
    ).value =
        values.primary;

    document.getElementById(
        "theme-secondary"
    ).value =
        values.secondary;

    document.getElementById(
        "theme-accent"
    ).value =
        values.accent;

    document.getElementById(
        "theme-extra"
    ).value =
        values.extra;

    document.getElementById(
        "theme-text"
    ).value =
        values.text;

    document.getElementById(
        "theme-text-soft"
    ).value =
        values.textSoft;
}


function savePresetTheme(
    presetName
) {
    localStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({
            type:
                "preset",

            name:
                presetName
        })
    );
}


function saveCustomTheme(
    customValues
) {
    localStorage.setItem(
        CUSTOM_THEME_STORAGE_KEY,
        JSON.stringify(
            customValues
        )
    );

    localStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({
            type:
                "custom"
        })
    );
}


function loadSavedTheme() {
    const savedValue =
        localStorage.getItem(
            THEME_STORAGE_KEY
        );


    if (!savedValue) {
        activePresetName =
            "moodmeter";

        customInputsDirty =
            false;

        applyTheme(
            themePresets.moodmeter
        );

        return;
    }


    try {
        const saved =
            JSON.parse(
                savedValue
            );


        if (
            saved.type === "preset"
            &&
            themePresets[
                saved.name
            ]
        ) {
            activePresetName =
                saved.name;

            customInputsDirty =
                false;

            applyTheme(
                themePresets[
                    saved.name
                ]
            );

            return;
        }


        if (
            saved.type
            === "custom"
        ) {
            const customValue =
                localStorage.getItem(
                    CUSTOM_THEME_STORAGE_KEY
                );


            if (customValue) {
                const customColors =
                    JSON.parse(
                        customValue
                    );


                activePresetName =
                    null;

                customInputsDirty =
                    true;


                applyTheme(
                    createCustomTheme(
                        customColors
                    )
                );

                return;
            }
        }

    } catch (error) {
        console.error(
            "MoodMeter theme could not be loaded.",
            error
        );
    }


    activePresetName =
        "moodmeter";

    customInputsDirty =
        false;


    applyTheme(
        themePresets.moodmeter
    );
}


function injectThemeStyles() {
    if (
        document.getElementById(
            "moodmeter-theme-styles"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "moodmeter-theme-styles";


    style.textContent = `

        body {
            background:
                radial-gradient(
                    circle at 14% 5%,
                    var(--theme-primary-rgba-46),
                    transparent 28%
                ),
                radial-gradient(
                    circle at 92% 14%,
                    var(--theme-secondary-rgba-34),
                    transparent 28%
                ),
                radial-gradient(
                    circle at 77% 80%,
                    var(--theme-accent-rgba-22),
                    transparent 32%
                ),
                radial-gradient(
                    circle at 15% 88%,
                    var(--theme-extra-rgba-12),
                    transparent 28%
                ),
                linear-gradient(
                    180deg,
                    var(--mm-bg-deep),
                    var(--mm-bg)
                ) !important;
        }


        .topbar {
            background:
                linear-gradient(
                    90deg,
                    var(--mm-bg-soft) 0%,
                    var(--mm-purple) 36%,
                    var(--mm-pink) 100%
                ) !important;

            border-bottom-color:
                var(--theme-secondary-rgba-65) !important;

            box-shadow:
                0 6px 30px
                var(--theme-primary-rgba-40),
                0 0 44px
                var(--theme-secondary-rgba-22) !important;
        }


        .brand h1 {
            background:
                linear-gradient(
                    90deg,
                    var(--mm-pink),
                    #D94BFF,
                    var(--mm-purple-soft)
                ) !important;

            -webkit-background-clip:
                text !important;

            background-clip:
                text !important;

            -webkit-text-fill-color:
                transparent !important;

            color:
                transparent !important;

            -webkit-text-stroke:
                1.2px
                #000000 !important;

            text-shadow:
                0 0 2px
                var(--theme-secondary-rgba-55),
                0 0 5px
                var(--theme-secondary-rgba-30) !important;
        }


        .brand p {
            color:
                var(--mm-blue-soft) !important;

            -webkit-text-stroke:
                0.6px
                #000000 !important;

            text-shadow:
                0 0 2px
                rgba(
                    0,
                    0,
                    0,
                    0.75
                ) !important;
        }


        .card {
            background:
                radial-gradient(
                    circle at top right,
                    var(--theme-primary-rgba-16),
                    transparent 35%
                ),
                linear-gradient(
                    145deg,
                    var(--mm-card),
                    var(--mm-card-bright)
                ) !important;

            box-shadow:
                0 18px 45px
                var(--theme-card-shadow),
                0 0 0 1px
                var(--theme-primary-rgba-08),
                0 0 38px
                var(--theme-primary-rgba-10) !important;
        }


        input,
        select,
        textarea {
            background:
                linear-gradient(
                    145deg,
                    var(--mm-input),
                    var(--mm-card-bright)
                ) !important;

            color:
                var(--mm-text) !important;

            border-color:
                var(--mm-border-bright) !important;
        }


        input:focus,
        select:focus,
        textarea:focus {
            border-color:
                var(--mm-blue) !important;

            box-shadow:
                0 0 0 3px
                var(--theme-accent-rgba-18),
                0 0 14px
                var(--theme-accent-rgba-18) !important;
        }


        .nav-link,
        .theme-menu-button {
            -webkit-text-stroke:
                0.75px
                rgba(
                    0,
                    0,
                    0,
                    0.95
                ) !important;

            text-shadow:
                -1px -1px 0
                rgba(
                    0,
                    0,
                    0,
                    0.92
                ),
                1px -1px 0
                rgba(
                    0,
                    0,
                    0,
                    0.92
                ),
                -1px 1px 0
                rgba(
                    0,
                    0,
                    0,
                    0.92
                ),
                1px 1px 0
                rgba(
                    0,
                    0,
                    0,
                    0.92
                ),
                0 0 3px
                rgba(
                    0,
                    0,
                    0,
                    0.98
                ) !important;
        }


        .nav-link:hover,
        .theme-menu-button:hover {
            background:
                var(--theme-primary-rgba-30) !important;

            border-color:
                var(--theme-accent-rgba-55) !important;

            color:
                var(--mm-blue) !important;
        }


        .nav-link.active {
            background:
                linear-gradient(
                    90deg,
                    var(--theme-secondary-rgba-22),
                    var(--theme-primary-rgba-30)
                ) !important;
        }


        .theme-menu-button {
            position:
                relative;

            font-family:
                inherit;

            font-size:
                16px;

            font-weight:
                900;

            letter-spacing:
                0.5px;

            padding:
                11px 16px;

            color:
                var(--mm-pink-soft);

            background:
                transparent;

            border:
                1px solid
                transparent;

            border-radius:
                11px;

            cursor:
                pointer;

            transition:
                background 0.18s ease,
                color 0.18s ease,
                transform 0.18s ease,
                box-shadow 0.18s ease,
                border-color 0.18s ease;
        }


        .theme-menu-button:hover {
            transform:
                translateY(-1px);

            box-shadow:
                0 0 10px
                var(--theme-accent-rgba-22);
        }


        .theme-overlay {
            position:
                fixed;

            inset:
                0;

            z-index:
                99999;

            display:
                flex;

            justify-content:
                center;

            align-items:
                center;

            padding:
                24px;

            background:
                rgba(
                    0,
                    0,
                    0,
                    0.72
                );

            backdrop-filter:
                blur(8px);
        }


        .theme-overlay.hidden {
            display:
                none;
        }


        .theme-panel {
            width:
                min(
                    760px,
                    100%
                );

            max-height:
                90vh;

            overflow-y:
                auto;

            padding:
                28px;

            color:
                var(--mm-text);

            background:
                linear-gradient(
                    145deg,
                    var(--mm-card),
                    var(--mm-card-bright)
                );

            border:
                1px solid
                var(--mm-border-bright);

            border-radius:
                20px;

            box-shadow:
                0 24px 70px
                rgba(
                    0,
                    0,
                    0,
                    0.55
                ),
                0 0 30px
                var(--theme-primary-rgba-30);
        }


        .theme-panel-header {
            display:
                flex;

            justify-content:
                space-between;

            align-items:
                flex-start;

            gap:
                20px;

            margin-bottom:
                25px;
        }


        .theme-panel-header h2 {
            margin:
                0 0 7px;

            color:
                var(--mm-pink);

            font-size:
                28px;
        }


        .theme-panel-header p {
            margin:
                0;

            color:
                var(--mm-text-soft);

            line-height:
                1.5;
        }


        .theme-close-button {
            width:
                42px;

            height:
                42px;

            flex:
                0 0 42px;

            border:
                1px solid
                var(--mm-border-bright);

            border-radius:
                11px;

            background:
                var(--mm-input);

            color:
                var(--mm-text);

            font-size:
                24px;

            cursor:
                pointer;
        }


        .theme-preset-grid {
            display:
                grid;

            grid-template-columns:
                repeat(
                    auto-fit,
                    minmax(
                        180px,
                        1fr
                    )
                );

            gap:
                14px;

            margin-bottom:
                30px;
        }


        .theme-preset {
            padding:
                15px;

            text-align:
                left;

            color:
                var(
                    --preset-text
                ) !important;

            background:
                linear-gradient(
                    145deg,
                    var(
                        --preset-card
                    ),
                    var(
                        --preset-card-bright
                    )
                ) !important;

            border:
                1px solid
                var(
                    --preset-border
                ) !important;

            border-radius:
                14px;

            cursor:
                pointer;

            box-shadow:
                inset 0 0 18px
                var(
                    --preset-glow
                );

            transition:
                transform 0.15s ease,
                border-color 0.15s ease,
                box-shadow 0.15s ease;
        }


        .theme-preset:hover {
            transform:
                translateY(-2px);

            border-color:
                var(
                    --preset-accent
                ) !important;

            box-shadow:
                0 0 14px
                var(
                    --preset-glow
                ),
                inset 0 0 18px
                var(
                    --preset-glow
                );
        }


        .theme-preset-name {
            display:
                block;

            margin-bottom:
                5px;

            color:
                var(
                    --preset-secondary
                ) !important;

            font-size:
                16px;

            font-weight:
                900;
        }


        .theme-preset-description {
            display:
                block;

            min-height:
                38px;

            margin-bottom:
                12px;

            color:
                var(
                    --preset-text-soft
                ) !important;

            font-size:
                13px;

            line-height:
                1.4;
        }


        .theme-swatch-row {
            display:
                flex;

            gap:
                7px;
        }


        .theme-swatch {
            width:
                24px;

            height:
                24px;

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.32
                );

            border-radius:
                50%;
        }


        .theme-custom-section {
            padding-top:
                25px;

            border-top:
                1px solid
                var(--mm-border);
        }


        .theme-custom-section h3 {
            margin:
                0 0 5px;

            color:
                var(--mm-blue);
        }


        .theme-custom-section > p {
            margin:
                0 0 20px;

            color:
                var(--mm-text-soft);
        }


        .theme-custom-grid {
            display:
                grid;

            grid-template-columns:
                repeat(
                    2,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap:
                15px;
        }


        .theme-color-field {
            display:
                flex;

            align-items:
                center;

            justify-content:
                space-between;

            gap:
                12px;

            padding:
                11px 13px;

            background:
                var(--mm-input);

            border:
                1px solid
                var(--mm-border);

            border-radius:
                11px;
        }


        .theme-color-field label {
            color:
                var(--mm-text);

            font-weight:
                700;
        }


        .theme-color-field input[type="color"] {
            width:
                52px;

            height:
                36px;

            padding:
                2px;

            border:
                1px solid
                var(--mm-border-bright);

            border-radius:
                8px;

            cursor:
                pointer;
        }


        .theme-actions {
            display:
                flex;

            justify-content:
                flex-end;

            flex-wrap:
                wrap;

            gap:
                10px;

            margin-top:
                22px;
        }


        .theme-action-button {
            padding:
                11px 17px;

            border:
                1px solid
                var(--mm-border-bright);

            border-radius:
                10px;

            font-family:
                inherit;

            font-weight:
                800;

            cursor:
                pointer;
        }


        .theme-apply-button {
            color:
                var(--mm-bg-deep);

            background:
                var(--mm-blue);

            border-color:
                var(--mm-blue);
        }


        .theme-reset-button {
            color:
                var(--mm-text);

            background:
                var(--mm-input);
        }


        @media (
            max-width:
            720px
        ) {

            .navigation {
                flex-wrap:
                    wrap;
            }


            .theme-custom-grid {
                grid-template-columns:
                    1fr;
            }


            .theme-panel {
                padding:
                    20px;
            }

        }

    `;


    document.head.appendChild(
        style
    );
}


function createSwatch(
    color
) {
    const swatch =
        document.createElement(
            "span"
        );


    swatch.className =
        "theme-swatch";

    swatch.style.backgroundColor =
        color;


    return swatch;
}


function buildPresetButton(
    presetName,
    preset
) {
    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";

    button.className =
        "theme-preset";


    button.style.setProperty(
        "--preset-card",
        preset.colors.card
    );

    button.style.setProperty(
        "--preset-card-bright",
        preset.colors.cardBright
    );

    button.style.setProperty(
        "--preset-border",
        preset.colors.border
    );

    button.style.setProperty(
        "--preset-accent",
        preset.colors.accent
    );

    button.style.setProperty(
        "--preset-secondary",
        preset.colors.secondary
    );

    button.style.setProperty(
        "--preset-text",
        preset.colors.text
    );

    button.style.setProperty(
        "--preset-text-soft",
        preset.colors.textSoft
    );

    button.style.setProperty(
        "--preset-glow",
        rgba(
            preset.colors.accent,
            0.18
        )
    );


    const name =
        document.createElement(
            "span"
        );


    name.className =
        "theme-preset-name";

    name.textContent =
        preset.name;


    const description =
        document.createElement(
            "span"
        );


    description.className =
        "theme-preset-description";

    description.textContent =
        preset.description;


    const swatches =
        document.createElement(
            "div"
        );


    swatches.className =
        "theme-swatch-row";


    swatches.appendChild(
        createSwatch(
            preset.colors.bg
        )
    );

    swatches.appendChild(
        createSwatch(
            preset.colors.primary
        )
    );

    swatches.appendChild(
        createSwatch(
            preset.colors.secondary
        )
    );

    swatches.appendChild(
        createSwatch(
            preset.colors.accent
        )
    );


    button.appendChild(
        name
    );

    button.appendChild(
        description
    );

    button.appendChild(
        swatches
    );


    button.addEventListener(
        "click",
        function () {

            activePresetName =
                presetName;

            customInputsDirty =
                false;


            applyTheme(
                preset
            );


            savePresetTheme(
                presetName
            );


            setCustomInputs(
                themeToCustomValues(
                    preset
                )
            );

        }
    );


    return button;
}


function createColorField(
    labelText,
    id,
    value
) {
    const container =
        document.createElement(
            "div"
        );


    container.className =
        "theme-color-field";


    const label =
        document.createElement(
            "label"
        );


    label.htmlFor =
        id;

    label.textContent =
        labelText;


    const input =
        document.createElement(
            "input"
        );


    input.type =
        "color";

    input.id =
        id;

    input.value =
        value;


    input.addEventListener(
        "input",
        function () {

            activePresetName =
                null;

            customInputsDirty =
                true;

        }
    );


    container.appendChild(
        label
    );

    container.appendChild(
        input
    );


    return container;
}


function getCustomThemeDefaults() {
    const stored =
        localStorage.getItem(
            CUSTOM_THEME_STORAGE_KEY
        );


    if (stored) {
        try {
            return JSON.parse(
                stored
            );

        } catch (error) {
            console.error(
                "Custom theme could not be loaded.",
                error
            );
        }
    }


    return (
        themeToCustomValues(
            themePresets.moodmeter
        )
    );
}


function getCurrentEditorValues() {
    return {
        background:
            document.getElementById(
                "theme-background"
            ).value,

        card:
            document.getElementById(
                "theme-card"
            ).value,

        primary:
            document.getElementById(
                "theme-primary"
            ).value,

        secondary:
            document.getElementById(
                "theme-secondary"
            ).value,

        accent:
            document.getElementById(
                "theme-accent"
            ).value,

        extra:
            document.getElementById(
                "theme-extra"
            ).value,

        text:
            document.getElementById(
                "theme-text"
            ).value,

        textSoft:
            document.getElementById(
                "theme-text-soft"
            ).value
    };
}


function createThemePanel() {
    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "theme-overlay";

    overlay.className =
        "theme-overlay hidden";


    const panel =
        document.createElement(
            "div"
        );


    panel.className =
        "theme-panel";

    panel.setAttribute(
        "role",
        "dialog"
    );

    panel.setAttribute(
        "aria-modal",
        "true"
    );

    panel.setAttribute(
        "aria-labelledby",
        "theme-panel-title"
    );


    const header =
        document.createElement(
            "div"
        );


    header.className =
        "theme-panel-header";


    const headingContainer =
        document.createElement(
            "div"
        );


    const title =
        document.createElement(
            "h2"
        );


    title.id =
        "theme-panel-title";

    title.textContent =
        "Website Colorway";


    const subtitle =
        document.createElement(
            "p"
        );


    subtitle.textContent =
        "Choose a preset or build your own MoodMeter colorway. Your selection is saved on this device.";


    const closeButton =
        document.createElement(
            "button"
        );


    closeButton.type =
        "button";

    closeButton.className =
        "theme-close-button";

    closeButton.setAttribute(
        "aria-label",
        "Close theme settings"
    );

    closeButton.textContent =
        "×";


    headingContainer.appendChild(
        title
    );

    headingContainer.appendChild(
        subtitle
    );


    header.appendChild(
        headingContainer
    );

    header.appendChild(
        closeButton
    );


    const presetGrid =
        document.createElement(
            "div"
        );


    presetGrid.className =
        "theme-preset-grid";


    for (
        const [
            presetName,
            preset
        ]
        of Object.entries(
            themePresets
        )
    ) {
        presetGrid.appendChild(
            buildPresetButton(
                presetName,
                preset
            )
        );
    }


    const customSection =
        document.createElement(
            "section"
        );


    customSection.className =
        "theme-custom-section";


    const customHeading =
        document.createElement(
            "h3"
        );


    customHeading.textContent =
        "Custom Colorway";


    const customDescription =
        document.createElement(
            "p"
        );


    customDescription.textContent =
        "Choose the major colors used throughout the MoodMeter interface.";


    const customGrid =
        document.createElement(
            "div"
        );


    customGrid.className =
        "theme-custom-grid";


    const defaults =
        getCustomThemeDefaults();


    customGrid.appendChild(
        createColorField(
            "Page Background",
            "theme-background",
            defaults.background
        )
    );

    customGrid.appendChild(
        createColorField(
            "Cards / Panels",
            "theme-card",
            defaults.card
        )
    );

    customGrid.appendChild(
        createColorField(
            "Primary",
            "theme-primary",
            defaults.primary
        )
    );

    customGrid.appendChild(
        createColorField(
            "Secondary",
            "theme-secondary",
            defaults.secondary
        )
    );

    customGrid.appendChild(
        createColorField(
            "Accent",
            "theme-accent",
            defaults.accent
        )
    );

    customGrid.appendChild(
        createColorField(
            "Extra Accent",
            "theme-extra",
            defaults.extra
        )
    );

    customGrid.appendChild(
        createColorField(
            "Main Text",
            "theme-text",
            defaults.text
        )
    );

    customGrid.appendChild(
        createColorField(
            "Secondary Text",
            "theme-text-soft",
            defaults.textSoft
        )
    );


    const actions =
        document.createElement(
            "div"
        );


    actions.className =
        "theme-actions";


    const resetButton =
        document.createElement(
            "button"
        );


    resetButton.type =
        "button";

    resetButton.className =
        "theme-action-button theme-reset-button";

    resetButton.textContent =
        "Reset to Default";


    const applyButton =
        document.createElement(
            "button"
        );


    applyButton.type =
        "button";

    applyButton.className =
        "theme-action-button theme-apply-button";

    applyButton.textContent =
        "Apply Colorway";


    actions.appendChild(
        resetButton
    );

    actions.appendChild(
        applyButton
    );


    customSection.appendChild(
        customHeading
    );

    customSection.appendChild(
        customDescription
    );

    customSection.appendChild(
        customGrid
    );

    customSection.appendChild(
        actions
    );


    panel.appendChild(
        header
    );

    panel.appendChild(
        presetGrid
    );

    panel.appendChild(
        customSection
    );


    overlay.appendChild(
        panel
    );


    document.body.appendChild(
        overlay
    );


    const closeThemePanel =
        function () {

            overlay.classList.add(
                "hidden"
            );

        };


    closeButton.addEventListener(
        "click",
        closeThemePanel
    );


    overlay.addEventListener(
        "click",
        function (
            event
        ) {

            if (
                event.target
                === overlay
            ) {
                closeThemePanel();
            }

        }
    );


    document.addEventListener(
        "keydown",
        function (
            event
        ) {

            if (
                event.key === "Escape"
                &&
                !overlay.classList.contains(
                    "hidden"
                )
            ) {
                closeThemePanel();
            }

        }
    );


    resetButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                THEME_STORAGE_KEY
            );

            localStorage.removeItem(
                CUSTOM_THEME_STORAGE_KEY
            );


            activePresetName =
                "moodmeter";

            customInputsDirty =
                false;


            applyTheme(
                themePresets.moodmeter
            );


            setCustomInputs(
                themeToCustomValues(
                    themePresets.moodmeter
                )
            );


            savePresetTheme(
                "moodmeter"
            );

        }
    );


    applyButton.addEventListener(
        "click",
        function () {

            if (
                activePresetName
                &&
                !customInputsDirty
                &&
                themePresets[
                    activePresetName
                ]
            ) {
                applyTheme(
                    themePresets[
                        activePresetName
                    ]
                );


                savePresetTheme(
                    activePresetName
                );


                return;
            }


            const customValues =
                getCurrentEditorValues();


            saveCustomTheme(
                customValues
            );


            activePresetName =
                null;

            customInputsDirty =
                false;


            applyTheme(
                createCustomTheme(
                    customValues
                )
            );

        }
    );


    return {
        overlay:
            overlay,

        open:
            function () {

                const savedValue =
                    localStorage.getItem(
                        THEME_STORAGE_KEY
                    );


                if (savedValue) {
                    try {
                        const saved =
                            JSON.parse(
                                savedValue
                            );


                        if (
                            saved.type
                            === "preset"
                            &&
                            themePresets[
                                saved.name
                            ]
                        ) {
                            activePresetName =
                                saved.name;

                            customInputsDirty =
                                false;


                            setCustomInputs(
                                themeToCustomValues(
                                    themePresets[
                                        saved.name
                                    ]
                                )
                            );
                        }


                        if (
                            saved.type
                            === "custom"
                        ) {
                            const customValue =
                                localStorage.getItem(
                                    CUSTOM_THEME_STORAGE_KEY
                                );


                            if (customValue) {
                                activePresetName =
                                    null;

                                customInputsDirty =
                                    false;


                                setCustomInputs(
                                    JSON.parse(
                                        customValue
                                    )
                                );
                            }
                        }

                    } catch (error) {
                        console.error(
                            "Theme editor could not load the saved theme.",
                            error
                        );
                    }
                }


                overlay.classList.remove(
                    "hidden"
                );

            },

        close:
            closeThemePanel
    };
}


function createThemeNavigationButton(
    themePanel
) {
    const navigation =
        document.querySelector(
            ".navigation"
        );


    if (!navigation) {
        return;
    }


    if (
        document.getElementById(
            "theme-menu-button"
        )
    ) {
        return;
    }


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";

    button.id =
        "theme-menu-button";

    button.className =
        "theme-menu-button";

    button.textContent =
        "Theme";


    button.addEventListener(
        "click",
        function () {

            themePanel.open();

        }
    );


    navigation.appendChild(
        button
    );
}


function initializeMoodMeterTheme() {
    injectThemeStyles();

    loadSavedTheme();


    const themePanel =
        createThemePanel();


    createThemeNavigationButton(
        themePanel
    );
}


if (
    document.readyState
    === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializeMoodMeterTheme
    );

} else {
    initializeMoodMeterTheme();
}