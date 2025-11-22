---
title: Полезные ссылки
description: Подборка ресурсов, репозиториев и инструментов
---

export const repositories = [
{
title: 'docs',
description: 'Здесь лежат все методички и хостится наш сайт.',
url: 'https://github.com/efremovnv/docs',
icon: '★'
},
{
title: 'mf-bmstu-k3',
description: 'Кто-то создал этот гитхаб, вероятно, тут файлы для выполнения курсовой и ЛР.',
url: 'https://github.com/mf-bmstu-k3',
icon: '★'
},
{
title: 'Yonote docs',
description: 'Методичка на yonote для курсовой и ЛР.',
url: 'https://mafin.yonote.ru/share/evm/doc/metodicheskie-ukazaniya-po-vypolneniyu-kursovoj-raboty-bMFaeB2LTj',
icon: '🧁'
},
/*
// Пример добавления новой ссылки (просто раскомментируйте и заполните):
{
title: 'Новый ресурс',
description: 'Описание ресурса...',
url: 'https://google.com',
icon: '🔗'
},
*/
];

export const tools = [
/* Сюда будем добавлять инструменты позже */
];

export const LinkCard = ({title, description, url, icon}) => (

  <div className="col col--6 margin-bottom--lg">
    <div className="card shadow--md" style={{height: '100%'}}>
      <div className="card__header">
        <h3>{icon} {title}</h3>
      </div>
      <div className="card__body">
        <p>{description}</p>
      </div>
      <div className="card__footer">
        <a href={url} target="_blank" rel="noopener noreferrer" className="button button--primary button--outline">
          Перейти ↗
        </a>
      </div>
    </div>
  </div>
);

# 🔗 Полезные ссылки

Мы собрали все важные ресурсы в одном месте.

## 🏛️ Репозитории

<div className="row">
  {repositories.map((props, idx) => (
    <LinkCard key={idx} {...props} />
  ))}
</div>

## 🛠️ Инструменты

:::info В разработке
Этот раздел пополняется. Скоро возможно здесь появятся ссылки или инструкции на скачивание **Quartus II**, **ModelSim** и эмуляторов.
:::
