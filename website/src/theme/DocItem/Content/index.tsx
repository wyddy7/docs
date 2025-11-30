import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type {WrapperProps} from '@docusaurus/types';
import {useLocation} from '@docusaurus/router';
import DownloadListingsButton from '@site/src/components/DownloadListingsButton';
import DownloadPdfButton from '@site/src/components/DownloadPdfButton';
import AutoDownloadZipButtons from '@site/src/components/AutoDownloadZipButtons';
import Comments from '@site/src/components/Comments';
import styles from './styles.module.css';

type Props = WrapperProps<typeof ContentType>;

/**
 * Определяет, нужно ли показывать комментарии на текущей странице
 * Комментарии показываются только на:
 * - Лабораторных работах (labs-sem6, labs-sem7, additional-labs)
 * - Курсовых работах (course-work)
 * - Страницах links и contributing
 */
function shouldShowComments(pathname: string): boolean {
  // Нормализуем путь (убираем trailing slash)
  const normalizedPath = pathname.replace(/\/$/, '');
  
  // Показываем комментарии на лабораторных работах
  // Путь будет типа: /docs/labs/computer-organization/labs-sem6/lab1
  // или /labs/computer-organization/labs-sem6/lab1
  if (
    normalizedPath.includes('labs-sem6/') ||
    normalizedPath.includes('labs-sem7/') ||
    normalizedPath.includes('additional-labs/')
  ) {
    return true;
  }

  // Показываем комментарии на курсовых работах
  // Путь будет типа: /docs/labs/course-work/01-rp-op-design
  if (normalizedPath.includes('course-work/')) {
    return true;
  }

  // Показываем комментарии на страницах links и contributing
  // Путь будет типа: /docs/labs/links или /docs/labs/contributing
  if (
    normalizedPath.endsWith('/links') ||
    normalizedPath.endsWith('/contributing') ||
    normalizedPath.includes('/links/') ||
    normalizedPath.includes('/contributing/')
  ) {
    return true;
  }

  // Не показываем на остальных страницах (intro, structure-plan и т.д.)
  return false;
}

export default function ContentWrapper(props: Props): React.JSX.Element {
  const location = useLocation();
  const showComments = shouldShowComments(location.pathname);

  // Отладочный вывод (только в development)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[Comments] Pathname:', location.pathname, 'Show comments:', showComments);
  }

  return (
    <>
      <div className={styles.downloadButtonsContainer} data-download-buttons-container>
        <div className={styles.downloadButtonWrapper}>
          <DownloadListingsButton />
        </div>
        <div className={styles.downloadButtonWrapper}>
          <AutoDownloadZipButtons />
        </div>
        <div className={styles.downloadButtonWrapper}>
          <DownloadPdfButton />
        </div>
      </div>
      <Content {...props} />
      {/* Временно отключено: требуется установка Giscus app на репозиторий */}
      {/* {showComments && <Comments />} */}
    </>
  );
}

