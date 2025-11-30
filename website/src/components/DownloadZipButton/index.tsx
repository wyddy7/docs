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
 *   buttonText="📦 Скачать программные заготовки"
 * />
 */
export default function DownloadZipButton({
    zipPath,
    buttonText = "📦 Скачать ZIP",
    fileName,
}: DownloadZipButtonProps) {
    // Используем useBaseUrl для правильного пути с учетом baseUrl из конфигурации
    const fileUrl = useBaseUrl(zipPath);
    
    const handleDownload = () => {
        // Создаем временную ссылку для скачивания
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName || zipPath.split("/").pop() || "download.zip";
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Безопасное удаление элемента
        if (link.parentNode) {
            link.parentNode.removeChild(link);
        }
    };

    return (
        <div className="margin-top--lg">
            <button
                onClick={handleDownload}
                className="button button--secondary button--sm"
            >
                {buttonText}
            </button>
        </div>
    );
}

