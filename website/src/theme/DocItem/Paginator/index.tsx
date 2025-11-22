import React from 'react';
import Paginator from '@theme-original/DocItem/Paginator';
import type PaginatorType from '@theme/DocItem/Paginator';
import type {WrapperProps} from '@docusaurus/types';
import DownloadPdfButton from '@site/src/components/DownloadPdfButton';

type Props = WrapperProps<typeof PaginatorType>;

export default function PaginatorWrapper(props: Props): React.JSX.Element {
  return (
    <>
      <DownloadPdfButton />
      <Paginator {...props} />
    </>
  );
}

