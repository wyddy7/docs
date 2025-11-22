---
title: Полезные ссылки
description: Подборка ресурсов, репозиториев и инструментов
---

export const repositories = [
  {
    title: 'mf-bmstu-k3',
    description: 'Официальный репозиторий кафедры. Методические материалы и примеры работ.',
    url: 'https://github.com/mf-bmstu-k3',
    icon: '📦'
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
Этот раздел пополняется. Скоро здесь появятся ссылки на скачивание **Quartus II**, **ModelSim** и эмуляторов.
:::
