import React, { useEffect, useState } from "react";
import Head from "@docusaurus/Head";

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

export default function FaviconSwitcher(): JSX.Element {
    const [colorMode, setColorMode] = useState<"dark" | "light">(() =>
        getColorMode()
    );

    useEffect(() => {
        // Функция для обновления favicon
        const updateFavicon = () => {
            const currentMode = getColorMode();
            setColorMode(currentMode);

            let favicon = document.querySelector(
                "link[rel='icon']"
            ) as HTMLLinkElement;

            if (!favicon) {
                favicon = document.createElement("link");
                favicon.rel = "icon";
                document.head.appendChild(favicon);
            }

            // Устанавливаем favicon в зависимости от темы
            if (currentMode === "dark") {
                favicon.href = "/docs/img/logo2-dark.svg";
            } else {
                favicon.href = "/docs/img/logo2.svg";
            }
        };

        // Обновляем favicon при монтировании
        updateFavicon();

        // Слушаем изменения атрибута data-theme
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "data-theme"
                ) {
                    updateFavicon();
                }
            });
        });

        // Наблюдаем за изменениями в HTML элементе
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });

        // Слушаем изменения в localStorage (для случаев, когда тема меняется через другие механизмы)
        const handleStorageChange = () => {
            updateFavicon();
        };
        window.addEventListener("storage", handleStorageChange);

        // Слушаем изменения системных предпочтений
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleMediaChange = () => {
            updateFavicon();
        };
        mediaQuery.addEventListener("change", handleMediaChange);

        return () => {
            observer.disconnect();
            window.removeEventListener("storage", handleStorageChange);
            mediaQuery.removeEventListener("change", handleMediaChange);
        };
    }, []);

    return (
        <Head>
            <link
                rel="icon"
                href={
                    colorMode === "dark"
                        ? "/docs/img/logo2-dark.svg"
                        : "/docs/img/logo2.svg"
                }
            />
        </Head>
    );
}
