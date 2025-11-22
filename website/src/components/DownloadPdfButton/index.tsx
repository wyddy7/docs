import React from "react";
import { useLocation } from "@docusaurus/router";
import pdfMake from "pdfmake/build/pdfmake";
import htmlToPdfmake from "html-to-pdfmake";

// Динамически загружаем и инициализируем шрифты
let fontsInitialized = false;

const initializeFonts = async () => {
    if (fontsInitialized) return;

    try {
        // Пробуем разные способы импорта
        const pdfFontsModule = await import("pdfmake/build/vfs_fonts");

        // Проверяем разные возможные структуры
        const fonts = pdfFontsModule.default || pdfFontsModule;

        if (fonts?.pdfMake?.vfs) {
            pdfMake.vfs = fonts.pdfMake.vfs;
        } else if (fonts?.vfs) {
            pdfMake.vfs = fonts.vfs;
        } else if (typeof fonts === "object" && fonts !== null) {
            // Если это сам объект vfs
            pdfMake.vfs = fonts as any;
        }

        fontsInitialized = true;
    } catch (error) {
        console.warn(
            "Не удалось загрузить шрифты pdfmake, используется дефолтный:",
            error
        );
        // Продолжаем без кастомных шрифтов
        fontsInitialized = true;
    }
};

// Функция для конвертации изображения в dataURL
const imageToDataURL = (img: HTMLImageElement): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Если изображение уже загружено и имеет src
        if (img.complete && img.src) {
            // Если это уже dataURL, возвращаем как есть
            if (img.src.startsWith("data:")) {
                resolve(img.src);
                return;
            }

            // Создаем canvas для конвертации
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Не удалось создать canvas context"));
                return;
            }

            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;

            try {
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL("image/png");
                resolve(dataURL);
            } catch (error) {
                reject(error);
            }
        } else {
            // Ждем загрузки изображения
            const onLoad = () => {
                img.removeEventListener("load", onLoad);
                img.removeEventListener("error", onError);

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Не удалось создать canvas context"));
                    return;
                }

                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;

                try {
                    ctx.drawImage(img, 0, 0);
                    const dataURL = canvas.toDataURL("image/png");
                    resolve(dataURL);
                } catch (error) {
                    reject(error);
                }
            };

            const onError = () => {
                img.removeEventListener("load", onLoad);
                img.removeEventListener("error", onError);
                reject(new Error("Ошибка загрузки изображения"));
            };

            img.addEventListener("load", onLoad);
            img.addEventListener("error", onError);

            // Если src не установлен, пробуем установить из оригинального элемента
            if (!img.src && img.getAttribute("src")) {
                const originalSrc = img.getAttribute("src");
                if (originalSrc) {
                    // Преобразуем относительный путь в абсолютный
                    const absoluteSrc = new URL(
                        originalSrc,
                        window.location.href
                    ).href;
                    img.src = absoluteSrc;
                }
            }
        }
    });
};

