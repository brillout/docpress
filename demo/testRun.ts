export { testRun }

import { test, expect, run, fetchHtml, page, getServerUrl, testScreenshotFixture } from '@brillout/test-e2e'

function testRun(cmd: 'pnpm run dev' | 'pnpm run preview') {
  {
    // Preview => `npm run preview` takes a long time
    // Dev => `Learn more collapsible` takes a long time
    const additionalTimeout = 120 * 1000
    run(cmd, { additionalTimeout })
  }

  const landingPageUrl = '/'
  test(landingPageUrl, async () => {
    const html = await fetchHtml(landingPageUrl)
    expect(getTitle(html)).toBe('Vike Demo')
    expect(html).toContain('Introduction')
    expect(html).toContain('Feature 1')
    expect(html).toContain('Some global note.')
    await page.goto(getServerUrl() + landingPageUrl)
    const text = await page.textContent('body')
    expect(text).toContain('Some global note.')
  })

  const orphanURL = '/orphan'
  test(orphanURL, async () => {
    await page.goto(getServerUrl() + orphanURL)
    const text = await page.textContent('body')
    expect(text).toContain(`This page is "detached": it isn't included in the left-side navigation.`)
    expect(text).toContain(`Another Orphan Page Without Headings.`)
    expect(text).toContain(`Same page link for orphan page: Some SecTion.`)
    {
      const html = await fetchHtml(orphanURL)
      expect(getTitle(html)).toBe('Orphan Page | DocPress Demo')
    }
  })

  const featuresURL = '/features'
  test(featuresURL, async () => {
    await page.goto(getServerUrl() + featuresURL)
    const text = await page.textContent('body')
    expect(text).toContain('Some global note.')
    expect(text).toContain('Another Section > Some Page (basic link)')
    {
      const html = await fetchHtml(featuresURL)
      expect(getTitle(html)).toBe('Features | DocPress Demo')
    }
  })

  test('screenshot fixture', async () => {
    await page.click('a[href="/some-page"]')
    await testScreenshotFixture({ doNotTestLocally: true })
  })
}

function getTitle(html: string) {
  const title = html.match(/<title>(.*?)<\/title>/i)?.[1]
  return title
}
