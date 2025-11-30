import React, { useEffect, useState } from "react";
import Giscus from "@giscus/react";
import styles from "./comments.module.css";

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

interface CommentsProps {
    /** Отключить комментарии (для использования через frontmatter) */
    disabled?: boolean;
}

export default function Comments({ disabled = false }: CommentsProps): JSX.Element | null {
    const [colorMode, setColorMode] = useState<"dark" | "light">(() =>
        getColorMode()
    );
    const [hasError, setHasError] = useState(false);

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
            setColorMode(getColorMode());
        };
        mediaQuery.addEventListener("change", handleMediaChange);

        return () => {
            observer.disconnect();
            window.removeEventListener("storage", handleStorageChange);
            mediaQuery.removeEventListener("change", handleMediaChange);
        };
    }, []);

    // Не показывать комментарии, если они отключены
    if (disabled) {
        return null;
    }

    // Обработка ошибок загрузки Giscus
    if (hasError) {
        return null;
    }

    return (
        <div className={styles.commentsContainer}>
            <div className={styles.commentsWrapper}>
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
                    onError={() => setHasError(true)}
                />
            </div>
        </div>
    );
}
