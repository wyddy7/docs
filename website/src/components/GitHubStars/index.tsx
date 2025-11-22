import React, {useEffect, useState} from 'react';
import styles from './styles.module.css';

export default function GitHubStars(): React.ReactNode {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.github.com/repos/efremovnv/docs')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setStars(data.stargazers_count);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching GitHub stars:', error);
        setLoading(false);
      });
  }, []);

  return (
    <a 
      href="https://github.com/efremovnv/docs" 
      target="_blank" 
      rel="noopener noreferrer"
      className={styles.githubStarsButton}
      title="Поддержать проект звездой на GitHub"
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
      <span className={styles.separator}></span>
      {loading ? (
        <span className={styles.loading}>...</span>
      ) : (
        <span className={styles.starCount}>
          {stars !== null ? stars : 'Star'}
        </span>
      )}
    </a>
  );
}
