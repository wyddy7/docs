import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";

interface DownloadZipButtonProps {
    /** Путь к ZIP файлу относительно static/ (например: "downloads/programmnye-zagotovki.zip") */
    zipPath: string;
    /** Текст на кнопке */
    buttonText?: string;
    /** Имя файла для скачивания (если не указано, берется из zipPath) */
    fileName?: string;
}

/**
 * Компонент для скачивания ZIP файлов
 * 
 * Файлы должны быть размещены в папке website/static/
 * 
 * @example
 * <DownloadZipButton 
 *   zipPath="downloads/programmnye-zagotovki.zip" 
 *   buttonText="📦 Заготовки"
 * />
 */
export default function DownloadZipButton({
    zipPath,
    buttonText = "📦 Скачать ZIP",
    fileName,
}: DownloadZipButtonProps) {
    // Создаем скрытый маркер для AutoDownloadZipButtons
    // Компонент AutoDownloadZipButtons найдет этот маркер и создаст кнопку в контейнере
    return (
        <div
            data-zip-path={zipPath}
            data-button-text={buttonText}
            data-file-name={fileName}
            style={{ display: 'none' }}
            aria-hidden="true"
        />
    );
}

