import React, { useRef, useEffect, useState } from "react";
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
            pdfMake.fonts = {
                Roboto: {
                    normal: "Roboto-Regular.ttf",
                    bold: "Roboto-Medium.ttf",
                    italics: "Roboto-Italic.ttf",
                    bolditalics: "Roboto-MediumItalic.ttf",
                },
            };
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
    const [isProcessing, setIsProcessing] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [buttonWidth, setButtonWidth] = useState<number | undefined>(undefined);

    // Сохраняем ширину кнопки для предотвращения прыжков
    useEffect(() => {
        if (buttonRef.current && !isProcessing && buttonWidth === undefined) {
            // Сохраняем ширину кнопки когда она не в состоянии загрузки
            const width = buttonRef.current.offsetWidth;
            if (width > 0) {
                setButtonWidth(width);
            }
        }
    }, [isProcessing, buttonWidth]);

    const handleDownload = async (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        setIsProcessing(true);
        
        try {
            // Находим основной контент страницы
            const mainContent =
                document.querySelector("article") || document.querySelector("main");
            if (!mainContent) {
                alert("Не удалось найти контент для генерации PDF");
                setIsProcessing(false);
                return;
            }

            // Показываем индикатор загрузки
            // (теперь используем React состояние isProcessing)

            // Инициализируем шрифты перед генерацией
            await initializeFonts();

            // Клонируем элемент глубоко
            const clonedContent = mainContent.cloneNode(true) as HTMLElement;

            // Находим и извлекаем дату последнего обновления
            let lastUpdatedDate: string | null = null;
            const lastUpdatedElement = clonedContent.querySelector(
                ".theme-last-updated, [class*='last-updated'], [class*='lastUpdated'], time[datetime]"
            );

            if (lastUpdatedElement) {
                // Пробуем получить дату из атрибута datetime
                const datetime = lastUpdatedElement.getAttribute("datetime");
                if (datetime) {
                    try {
                        const date = new Date(datetime);
                        // Форматируем дату: "14 окт. 2018 г."
                        const months = [
                            "янв.",
                            "февр.",
                            "мар.",
                            "апр.",
                            "мая",
                            "июня",
                            "июля",
                            "авг.",
                            "сент.",
                            "окт.",
                            "нояб.",
                            "дек.",
                        ];
                        const day = date.getDate();
                        const month = months[date.getMonth()];
                        const year = date.getFullYear();
                        lastUpdatedDate = `${day} ${month} ${year} г.`;
                    } catch (e) {
                        // Если не получилось распарсить, берем текст
                        let dateText = lastUpdatedElement.textContent?.trim() || "";
                        // Убираем "(Simulated during dev for better perf)"
                        dateText = dateText.replace(
                            /\(Simulated during dev for better perf\)/gi,
                            ""
                        ).trim();
                        // Убираем "Последнее обновление" и оставляем только дату
                        dateText = dateText.replace(/Последнее обновление\s*/i, "").trim();
                        if (dateText) {
                            lastUpdatedDate = dateText;
                        }
                    }
                } else {
                    // Если нет datetime, берем текст
                    let dateText = lastUpdatedElement.textContent?.trim() || "";
                    // Убираем "(Simulated during dev for better perf)"
                    dateText = dateText.replace(
                        /\(Simulated during dev for better perf\)/gi,
                        ""
                    ).trim();
                    // Убираем "Последнее обновление" и оставляем только дату
                    dateText = dateText.replace(/Последнее обновление\s*/i, "").trim();
                    if (dateText) {
                        lastUpdatedDate = dateText;
                    }
                }
                // Удаляем оригинальный элемент, чтобы не дублировался
                lastUpdatedElement.remove();
            }

            // Удаляем ненужные элементы из клона (но НЕ удаляем кнопку скачивания)
            const elementsToRemove = clonedContent.querySelectorAll(
                ".navbar, footer, .pagination-nav, aside, .theme-doc-sidebar-container, .theme-doc-toc-desktop, .breadcrumbs, " +
                    // TOC (Table of Contents) - только конкретные классы, убрали слишком широкий [class*='toc']
                    ".table-of-contents, nav.table-of-contents, " +
                    // Иконки кнопок из code blocks (копирование, refresh и т.д.)
                    ".clean-btn, .code-block-button, button[aria-label*='Copy'], button[aria-label*='copy'], " +
                    "[class*='codeBlockButton'], [class*='copyButton'], [class*='cleanButton'], " +
                    "svg[class*='copy'], svg[class*='refresh'], svg[class*='check'], " +
                    // Все кнопки внутри code blocks
                    "pre button, code button, .prism-code button, [class*='prism'] button"
            );
            elementsToRemove.forEach((el) => el.remove());

            // Удаляем только навигационные TOC, НЕ разделы статьи с заголовком "Содержание"
            const allElements = clonedContent.querySelectorAll("*");
            allElements.forEach((el) => {
                // Пропускаем заголовки (h1, h2, h3 и т.д.) - это разделы статьи
                const isHeading = el.tagName?.match(/^H[1-6]$/);
                if (isHeading) {
                    return; // Не удаляем заголовки
                }

                const text = el.textContent?.trim().toLowerCase();

                // Удаляем только навигационные TOC с конкретными признаками
                if (
                    (text === "содержание этой страницы" ||
                        text === "on this page") &&
                    (el.classList.contains("toc") ||
                        el.classList.contains("table-of-contents") ||
                        el.getAttribute("role") === "navigation" ||
                        el.closest("nav") ||
                        el.tagName === "NAV")
                ) {
                    el.remove();
                }
            });

            // Проверка, что контент не пустой после удаления
            const hasContent =
                (clonedContent.textContent?.trim().length ?? 0) > 100 ||
                clonedContent.querySelector(
                    "h1, h2, h3, p, ul, ol, pre, code, img"
                );

            if (!hasContent) {
                console.error("Контент пустой после удаления элементов!", {
                    textLength: clonedContent.textContent?.trim().length,
                    htmlLength: clonedContent.innerHTML.length,
                    hasHeadings: !!clonedContent.querySelector("h1, h2, h3"),
                    hasParagraphs: !!clonedContent.querySelector("p"),
                });
                alert(
                    "Ошибка: Контент страницы пустой. Возможно, удалены необходимые элементы."
                );
                setIsProcessing(false);
                return;
            }

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

            // Находим все элементы кода и убираем ВСЕ фоновые стили
            const codeElements = clonedContent.querySelectorAll(
                "code, pre, .token, .prism-code, [class*='language-'], [class*='code'], [class*='prism'], span[class*='token']"
            );
            codeElements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                // Убираем ВСЕ оформление - фон, рамки, отступы
                htmlEl.style.background = "transparent";
                htmlEl.style.backgroundColor = "transparent";
                htmlEl.style.border = "none";
                htmlEl.style.borderColor = "transparent";
                htmlEl.style.padding = "0";
                htmlEl.style.margin = "0";
                htmlEl.style.fontStyle = "italic";
                htmlEl.style.color = "#000000";
                // Убираем все inline стили с background
                const styleAttr = htmlEl.getAttribute("style");
                if (styleAttr) {
                    htmlEl.setAttribute(
                        "style",
                        styleAttr
                            .split(";")
                            .filter((s) => !s.includes("background"))
                            .join(";") + "; background: transparent !important;"
                    );
                }
                // Добавляем класс для идентификации
                htmlEl.classList.add("pdf-code-element");

                // Убираем все дочерние элементы с фоном
                const childrenWithBg = htmlEl.querySelectorAll(
                    "[style*='background'], [class*='background']"
                );
                childrenWithBg.forEach((child) => {
                    const childEl = child as HTMLElement;
                    childEl.style.background = "transparent";
                    childEl.style.backgroundColor = "transparent";
                    const childStyle = childEl.getAttribute("style");
                    if (childStyle) {
                        childEl.setAttribute(
                            "style",
                            childStyle
                                .split(";")
                                .filter((s) => !s.includes("background"))
                                .join(";") +
                                "; background: transparent !important;"
                        );
                    }
                });
            });

            // Конвертируем HTML в pdfmake формат с правильными стилями для кода
            const htmlContent = clonedContent.outerHTML;
            const pdfMakeContent = htmlToPdfmake(htmlContent, {
                tableAutoSize: true,
                images: images,
                defaultStyles: {
                    code: {
                        italics: true,
                        color: "#000000",
                        fillColor: null, // Явно убираем фон
                        background: null,
                    },
                    pre: {
                        italics: true,
                        color: "#000000",
                        fillColor: null, // Явно убираем фон
                        background: null,
                    },
                },
                customTag: function ({ element, ret, parents }) {
                    // Обрабатываем элементы кода
                    if (
                        element.nodeName === "CODE" ||
                        element.nodeName === "PRE" ||
                        element.classList?.contains("pdf-code-element") ||
                        element.classList?.contains("token") ||
                        element.classList?.contains("prism-code")
                    ) {
                        // УДАЛЯЕМ все фоновые свойства
                        delete ret.fillColor;
                        delete ret.background;
                        delete ret.backgroundColor;

                        // Применяем курсив ко всему содержимому
                        if (ret.text) {
                            if (Array.isArray(ret.text)) {
                                ret.text = ret.text.map((t: any) => {
                                    if (typeof t === "object") {
                                        delete t.fillColor;
                                        delete t.background;
                                        delete t.backgroundColor;
                                        return { ...t, italics: true };
                                    }
                                    return { text: String(t), italics: true };
                                });
                            } else if (typeof ret.text === "string") {
                                ret.text = { text: ret.text, italics: true };
                            } else {
                                delete ret.text.fillColor;
                                delete ret.text.background;
                                delete ret.text.backgroundColor;
                                ret.text = { ...ret.text, italics: true };
                            }
                        }
                        if (ret.stack) {
                            ret.stack = ret.stack.map((s: any) => {
                                if (typeof s === "object") {
                                    delete s.fillColor;
                                    delete s.background;
                                    delete s.backgroundColor;
                                    return { ...s, italics: true };
                                }
                                return { text: String(s), italics: true };
                            });
                        }
                        ret.italics = true;
                        ret.color = "#000000";
                        // Явно убираем фон
                        ret.fillColor = null;
                        ret.background = null;
                    }
                    return ret;
                },
            });

            // Функция для рекурсивного удаления фона из элементов кода
            const removeBackgroundFromCode = (item: any): any => {
                if (Array.isArray(item)) {
                    return item.map(removeBackgroundFromCode);
                }
                if (item && typeof item === "object") {
                    const result: any = {};
                    for (const key in item) {
                        if (
                            key === "fillColor" ||
                            key === "background" ||
                            key === "backgroundColor"
                        ) {
                            // Пропускаем фоновые свойства
                            continue;
                        } else if (
                            key === "stack" ||
                            key === "ol" ||
                            key === "ul" ||
                            key === "text"
                        ) {
                            result[key] = removeBackgroundFromCode(item[key]);
                        } else {
                            result[key] = item[key];
                        }
                    }
                    return result;
                }
                return item;
            };

            // Удаляем фон из всех элементов кода
            const cleanedContent = removeBackgroundFromCode(pdfMakeContent);

            // Добавляем дату обновления в начало документа
            let finalContent: any = cleanedContent;
            if (lastUpdatedDate) {
                // Добавляем дату в начало
                finalContent = [
                    {
                        text: `Последнее обновление: ${lastUpdatedDate}`,
                        style: "lastUpdated",
                        margin: [0, 0, 0, 15], // Отступ снизу
                    },
                    ...(Array.isArray(cleanedContent) ? cleanedContent : [cleanedContent]),
                ];
            }

            // Создаем документ с правильными стилями
            const docDefinition = {
                content: finalContent,
                defaultStyle: {
                    fontSize: 14,
                    color: "#000000",
                    font: "Roboto", // Явно указываем шрифт
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
                        italics: true,
                        fillColor: null, // Явно убираем фон
                        background: null,
                    },
                    pre: {
                        fontSize: 12,
                        color: "#000000",
                        italics: true,
                        fillColor: null, // Явно убираем фон
                        background: null,
                    },
                    // Стили для элементов с классами кода
                    "prism-code": {
                        fontSize: 12,
                        color: "#000000",
                        italics: true,
                        fillColor: null,
                        background: null,
                    },
                    token: {
                        fontSize: 12,
                        color: "#000000",
                        italics: true,
                        fillColor: null,
                        background: null,
                    },
                    lastUpdated: {
                        fontSize: 10,
                        color: "#666666",
                        italics: true,
                        alignment: "left",
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
            setIsProcessing(false);
        }
    };

    return (
        <button
            ref={buttonRef}
            onClick={handleDownload}
            disabled={isProcessing}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...(isProcessing && buttonWidth ? { width: `${buttonWidth}px` } : {}),
            }}
        >
            {isProcessing ? (
                <span
                    style={{
                        display: 'inline-block',
                        width: '1rem',
                        height: '1rem',
                        border: '2px solid currentColor',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                    }}
                    aria-label="Генерация PDF"
                />
            ) : (
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    📄 Скачать PDF
                </span>
            )}
        </button>
    );
}
