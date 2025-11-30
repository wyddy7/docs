import React, { useEffect, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";

interface ZipButtonInfo {
    zipPath: string;
    buttonText: string;
    fileName?: string;
}

/**
 * Компонент для автоматического поиска и отображения всех DownloadZipButton на странице
 * Сканирует DOM на наличие элементов с data-zip-path атрибутом
 */
export default function AutoDownloadZipButtons() {
    const [zipButtons, setZipButtons] = useState<ZipButtonInfo[]>([]);

    useEffect(() => {
        const findZipButtons = () => {
            const mainContent =
                document.querySelector("article") || document.querySelector("main");
            if (!mainContent) {
                return;
            }

            // Ищем все элементы с data-zip-path атрибутом
            // Это будут элементы, созданные из MDX компонентов DownloadZipButton
            const zipElements = Array.from(
                mainContent.querySelectorAll("[data-zip-path]")
            ) as HTMLElement[];

            const buttons: ZipButtonInfo[] = [];

            zipElements.forEach((el) => {
                const zipPath = el.getAttribute("data-zip-path");
                const buttonText = el.getAttribute("data-button-text") || "📦 Скачать ZIP";
                const fileName = el.getAttribute("data-file-name") || undefined;

                if (zipPath) {
                    buttons.push({ zipPath, buttonText, fileName });
                    // Скрываем оригинальный элемент
                    el.style.display = "none";
                }
            });

            if (buttons.length > 0) {
                setZipButtons(buttons);
            }
        };

        // Проверяем сразу и после задержки
        findZipButtons();
        const timeout = setTimeout(findZipButtons, 500);

        return () => clearTimeout(timeout);
    }, []);

    if (zipButtons.length === 0) {
        return null;
    }

    return (
        <>
            {zipButtons.map((button, index) => (
                <DownloadZipButton
                    key={`${button.zipPath}-${index}`}
                    zipPath={button.zipPath}
                    buttonText={button.buttonText}
                    fileName={button.fileName}
                />
            ))}
        </>
    );
}

// Внутренний компонент для отдельной кнопки
function DownloadZipButton({
    zipPath,
    buttonText,
    fileName,
}: ZipButtonInfo) {
    const [isProcessing, setIsProcessing] = useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [buttonWidth, setButtonWidth] = useState<number | undefined>(undefined);

    const fileUrl = useBaseUrl(zipPath);

    React.useEffect(() => {
        if (buttonRef.current && !isProcessing && buttonWidth === undefined) {
            const width = buttonRef.current.offsetWidth;
            if (width > 0) {
                setButtonWidth(width);
            }
        }
    }, [isProcessing, buttonWidth]);

    const handleDownload = () => {
        setIsProcessing(true);

        try {
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = fileName || zipPath.split("/").pop() || "download.zip";
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
                setIsProcessing(false);
            }, 100);
        } catch (error) {
            console.error("Ошибка при скачивании файла:", error);
            setIsProcessing(false);
        }
    };

    return (
        <button
            ref={buttonRef}
            onClick={handleDownload}
            disabled={isProcessing}
            style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                ...(isProcessing && buttonWidth ? { width: `${buttonWidth}px` } : {}),
            }}
        >
            {isProcessing ? (
                <span
                    style={{
                        display: "inline-block",
                        width: "1rem",
                        height: "1rem",
                        border: "2px solid currentColor",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                    }}
                    aria-label="Скачивание"
                />
            ) : (
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    {buttonText}
                </span>
            )}
        </button>
    );
}

