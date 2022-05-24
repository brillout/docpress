import React from 'react'
import { RepoLink } from './components/RepoLink'
import { Emoji } from './utils/Emoji'

export { EditPageNote }

function EditPageNote({ pageContext }: { pageContext: { urlPathname: string } }) {
  const text = (
    <>
      <Emoji name="writing-hang" /> Edit this page
    </>
  )
  return (
    <div style={{ marginTop: 50 }}>
      <RepoLink path={'/docs/pages' + pageContext.urlPathname + '.page.mdx'} text={text} editMode={true} />
    </div>
  )
}
