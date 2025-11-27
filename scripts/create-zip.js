/**
 * Универсальный скрипт для создания ZIP архива из любой папки
 * Работает на всех платформах (Windows, Linux, macOS) и в CI/CD (GitHub Actions)
 * 
 * Использование:
 *   # С параметрами (рекомендуется)
 *   node scripts/create-zip.js <исходная_папка> <выходной_файл>
 *   
 *   # С параметрами (относительные пути от корня проекта)
 *   node scripts/create-zip.js "old_doc/актуальные материалы/OEVM/7/Программные заготовки" "website/static/downloads/programmnye-zagotovki.zip"
 *   
 *   # Без параметров (использует значения по умолчанию для обратной совместимости)
 *   node scripts/create-zip.js
 * 
 * Требования:
 *   - Node.js >= 18.0
 *   - Пакет 'archiver' должен быть установлен в website/node_modules
 */

const fs = require('fs');
const path = require('path');

// Получаем аргументы командной строки
const args = process.argv.slice(2);

// Значения по умолчанию (для обратной совместимости)
const rootDir = path.join(__dirname, '..');
const defaultSourceDir = path.join(rootDir, 'old_doc', 'актуальные материалы', 'OEVM', '7', 'Программные заготовки');
const defaultOutputFile = path.join(rootDir, 'website', 'static', 'downloads', 'programmnye-zagotovki.zip');

// Определяем пути: либо из аргументов, либо по умолчанию
let sourceDir, outputFile;

if (args.length >= 2) {
    // Используем переданные параметры
    sourceDir = path.isAbsolute(args[0]) 
        ? args[0] 
        : path.join(rootDir, args[0]);
    outputFile = path.isAbsolute(args[1]) 
        ? args[1] 
        : path.join(rootDir, args[1]);
} else if (args.length === 1) {
    // Только исходная папка, выходной файл - рядом с исходной папкой
    sourceDir = path.isAbsolute(args[0]) 
        ? args[0] 
        : path.join(rootDir, args[0]);
    const dirName = path.basename(sourceDir);
    const outputDir = path.dirname(sourceDir);
    outputFile = path.join(outputDir, `${dirName}.zip`);
} else {
    // Используем значения по умолчанию
    sourceDir = defaultSourceDir;
    outputFile = defaultOutputFile;
}

// Нормализуем пути (убираем лишние слеши и точки)
sourceDir = path.normalize(sourceDir);
outputFile = path.normalize(outputFile);

// Пытаемся найти archiver в website/node_modules (для работы в CI/CD)
let archiver;
try {
    // Сначала пробуем из website/node_modules
    const archiverPath = path.join(rootDir, 'website', 'node_modules', 'archiver');
    if (fs.existsSync(archiverPath)) {
        archiver = require(archiverPath);
    } else {
        // Если не найден, пробуем глобально
        archiver = require('archiver');
    }
} catch (err) {
    console.error('❌ Ошибка: пакет "archiver" не найден.');
    console.error('   Установите его командой: cd website && npm install --save-dev archiver');
    process.exit(1);
}

// Проверяем существование исходной папки
if (!fs.existsSync(sourceDir)) {
    console.error(`❌ Ошибка: исходная папка не найдена: ${sourceDir}`);
    console.error('');
    console.error('Использование:');
    console.error('  node scripts/create-zip.js <исходная_папка> <выходной_файл>');
    console.error('');
    console.error('Пример:');
    console.error('  node scripts/create-zip.js "old_doc/папка с файлами" "website/static/downloads/archive.zip"');
    process.exit(1);
}

// Создаем папку для выходного файла, если её нет
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✅ Создана папка: ${outputDir}`);
}

// Удаляем старый ZIP, если существует
if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
    console.log(`🗑️  Удален старый ZIP файл`);
}

// Создаем ZIP архив
const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', {
    zlib: { level: 9 } // Максимальное сжатие
});

// Обработка предупреждений (например, файлы не найдены)
archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
        console.warn(`⚠️  Предупреждение: ${err.message}`);
    } else {
        throw err;
    }
});

// Обработка ошибок
archive.on('error', (err) => {
    console.error(`❌ Ошибка при создании архива: ${err.message}`);
    process.exit(1);
});

// Когда архив готов
output.on('close', () => {
    const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`✅ ZIP архив успешно создан!`);
    console.log(`   Исходная папка: ${sourceDir}`);
    console.log(`   Выходной файл: ${outputFile}`);
    console.log(`   Размер: ${sizeInMB} MB`);
    console.log(`   Всего байт: ${archive.pointer()}`);
});

// Событие завершения потока данных
output.on('end', () => {
    console.log('📦 Данные архива записаны');
});

// Подключаем поток записи
archive.pipe(output);

// Добавляем все файлы из исходной папки (false = содержимое папки на корневом уровне архива)
console.log(`📦 Упаковываю папку: ${sourceDir}`);
archive.directory(sourceDir, false);

// Завершаем архивацию
archive.finalize();
