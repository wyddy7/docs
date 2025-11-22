import React, { useEffect, useState } from "react";
import Giscus from "@giscus/react";

function getColorMode(): "dark" | "light" {
    if (typeof window === "undefined") {
        return "light";
    }

    // Проверяем атрибут data-theme в HTML элементе
    const htmlElement = document.documentElement;
    const theme = htmlElement.getAttribute("data-theme");

    if (theme === "dark") {
        return "dark";
    }

    // Проверяем localStorage как резервный вариант
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
        return "dark";
    }

    // Проверяем системные предпочтения
    if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
        return "dark";
    }

    return "light";
}

export default function Comments(): JSX.Element {
    const [colorMode, setColorMode] = useState<"dark" | "light">(() =>
        getColorMode()
    );

    useEffect(() => {
        // Функция для обновления темы
        const updateColorMode = () => {
            setColorMode(getColorMode());
        };

        // Обновляем тему при монтировании
        updateColorMode();

        // Слушаем изменения атрибута data-theme
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "data-theme"
                ) {
                    updateColorMode();
                }
            });
        });

        // Наблюдаем за изменениями в HTML элементе
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });

        // Слушаем изменения в localStorage
        const handleStorageChange = () => {
            updateColorMode();
        };
        window.addEventListener("storage", handleStorageChange);

        // Слушаем изменения системных предпочтений
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleMediaChange = () => {
            updateColorMode();
        };
        mediaQuery.addEventListener("change", handleMediaChange);

        return () => {
            observer.disconnect();
            window.removeEventListener("storage", handleStorageChange);
            mediaQuery.removeEventListener("change", handleMediaChange);
        };
    }, []);

    return (
        <div>
            <Giscus
                id="comments"
                repo="efremovnv/docs"
                repoId="1095808904"
                category="General"
                categoryId="DIC_kwDOKqJXps4CgqFh"
                mapping="pathname"
                strict="1"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="top"
                theme={
                    colorMode === "dark"
                        ? "dark_tritanopia"
                        : "light_tritanopia"
                }
                lang="ru"
                loading="lazy"
            />
        </div>
    );
}
