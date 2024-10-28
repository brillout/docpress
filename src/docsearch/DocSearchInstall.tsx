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

  const onOpen = React.useCallback(() => {
    setIsOpen(true);
    openDocsearchModal()
  }, [setIsOpen, openDocsearchModal]);

  const onClose = React.useCallback(() => {
    setIsOpen(false);
    closeDocsearchModal()
  }, [setIsOpen, closeDocsearchModal]);

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
          onClose={onClose}
        />, document.body)}
    </>
  )
}
