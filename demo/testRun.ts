export { testRun }

import { test, expect, run, fetchHtml, page, getServerUrl, autoRetry } from '@brillout/test-e2e'

function testRun(cmd: 'pnpm run dev' | 'pnpm run preview') {
  {
    // Preview => `npm run preview` takes a long time
    // Dev => `Learn more collapsible` takes a long time
    const additionalTimeout = 120 * 1000
    run(cmd, { additionalTimeout })
  }

  const landingPageUrl = '/'
  test(landingPageUrl, async () => {
    await testLandingPageHtml()
    await page.goto(getServerUrl() + landingPageUrl)
    await testLandingPageClient()
  })
  async function testLandingPageHtml() {
    const html = await fetchHtml(landingPageUrl)
    expect(getTitleHtml(html)).toBe('DocPress Demo')
    expect(html).toContain('Introduction')
    expect(html).toContain('<meta property="og:type" content="website">')
    expect(html).toContain('<meta property="og:title" content="DocPress Demo">')
    expect(html).toContain('<meta property="og:url" content="fake-website.example.org">')
    expect(html).toContain('<meta property="og:description" content="DocPress Demonstration.">')
    expect(html).toContain('<meta name="twitter:site" content="fake-twitter-handle">')
    expectAlgoliaCategory(html, 'Overview', 1)
  }
  async function testLandingPageClient() {
    expect(await page.textContent('h1')).toBe('Next Generation Docs')
    expect(await page.textContent('body')).toContain('This demo is used for testing and developing DocPress.')
    expect(await getTitleClient()).toBe('DocPress Demo')
  }

  const orphanURL = '/orphan'
  test(orphanURL, async () => {
    await page.goto(getServerUrl() + orphanURL)
    const text = await page.textContent('body')
    expect(text).toContain(`This page is "detached": it isn't included in the left-side navigation.`)
    expect(text).toContain(`Another Orphan Page Without Headings.`)
    expect(text).toContain(`Same page link for orphan page: Some SecTion.`)
    {
      const html = await fetchHtml(orphanURL)
      expect(getTitleHtml(html)).toBe('Orphan Page | Demo')
    }
  })

  const featuresURL = '/features'
  test(featuresURL, async () => {
    await page.goto(getServerUrl() + featuresURL)
    const text = await page.textContent('body')
    expect(text).toContain('Features')
    expect(text).toContain('Edit this page')
    expect(text).toContain('This page is for testing/developing DocPress features.')
    expect(text).toContain('Guides > Some Page (basic link)')
    expect(text).toContain('Orphan Page (link to detached page)')
    expect(text).toContain('<Link> (same-page link, non-inferred original heading title without needing sectionTitles)')
    expect(text).toContain('Basic (same-page link, sub heading)')
    {
      const html = await fetchHtml(featuresURL)
      expect(getTitleHtml(html)).toBe('Features | Demo')
      expect(await getTitleClient()).toBe('Features | Demo')
    }
  })

  test('client-side navigation', async () => {
    await page.click('#nav-left a[href="/"]')
    await autoRetry(
      async () => {
        await testLandingPageClient()
      },
      { timeout: 5 * 1000 },
    )
  })
}

function getTitleHtml(html: string) {
  const titleHtml = html.match(/<title>(.*?)<\/title>/i)?.[1]
  return titleHtml
}
async function getTitleClient() {
  const titleClient = await page.evaluate(() => window.document.title)
  return titleClient
}

function expectAlgoliaCategory(html: string, category: string, order: number) {
  expect(html.split('algolia:category:order').length).toBe(2)
  expect(html.split('algolia:category"').length).toBe(2)
  expect(html).toContain(
    `<meta name="algolia:category" content="${category}"><meta name="algolia:category:order" content="${order}">`,
  )
}
