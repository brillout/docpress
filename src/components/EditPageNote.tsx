import React from 'react'
import { RepoLink } from './RepoLink'
import { Emoji } from '../utils/server'

export { EditPageNote }

function EditPageNote({ pageContext }: { pageContext: { urlPathname: string } }) {
  const text = (
    <>
      <Emoji name="writing-hang" /> Edit this page
    </>
  )
  return (
    <div style={{ marginTop: 50 }}>
      <RepoLink path={'/docs/pages' + pageContext.urlPathname + '/+Page.mdx'} text={text} editMode={true} />
    </div>
  )
}
