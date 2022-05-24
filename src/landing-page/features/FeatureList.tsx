import React from 'react'
import './FeatureList.css'
import iconChevron from './chevron.svg'

export { FeatureList }

type FeatureProps = {
  title: React.ReactNode
  desc: React.ReactNode
  learnMore?: React.ReactNode
  isSecondaryFeature?: true
}

function FeatureList({ features }: { features: FeatureProps[] }) {
  const numberOfFeatures = features.length
  const numberOfRows = Math.ceil(numberOfFeatures / 2)
  return (
    <div id="features">
      {Array.from({ length: numberOfRows }, (_, i) => {
        const feature1Id = 2 * i + 0
        const feature2Id = 2 * i + 1
        const feature1 = features[feature1Id]
        const feature2 = features[feature2Id]
        const className = ['features-row', feature2 ? '' : 'single-column'].filter(Boolean).join(' ')
        return (
          <div className={className} key={i}>
            <Feature {...{ ...feature1, featureId: feature1Id }} />
            {feature2 && <Feature {...{ ...feature2, featureId: feature2Id }} />}
          </div>
        )
      })}
    </div>
  )
}

function Feature({ title, desc, learnMore, isSecondaryFeature, featureId }: FeatureProps & { featureId: number }) {
  const name = `feature-${featureId}`
  const rightSide = featureId % 2 === 1
  return (
    <>
      <FeatureHead name={name} hasLearnMore={!!learnMore} isSecondaryFeature={isSecondaryFeature}>
        {' '}
        <h2>{title}</h2>
        {desc}
      </FeatureHead>
      {!!learnMore && (
        <LearnMore name={name} rightSide={rightSide}>
          {learnMore}
        </LearnMore>
      )}
    </>
  )
}

function FeatureHead({
  children,
  name,
  hasLearnMore,
  isSecondaryFeature,
  className = '',
}: {
  className?: string
  name?: string
  hasLearnMore?: boolean
  isSecondaryFeature?: true
  children: any
}) {
  return (
    <summary
      className={[
        className,
        'feature',
        'colorize-on-hover',
        hasLearnMore && 'has-learn-more',
        isSecondaryFeature && 'secondary-feature',
      ]
        .filter(Boolean)
        .join(' ')}
      id={name && `feature-${name}`}
      style={{ cursor: (hasLearnMore && 'pointer') || undefined }}
    >
      {children}
      {hasLearnMore && (
        <div style={{ textAlign: 'center', marginTop: '1em' }}>
          <button
            type="button"
            style={{
              textAlign: 'center',
              padding: '0 7px',
              paddingTop: 3,
              paddingBottom: 1,
              display: 'inline-block',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 600,
            }}
          >
            <span className="decolorize-5">Learn more</span>
            <br />
            <img className="decolorize-4 chevron" src={iconChevron} height="7" style={{ marginTop: 2 }} />
          </button>
        </div>
      )}
    </summary>
  )
}
function LearnMore({ children, name, rightSide }: { name: string; children: any; rightSide: boolean }) {
  return (
    <aside className={'learn-more ' + (rightSide ? 'right-side' : '')} id={`learn-more-${name}`}>
      {children}
    </aside>
  )
}
