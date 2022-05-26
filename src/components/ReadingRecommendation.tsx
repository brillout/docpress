import React from 'react'
import { Info } from './Info'
import { Link } from './Link'

export { ReadingRecommendation }

function ReadingRecommendation({ tour, links }: { tour?: true; links: string[] }) {
  const multiple = links.length + (tour ? 1 : 0) > 1
  return (
    <Info>
      {multiple ? ' ' : ''}
      <b>Reading Recommendation{multiple ? '.' : ': '}</b>
      {(() => {
        if (!multiple) {
          const link = tour ? <TourLink /> : <Link href={links[0]} />
          return (
            <>
              {link}
              {'.'}
            </>
          )
        }
        return (
          <ul
            style={{
              marginLeft: 18,
              marginTop: 11
            }}
          >
            {tour && (
              <li>
                <TourLink />
              </li>
            )}
            {links.map((link, i) => (
              <li key={i}>
                <Link href={link} />
              </li>
            ))}
          </ul>
        )
      })()}
    </Info>
  )
}

function TourLink() {
  return (
    <>
      <Link href={'/react-tour'} noBreadcrumb={true} /> or <Link href={'/vue-tour'} noBreadcrumb={true} />
    </>
  )
}
