import type { ReactNode } from "react";
import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import GitHubStars from "@site/src/components/GitHubStars";
import Heading from "@theme/Heading";
import sidebars from "../../sidebars";

import styles from "./index.module.css";

// Словарь кастомных названий для конкретных документов
const CUSTOM_DOC_TITLES: Record<string, string> = {
    "course-work/rp-op-design": "Проектирование РП и ОП",
    "course-work/arithmetic-device": "Арифметическое устройство",
    // Организация ЭВМ - 7 семестр
    "computer-organization/labs-sem7/lab6": "Лабораторная работа 6 (Ввод/вывод и прерывания)",
    "computer-organization/labs-sem7/lab7": "Лабораторная работа 7 (Интервальный таймер)",
    "computer-organization/labs-sem7/lab8": "Лабораторная работа 8 (JTAG UART)",
    // Организация ЭВМ - 6 семестр
    "computer-organization/labs-sem6/lab-manual-sem6": "Методичка 6 семестра",
    "computer-organization/labs-sem6/lab1": "Лабораторная работа 1",
    "computer-organization/labs-sem6/lab2": "Лабораторная работа 2",
    "computer-organization/labs-sem6/lab3": "Лабораторная работа 3",
    "computer-organization/labs-sem6/lab4": "Лабораторная работа 4",
    "computer-organization/labs-sem6/lab5": "Лабораторная работа 5",
    "computer-organization/labs-sem6/lab6": "Лабораторная работа 6",
    // Организация ЭВМ - теория
    "computer-organization/theory/jtag-theory": "JTAG - основы и теория",
    "computer-organization/theory/jtag-uart-port": "JTAG порт",
    // Организация ЭВМ - дополнительные лабы
    "computer-organization/additional-labs/lab1-emulator-debug": "Доп. лаба 1: Эмулятор и отладка",
    "computer-organization/additional-labs/lab2-protected-mode": "Доп. лаба 2: Защищенный режим",
    "computer-organization/additional-labs/lab3-interrupts-exceptions": "Доп. лаба 3: Прерывания и исключения",
    "computer-organization/additional-labs/lab4-paging": "Доп. лаба 4: Страничная организация",
    // Периферийные устройства
    "peripheral-devices/lab-keyboard-ps2": "ЛР: Клавиатура PS/2",
    "peripheral-devices/lab-mouse-ps2": "ЛР: Мышь PS/2",
    "peripheral-devices/lab-audio": "ЛР: Аудио",
    "peripheral-devices/lab-vga": "ЛР: VGA",
};

// Helper to recursively extract all doc IDs from a category (including nested categories)
function extractDocIds(items: any[]): string[] {
    const docIds: string[] = [];
    
    for (const item of items) {
        if (typeof item === "string") {
            // Direct doc ID
            docIds.push(item);
        } else if (typeof item === "object" && item.type === "category" && item.items) {
            // Nested category - recursively extract
            docIds.push(...extractDocIds(item.items));
        }
    }
    
    return docIds;
}

// Helper to get items from sidebar configuration (recursively)
function getCategoryItems(categoryLabel: string): string[] {
    // @ts-ignore
    const sidebar = sidebars.labsSidebar;
    if (!Array.isArray(sidebar)) return [];

    const category = sidebar.find(
        (item: any) =>
            typeof item === "object" &&
            item.type === "category" &&
            item.label === categoryLabel
    );

    if (category && typeof category === "object" && "items" in category) {
        // Recursively extract all doc IDs (including from nested categories)
        return extractDocIds((category as any).items);
    }

    return [];
}

// Helper to generate correct URL slug (removing number prefixes)
function getDocUrl(docId: string): string {
    // Docusaurus removes '01-', '02-' prefixes from filenames in URLs by default
    const parts = docId.split("/");
    const fileName = parts.pop() || "";
    const cleanFileName = fileName.replace(/^\d+[-_.]/, "");
    return `/labs/${parts.join("/")}/${cleanFileName}`.replace(/\/+/g, "/");
}

// Helper to format doc id into readable title
function formatDocTitle(docId: string): string {
    // 1. Check custom dictionary first
    if (CUSTOM_DOC_TITLES[docId]) {
        return CUSTOM_DOC_TITLES[docId];
    }

    const fileName = docId.split("/").pop() || docId;

    // 2. Special cases handling
    if (fileName.match(/^lab\d+$/)) {
        return fileName.replace(/^lab(\d+)$/, "Лабораторная работа $1");
    }

    // 3. Fallback: Beautify filename
    // Remove leading numbers followed by dash/space (e.g. "01-rp-op" -> "rp-op")
    const cleanName = fileName.replace(/^\d+[-_.]*/, "").replace(/-/g, " ");

    // Capitalize first letter
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
}

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    const introUrl = useBaseUrl("/labs/intro");
    return (
        <header className={styles.heroBanner}>
            <div className="container">
                <Heading as="h1" className={styles.hero__title}>
                    {siteConfig.title}
                </Heading>
                <p className={styles.hero__subtitle}>{siteConfig.tagline}</p>
                <div className={styles.buttons}>
                    <Link
                        className={clsx(
                            "button button--secondary button--lg",
                            styles.heroButton
                        )}
                        to={introUrl}
                    >
                        Читать методички 📚
                    </Link>
                    <GitHubStars />
                </div>
            </div>
        </header>
    );
}