export default function DownloadPdfButton() {
    const location = useLocation();

    const handleDownload = async (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        // Находим основной контент страницы
        const mainContent =
            document.querySelector("article") || document.querySelector("main");
        if (!mainContent) {
            alert("Не удалось найти контент для генерации PDF");
            return;
        }

        // Показываем индикатор загрузки
        const button = event.currentTarget;
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "⏳ Генерация PDF...";

        try {
            // Инициализируем шрифты перед генерацией
            await initializeFonts();

            // Клонируем элемент глубоко
            const clonedContent = mainContent.cloneNode(true) as HTMLElement;

            // Удаляем ненужные элементы из клона
            const elementsToRemove = clonedContent.querySelectorAll(
                ".navbar, footer, .pagination-nav, aside, .theme-doc-sidebar-container, .theme-doc-toc-desktop, .breadcrumbs, a[href$='.pdf'], button"
            );
            elementsToRemove.forEach((el) => el.remove());

            // Находим все изображения и конвертируем их в dataURL
            const images: Record<string, string> = {};
            const imgElements = clonedContent.querySelectorAll("img");

            // Сначала загружаем все изображения
            const imagePromises = Array.from(imgElements).map(
                async (img, index) => {
                    try {
                        // Получаем оригинальный src
                        const originalSrc = img.getAttribute("src") || img.src;
                        if (!originalSrc) return;

                        // Преобразуем относительный путь в абсолютный
                        let absoluteSrc = originalSrc;
                        if (
                            !originalSrc.startsWith("http") &&
                            !originalSrc.startsWith("data:")
                        ) {
                            absoluteSrc = new URL(
                                originalSrc,
                                window.location.href
                            ).href;
                        }

                        // Создаем новое изображение для загрузки
                        const loadImg = new Image();
                        loadImg.crossOrigin = "anonymous";

                        await new Promise((resolve, reject) => {
                            loadImg.onload = resolve;
                            loadImg.onerror = reject;
                            loadImg.src = absoluteSrc;
                        });

                        // Конвертируем в dataURL
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        if (!ctx) throw new Error("Не удалось создать canvas");

                        canvas.width = loadImg.naturalWidth;
                        canvas.height = loadImg.naturalHeight;
                        ctx.drawImage(loadImg, 0, 0);

                        const dataURL = canvas.toDataURL("image/png");

                        // Используем оригинальный путь как ключ
                        images[originalSrc] = dataURL;

                        // Обновляем src в клоне на dataURL
                        img.src = dataURL;
                    } catch (error) {
                        console.warn(
                            `Не удалось загрузить изображение ${img.src}:`,
                            error
                        );
                        // Удаляем проблемное изображение
                        img.remove();
                    }
                }
            );

            await Promise.all(imagePromises);

            // Применяем стили для черного текста
            const style = document.createElement("style");
            style.textContent = `
                * {
                    color: #000000 !important;
                    max-width: 100% !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                }
            `;
            clonedContent.appendChild(style);

            // Конвертируем HTML в pdfmake формат
            const htmlContent = clonedContent.outerHTML;
            const pdfMakeContent = htmlToPdfmake(htmlContent, {
                tableAutoSize: true,
                images: images, // Передаем словарь изображений
            });

            // Создаем документ с правильными стилями
            const docDefinition = {
                content: pdfMakeContent,
                defaultStyle: {
                    fontSize: 14,
                    color: "#000000",
                },
                styles: {
                    h1: {
                        fontSize: 24,
                        bold: true,
                        color: "#000000",
                        margin: [0, 0, 0, 10],
                    },
                    h2: {
                        fontSize: 20,
                        bold: true,
                        color: "#000000",
                        margin: [0, 0, 0, 8],
                    },
                    h3: {
                        fontSize: 18,
                        bold: true,
                        color: "#000000",
                        margin: [0, 0, 0, 6],
                    },
                    h4: {
                        fontSize: 16,
                        bold: true,
                        color: "#000000",
                        margin: [0, 0, 0, 4],
                    },
                    p: { fontSize: 14, color: "#000000", margin: [0, 0, 0, 8] },
                    code: {
                        fontSize: 12,
                        color: "#000000",
                        background: "#f5f5f5",
                    },
                },
                pageSize: "A4",
                pageMargins: [10, 10, 10, 10],
            };

            // Генерируем и скачиваем PDF
            const filename = `${
                location.pathname.split("/").pop() || "document"
            }.pdf`;
            pdfMake.createPdf(docDefinition).download(filename);
        } catch (error) {
            console.error("Ошибка генерации PDF:", error);
            alert("Ошибка при генерации PDF: " + (error as Error).message);
        } finally {
            // Восстанавливаем кнопку
            button.disabled = false;
            if (originalText) {
                button.textContent = originalText;
            }
        }
    };

    return (
        <div className="margin-top--lg">
            <button
                onClick={handleDownload}
                className="button button--secondary button--sm"
            >
                📄 Скачать PDF
            </button>
        </div>
    );
}
