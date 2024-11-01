export { DocSearchInstall }

import React from 'react'
import { createPortal } from 'react-dom'
import { usePageContext } from '../renderer/usePageContext'
import { DocSearchModal, useDocSearchKeyboardEvents } from '@docsearch/react'
import { openDocsearchModal, closeDocsearchModal } from './toggleDocsearchModal'
import { Hit } from '../components/Algolia/Hit'
import "./css/styles.css"

function DocSearchInstall() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pageContext = usePageContext()
  const { algolia } = pageContext.meta

  const onOpen = () => {
    setIsOpen(true);
    openDocsearchModal()
  };

  const onClose = () => {
    setIsOpen(false);
    closeDocsearchModal()
  };

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen,
    onClose,
  });

  if (!algolia) return null
  return (
    <>
      {isOpen &&
        createPortal(<DocSearchModal
          appId={algolia.appId}
          indexName={algolia.indexName}
          apiKey={algolia.apiKey}
          insights={true}
          hitComponent={Hit}
          initialScrollY={window.scrollY}
          maxResultsPerGroup={Infinity}
          onClose={onClose}
        />, document.body)}
    </>
  )
}
