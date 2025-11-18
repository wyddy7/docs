import React, {useEffect, useState} from 'react';
import styles from './styles.module.css';

// Функция для определения правильного суффикса числительного в русском языке
function getNumberSuffix(num: number): string {
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;

  // Исключения для 11-14
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'звезд';
  }

  // Для остальных чисел проверяем последнюю цифру
  switch (lastDigit) {
    case 1:
      return 'звезду';
    case 2:
    case 3:
    case 4:
      return 'звезды';
    default:
      return 'звезд';
  }
}

export default function GitHubStars(): React.ReactNode {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Получаем данные о репозитории с GitHub API
    fetch('https://api.github.com/repos/your-username/docs')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setStars(data.stargazers_count);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching GitHub stars:', error);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <span>Загрузка...</span>;
  }

  if (error || stars === null) {
    return (
      <a href="https://github.com/your-username/docs" target="_blank" rel="noopener noreferrer">
        Поставьте звезду на GitHub
      </a>
    );
  }

  const nextStar = stars + 1;
  const suffix = getNumberSuffix(nextStar);

  return (
    <div className={styles.githubStarsContainer}>
      <a 
        href="https://github.com/your-username/docs" 
        target="_blank" 
        rel="noopener noreferrer"
        className={styles.githubStarsLink}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24"
          className={styles.starIcon}
        >
          <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
        </svg>
        <span className={styles.starText}>
          Чтобы не потерять документацию, пожалуйста, поставьте {nextStar} {suffix} на GitHub
        </span>
      </a>
    </div>
  );
}

