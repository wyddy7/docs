# Документация лабораторных работ

Сборник методических материалов для выполнения лабораторных работ и курсовых проектов по дисциплине "Организация ЭВМ и систем".

## Технологии

-   **[Docusaurus](https://docusaurus.io/)** - статический генератор сайтов для документации
-   **TypeScript** - типизированный JavaScript
-   **React** - UI библиотека

## Быстрый старт

### Установка зависимостей

```bash
cd website
npm install
```

### Локальная разработка

```bash
cd website
npm start
```

Сайт откроется по адресу `http://localhost:3000` с hot-reload.

### Сборка

```bash
cd website
npm run build
```

Собранный сайт будет в папке `website/build/`.

## Структура проекта

```
docs/
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions для автоматического деплоя
├── website/               # Основной проект Docusaurus
│   ├── docs/              # Исходники документации (Markdown)
│   │   ├── computer-organization/  # Лабораторные работы по организации ЭВМ
│   │   ├── course-work/   # Курсовые проекты
│   │   ├── peripheral-devices/  # Лабораторные работы по периферийным устройствам
│   │   ├── intro.md      # Вводная страница
│   │   ├── links.md      # Полезные ссылки
│   │   └── contributing.md  # Руководство по контрибьюции
│   ├── src/              # React компоненты и стили
│   │   ├── components/   # Кастомные компоненты
│   │   ├── pages/        # Страницы сайта
│   │   ├── theme/        # Кастомизация темы
│   │   └── css/          # Стили
│   ├── static/           # Статические файлы (изображения, иконки)
│   ├── docusaurus.config.ts  # Конфигурация Docusaurus
│   ├── sidebars.ts       # Конфигурация боковой панели
│   └── package.json      # Зависимости проекта
└── .gitignore            # Игнорируемые файлы
```

## Деплой на GitHub Pages

### Автоматический деплой через GitHub Actions

1. Создай файл `.github/workflows/deploy.yml` (если его нет)
2. При пуше в ветку `main` автоматически:
    - Собирается сайт
    - Деплоится в ветку `gh-pages`

### Настройка GitHub Pages

1. Зайди в **Settings → Pages** репозитория
2. Выбери:
    - **Source**: Deploy from a branch
    - **Branch**: `gh-pages`
    - **Folder**: `/ (root)`
3. Сохрани

Сайт будет доступен по адресу: `https://<username>.github.io/docs/`

### Ручной деплой

```bash
cd website
npm run deploy
```

Эта команда соберет сайт и задеплоит его в ветку `gh-pages`.

## Настройка

Перед деплоем обнови в `website/docusaurus.config.ts`:

-   `url` - URL вашего сайта
-   `organizationName` - ваш GitHub username
-   `projectName` - название репозитория

Подробнее о настройке компонентов см. [website/README.md](website/README.md)

## Полезные команды

```bash
# Разработка
npm start              # Запуск dev сервера
npm run build          # Сборка для production
npm run serve          # Просмотр собранного сайта локально

# Деплой
npm run deploy         # Деплой на GitHub Pages

# Утилиты
npm run clear          # Очистка кэша
npm run typecheck      # Проверка типов TypeScript
```

## Требования

-   Node.js >= 18.0
-   npm

---

**Примечание:** Основная документация находится в папке `website/docs/`. Для работы с проектом переходи в `website/`.