function HomepageFeatures() {
    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.featureContainer}>
                    <div className={styles.featureImage}>📚</div>
                    <div className={styles.featureContent}>
                        <Heading as="h2">О курсе</Heading>
                        <p className={styles.featureText}>
                            Все методички по курсам "Периферийные устройства" и "Организация ЭВМ" собраны здесь в одном месте. 
                            Откройте нужную работу — и сразу найдете всё необходимое для её выполнения: пошаговые инструкции, 
                            примеры кода на Assembly и VHDL (в некоторых работах) и теорию. 
                            Больше не нужно искать информацию по разным источникам — всё уже структурировано и готово к использованию.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function HomepageSections() {
    const peripheralLabs = getCategoryItems("Периферийные устройства");
    const compOrgLabs = getCategoryItems("Организация ЭВМ");
    const courseWorks = getCategoryItems("Курсовая работа");

    return (
        <section className={clsx(styles.section, styles.sectionAlternate)}>
            <div className="container">
                <h2 className={styles.sectionTitle}>Учебные модули</h2>
                <div className="row">
                    <div className="col col--4">
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardIcon}>🖥️</div>
                                <h3 className={styles.cardTitle}>
                                    Периферийные устройства
                                </h3>
                            </div>
                            <div className={styles.cardBody}>
                                <p>
                                    Погружение в архитектуру x86, работа с
                                    прерываниями, памятью и системным
                                    программированием.
                                </p>
                                <ul className={styles.cardList}>
                                    {peripheralLabs.map((docId) => (
                                        <li key={docId}>
                                            <Link to={getDocUrl(docId)}>
                                                {formatDocTitle(docId)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col col--4">
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardIcon}>⚙️</div>
                                <h3 className={styles.cardTitle}>
                                    Организация ЭВМ
                                </h3>
                            </div>
                            <div className={styles.cardBody}>
                                <p>
                                    Проектирование микропроцессорных систем на
                                    базе NIOS II. JTAG, таймеры, интерфейсы.
                                </p>
                                <ul className={styles.cardList}>
                                    {compOrgLabs.map((docId) => (
                                        <li key={docId}>
                                            <Link to={getDocUrl(docId)}>
                                                {formatDocTitle(docId)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col col--4">
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardIcon}>🎓</div>
                                <h3 className={styles.cardTitle}>
                                    Курсовая работа
                                </h3>
                            </div>
                            <div className={styles.cardBody}>
                                <p>
                                    Полный цикл проектирования компонентов
                                    процессора на ПЛИС: от идеи до реализации на
                                    VHDL.
                                </p>
                                <ul className={styles.cardList}>
                                    {courseWorks.map((docId) => (
                                        <li key={docId}>
                                            <Link to={getDocUrl(docId)}>
                                                {formatDocTitle(docId)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function HomepageQuickStart() {
    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.sectionTitle}>Как начать</h2>
                <div className="row">
                    <div className="col col--6">
                        <h3>👨‍🎓 Для студентов</h3>
                        <div className={styles.stepContainer}>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>1</div>
                                <div className={styles.stepContent}>
                                    <h4>Выберите лабораторную</h4>
                                    <p>
                                        Перейдите в соответствующий раздел и
                                        выберите нужную работу.
                                    </p>
                                </div>
                            </div>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>2</div>
                                <div className={styles.stepContent}>
                                    <h4>Изучите контекст</h4>
                                    <p>
                                        В начале каждой работы есть раздел
                                        "Контекст" и список необходимых знаний.
                                    </p>
                                </div>
                            </div>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>3</div>
                                <div className={styles.stepContent}>
                                    <h4>Следуйте инструкциям</h4>
                                    <p>
                                        Выполняйте работу по пошаговым инструкциям, 
                                        описанным в методичке.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col col--6">
                        <h3>👨‍🏫 Для контрибьюторов</h3>
                        <div className={styles.stepContainer}>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>1</div>
                                <div className={styles.stepContent}>
                                    <h4>Изучите гайд</h4>
                                    <p>
                                        Прочитайте{" "}
                                        <Link to="/labs/contributing">
                                            руководство по контрибьюции
                                        </Link>
                                        .
                                    </p>
                                </div>
                            </div>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>2</div>
                                <div className={styles.stepContent}>
                                    <h4>Используйте шаблоны</h4>
                                    <p>
                                        Создавайте новые материалы по
                                        утвержденным стандартам структуры.
                                    </p>
                                </div>
                            </div>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>3</div>
                                <div className={styles.stepContent}>
                                    <h4>Делитесь знаниями</h4>
                                    <p>
                                        Добавляйте полезные советы и решения
                                        частых проблем в FAQ (где он есть).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Home(): ReactNode {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`${siteConfig.title} - Документация`}
            description="Документация лабораторных работ и курсовых проектов"
        >
            <HomepageHeader />
            <main>
                <HomepageFeatures />
                <HomepageSections />
                <HomepageQuickStart />
            </main>
        </Layout>
    );
}
