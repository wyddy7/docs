import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type {WrapperProps} from '@docusaurus/types';
import DownloadListingsButton from '@site/src/components/DownloadListingsButton';
import DownloadPdfButton from '@site/src/components/DownloadPdfButton';
import styles from './styles.module.css';

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): React.JSX.Element {
  return (
    <>
      <div className={styles.downloadButtonsContainer}>
        <div className={styles.downloadButtonWrapper}>
          <DownloadListingsButton />
        </div>
        <div className={styles.downloadButtonWrapper}>
          <DownloadPdfButton />
        </div>
      </div>
      <Content {...props} />
    </>
  );
}

