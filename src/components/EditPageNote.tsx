import React from 'react'
import { RepoLink } from './RepoLink'

export { EditPageNote }

function EditPageNote({ pageContext }: { pageContext: { urlPathname: string } }) {
  const text = (
    <>
      <span style={{ fontFamily: 'emoji' }}>✍</span> Edit this page
    </>
  )
  return (
    <div style={{ marginTop: 50 }}>
      <RepoLink path={'/docs/pages' + pageContext.urlPathname + '/+Page.mdx'} text={text} editMode={true} />
    </div>
  )
}
