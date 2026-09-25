"use client";

import {
    Children,
    useEffect,
    useId,
    useRef,
    useState,
} from "react";

import AppIcon from "./AppIcon";

/*
 * Custom select with the same value, defaultValue, name and onChange
 * interface used by the existing forms.
 */
export default function SelectField({
    children,
    name,
    value,
    defaultValue,
    onChange,
    required = false,
    disabled = false,
    label,
    className = "",
    "aria-label": ariaLabel,
}) {
    const options = Children.toArray(children)
        .filter((child) => child?.props)
        .map((child) => ({
            value: String(
                child.props.value ?? child.props.children,
            ),
            label: child.props.children,
            disabled: Boolean(child.props.disabled),
        }));

    const [internalValue, setInternalValue] =
        useState(() =>
            String(defaultValue ?? options[0]?.value ?? ""),
        );

    const selectedValue =
        value === undefined
            ? internalValue
            : String(value ?? "");

    const selectedIndex = options.findIndex(
        (option) => option.value === selectedValue,
    );

    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(
        Math.max(selectedIndex, 0),
    );

    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const id = useId();
    const listId = `${id}-options`;
    const labelId = `${id}-label`;

    useEffect(() => {
        if (!open) return;

        function handleOutsideClick(event) {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener(
            "pointerdown",
            handleOutsideClick,
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsideClick,
            );
        };
    }, [open]);

    function showOptions() {
        if (disabled) return;

        setActiveIndex(
            selectedIndex >= 0 ? selectedIndex : 0,
        );
        setOpen(true);
    }

    function chooseOption(option) {
        if (option.disabled) return;

        if (value === undefined) {
            setInternalValue(option.value);
        }

        // Existing handlers read event.target.name and event.target.value.
        onChange?.({
            target: {
                name,
                value: option.value,
                type: "select-one",
            },
            currentTarget: {
                name,
                value: option.value,
                type: "select-one",
            },
        });

        setOpen(false);
        triggerRef.current?.focus();
    }

    function moveActive(direction) {
        if (!options.length) return;

        let next = activeIndex;

        for (let count = 0; count < options.length; count += 1) {
            next =
                (next + direction + options.length) %
                options.length;

            if (!options[next].disabled) {
                setActiveIndex(next);
                return;
            }
        }
    }

    function handleKeyDown(event) {
        if (disabled) return;

        switch (event.key) {
            case "ArrowDown":
            case "ArrowUp":
                event.preventDefault();

                if (!open) {
                    showOptions();
                } else {
                    moveActive(event.key === "ArrowDown" ? 1 : -1);
                }
                break;

            case "Home":
            case "End":
                if (!open) break;
                event.preventDefault();
                setActiveIndex(
                    event.key === "Home"
                        ? 0
                        : options.length - 1,
                );
                break;

            case "Enter":
            case " ":
                event.preventDefault();

                if (!open) {
                    showOptions();
                } else if (options[activeIndex]) {
                    chooseOption(options[activeIndex]);
                }
                break;

            case "Escape":
                if (open) {
                    event.preventDefault();
                    event.stopPropagation();
                    setOpen(false);
                }
                break;

            case "Tab":
                setOpen(false);
                break;

            default:
                break;
        }
    }

    const selectedOption =
        options[selectedIndex];

    return (
        <div
            ref={rootRef}
            className={[
                "selectField",
                open ? "isOpen" : "",
                disabled ? "isDisabled" : "",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            onKeyDown={handleKeyDown}
        >
            {label && (
                <span
                    className="selectFieldLabel"
                    id={labelId}
                >
                    {label}
                </span>
            )}

            <button
                ref={triggerRef}
                type="button"
                className="selectFieldTrigger"
                role="combobox"
                aria-label={ariaLabel || (label ? undefined : name)}
                aria-labelledby={label ? labelId : undefined}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                aria-activedescendant={
                    open ? `${id}-option-${activeIndex}` : undefined
                }
                disabled={disabled}
                onClick={() => {
                    if (open) {
                        setOpen(false);
                    } else {
                        showOptions();
                    }
                }}
            >
                <span className="selectFieldValue">
                    {selectedOption?.label ?? ""}
                </span>

                <AppIcon
                    name="chevron-down"
                    size={17}
                    className="selectFieldChevron"
                />
            </button>

            {open && (
                <div
                    id={listId}
                    className="selectFieldOptions"
                    role="listbox"
                    aria-label={ariaLabel || label || name}
                >
                    {options.map((option, index) => (
                        <div
                            key={`${option.value}-${index}`}
                            id={`${id}-option-${index}`}
                            role="option"
                            aria-selected={
                                option.value === selectedValue
                            }
                            aria-disabled={option.disabled}
                            className={[
                                "selectFieldOption",
                                index === activeIndex ? "isActive" : "",
                                option.value === selectedValue
                                    ? "isSelected"
                                    : "",
                                option.disabled ? "isDisabled" : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            onPointerEnter={() => {
                                if (!option.disabled) {
                                    setActiveIndex(index);
                                }
                            }}
                            onPointerDown={(event) => {
                                // Keep keyboard focus on the combobox.
                                event.preventDefault();
                            }}
                            onClick={() => chooseOption(option)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}

            {/* Preserves FormData and native required validation. */}
            <select
                className="selectFieldNative"
                name={name}
                value={selectedValue}
                required={required}
                disabled={disabled}
                tabIndex={-1}
                aria-hidden="true"
                onChange={() => { }}
                onInvalid={(event) => {
                    event.preventDefault();
                    showOptions();

                    requestAnimationFrame(() => {
                        triggerRef.current?.focus();
                    });
                }}
            >
                {children}
            </select>
        </div>
    );
}