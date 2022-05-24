import React from 'react'
import { DocLink } from './DocLink'
import { isRepoLink, RepoLink } from './RepoLink'

export { Link }

function Link(props: {
  href: string
  text?: string | JSX.Element
  noBreadcrumb?: true
  doNotInferSectionTitle?: true
}) {
  if (isRepoLink(props.href)) {
    return <RepoLink path={props.href} text={props.text} />
  } else {
    return <DocLink {...props} />
  }
}
