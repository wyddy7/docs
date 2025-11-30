import React, { useEffect, useState, useRef } from "react";
import JSZip from "jszip";

interface DownloadListingsButtonProps {
    /** Текст на кнопке */
    buttonText?: string;
}

interface ListingInfo {
    number: number;
    fileName: string;
    content: string;
    language: string;
}

/**
 * Компонент для автоматического скачивания всех листингов со страницы в ZIP архив
 * 
 * Компонент автоматически определяет наличие листингов на странице и показывается
 * только если они найдены. Листинги определяются по заголовкам вида "### Листинг X"
 * 
 * @example
 * <DownloadListingsButton />
 */
export default function DownloadListingsButton({
    buttonText = "📦 Скачать все листинги",
}: DownloadListingsButtonProps) {
    const [hasListings, setHasListings] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [buttonWidth, setButtonWidth] = useState<number | undefined>(undefined);

    // Проверяем наличие листингов при монтировании компонента
    useEffect(() => {
        const checkForListings = () => {
            const mainContent =
                document.querySelector("article") || document.querySelector("main");
            if (!mainContent) {
                return;
            }

            // Ищем все заголовки h3 с текстом, начинающимся с "Листинг"
            const headings = Array.from(
                mainContent.querySelectorAll("h3")
            ) as HTMLElement[];

            const listingHeadings = headings.filter((h) => {
                const text = h.textContent?.trim() || "";
                return /^Листинг\s+\d+/i.test(text);
            });

            setHasListings(listingHeadings.length > 0);
        };

        // Проверяем сразу и после небольшой задержки (на случай если DOM еще не готов)
        checkForListings();
        const timeout = setTimeout(checkForListings, 500);

        return () => clearTimeout(timeout);
    }, []);

    // Сохраняем ширину кнопки для предотвращения прыжков
    useEffect(() => {
        if (buttonRef.current && !isProcessing && hasListings && buttonWidth === undefined) {
            // Сохраняем ширину кнопки когда она не в состоянии загрузки
            const width = buttonRef.current.offsetWidth;
            if (width > 0) {
                setButtonWidth(width);
            }
        }
    }, [isProcessing, hasListings, buttonWidth]);

    // Функция для определения расширения файла по языку
    const getFileExtension = (language: string): string => {
        const langMap: Record<string, string> = {
            asm: "asm",
            assembly: "s",
            c: "c",
            cpp: "cpp",
            cxx: "cpp",
            h: "h",
            hpp: "hpp",
            vhdl: "vhd",
            verilog: "v",
            python: "py",
            javascript: "js",
            typescript: "ts",
            java: "java",
        };

        const normalizedLang = language.toLowerCase().trim();
        return langMap[normalizedLang] || "txt";
    };

    // Функция для извлечения имени файла из описания
    const extractFileName = (
        heading: HTMLElement,
        codeBlock: HTMLElement,
        listingNumber: number,
        language: string
    ): string => {
        // Вариант 1: Имя файла в заголовке (например, "Листинг 8. Текст программы JTAG UART.s")
        const headingText = heading.textContent || "";
        // Ищем паттерны: "Листинг X. ... filename.ext" или просто "filename.ext" в конце
        const fileNamePatterns = [
            /\.\s+[^.]+\s+([^\s]+\.\w+)/, // "Листинг 8. Текст программы JTAG UART.s"
            /\.\s*([a-zA-Z0-9_-]+\.\w+)$/, // "Листинг 8. filename.s"
            /([a-zA-Z0-9_-]+\.\w+)$/, // просто "filename.s" в конце
        ];
        
        for (const pattern of fileNamePatterns) {
            const match = headingText.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        // Вариант 2: Имя файла в описании после заголовка
        let currentElement = heading.nextElementSibling;
        while (currentElement && currentElement !== codeBlock) {
            if (currentElement.tagName === "P" || currentElement.tagName === "STRONG") {
                const text = currentElement.textContent || "";
                // Ищем паттерны типа "Исходный файл программы X.s" или "**X.s**"
                const patterns = [
                    /(?:Исходный файл|файл|file)[\s:]+(?:программы|program)?[\s:]*([^\s]+\.\w+)/i,
                    /\*\*([^\s]+\.\w+)\*\*/,
                    /([a-zA-Z0-9_-]+\.\w+)/,
                ];

                for (const pattern of patterns) {
                    const match = text.match(pattern);
                    if (match && match[1]) {
                        return match[1];
                    }
                }
            }
            currentElement = currentElement.nextElementSibling;
        }

        // Вариант 3: Генерируем имя по умолчанию
        const ext = getFileExtension(language);
        return `listing-${listingNumber}.${ext}`;
    };

    // Функция для извлечения всех листингов со страницы
    const extractListings = (): ListingInfo[] => {
        const mainContent =
            document.querySelector("article") || document.querySelector("main");
        if (!mainContent) {
            return [];
        }

        const listings: ListingInfo[] = [];
        const headings = Array.from(
            mainContent.querySelectorAll("h3")
        ) as HTMLElement[];

        headings.forEach((heading) => {
            const text = heading.textContent?.trim() || "";
            const match = text.match(/^Листинг\s+(\d+)/i);
            if (!match) {
                return;
            }

            const listingNumber = parseInt(match[1], 10);

            // Ищем следующий code block после заголовка
            let currentElement = heading.nextElementSibling;
            let codeBlock: HTMLElement | null = null;

            while (currentElement) {
                if (
                    currentElement.tagName === "PRE" ||
                    (currentElement.tagName === "DIV" &&
                        currentElement.querySelector("pre"))
                ) {
                    codeBlock = currentElement.querySelector("pre") || currentElement;
                    break;
                }
                currentElement = currentElement.nextElementSibling;
            }

            if (!codeBlock) {
                return;
            }

            // Извлекаем язык из классов code block
            const codeElement = codeBlock.querySelector("code");
            if (!codeElement) {
                return;
            }

            let language = "txt";
            const classList = Array.from(codeElement.classList);
            for (const className of classList) {
                if (className.startsWith("language-")) {
                    language = className.replace("language-", "");
                    break;
                }
            }

            // Извлекаем содержимое кода с сохранением переносов строк
            // Приоритет методов извлечения:
            // 1. innerText из code элемента (сохраняет видимое форматирование)
            // 2. innerText из pre элемента (fallback)
            // 3. Восстановление из структуры DOM (последний fallback)
            let content: string;
            
            // Метод 1: innerText из code элемента - сохраняет видимое форматирование
            // и правильно обрабатывает переносы строк даже в Prism-структуре
            // innerText автоматически обрабатывает все span'ы и токены Prism
            // и возвращает текст с правильными переносами строк
            if (codeElement.innerText) {
                content = codeElement.innerText;
            } 
            // Метод 2: innerText из pre элемента (fallback)
            else if (codeBlock.innerText) {
                content = codeBlock.innerText;
            } 
            // Метод 3: Восстановление переносов из структуры DOM
            // Обходим все узлы и восстанавливаем переносы на основе структуры
            else {
                const extractTextWithLineBreaks = (element: HTMLElement): string => {
                    const result: string[] = [];
                    const walker = document.createTreeWalker(
                        element,
                        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
                        null
                    );
                    
                    let node;
                    while ((node = walker.nextNode())) {
                        if (node.nodeType === Node.TEXT_NODE) {
                            const text = node.textContent || '';
                            result.push(text);
                        } else if (node.nodeType === Node.ELEMENT_NODE) {
                            const el = node as HTMLElement;
                            // Элементы, которые создают перенос строки в Prism
                            if (el.tagName === 'BR') {
                                result.push('\n');
                            } else if (el.classList.contains('token-line') || 
                                      el.classList.contains('line') ||
                                      el.classList.contains('line-numbers')) {
                                // Добавляем перенос перед новой строкой (если не первый элемент)
                                if (result.length > 0 && result[result.length - 1] !== '\n') {
                                    result.push('\n');
                                }
                            }
                        }
                    }
                    
                    return result.join('');
                };
                
                content = extractTextWithLineBreaks(codeElement) || 
                         codeElement.textContent || 
                         "";
            }

            // Определяем имя файла
            const fileName = extractFileName(
                heading,
                codeBlock,
                listingNumber,
                language
            );

            listings.push({
                number: listingNumber,
                fileName,
                content,
                language,
            });
        });

        return listings.sort((a, b) => a.number - b.number);
    };

    // Обработчик скачивания
    const handleDownload = async () => {
        setIsProcessing(true);

        try {
            const listings = extractListings();
            if (listings.length === 0) {
                alert("Листинги не найдены на странице");
                setIsProcessing(false);
                return;
            }

            // Создаем ZIP архив
            const zip = new JSZip();

            // Добавляем каждый листинг в архив
            listings.forEach((listing) => {
                zip.file(listing.fileName, listing.content);
            });

            // Генерируем ZIP файл
            const blob = await zip.generateAsync({ type: "blob" });

            // Определяем имя файла для скачивания
            const pageTitle =
                document.querySelector("h1")?.textContent?.trim() ||
                "page";
            const sanitizedTitle = pageTitle
                .toLowerCase()
                .replace(/[^a-zа-я0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            const zipFileName = `${sanitizedTitle}-listings.zip`;

            // Создаем ссылку для скачивания
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = zipFileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            
            // Безопасное удаление элемента с задержкой
            setTimeout(() => {
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                } else if (link.remove) {
                    link.remove();
                }
                // Освобождаем память
                URL.revokeObjectURL(link.href);
            }, 100);
        } catch (error) {
            console.error("Ошибка при создании ZIP архива:", error);
            alert("Произошла ошибка при создании архива. Проверьте консоль для деталей.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Не показываем кнопку, если листинги не найдены
    if (!hasListings) {
        return null;
    }

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
                    aria-label="Создание архива"
                />
            ) : (
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    {buttonText}
                </span>
            )}
        </button>
    );
}

