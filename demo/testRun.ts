export { testRun }

import { test, expect, run, fetchHtml, page, getServerUrl, autoRetry } from '@brillout/test-e2e'

function testRun(cmd: 'pnpm run dev' | 'pnpm run preview') {
  const isDev = cmd === 'pnpm run dev'

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
    expect(html).toContain('<meta name="twitter:site" content="@brillout">')
    expectAlgoliaCategory(html, 'Overview', 1)
  }
  async function testLandingPageClient() {
    expect(await page.textContent('h1')).toBe('Next Generation Docs')
    expect(await page.textContent('body')).toContain('This demo is used for testing and developing DocPress.')
    expect(await getTitleClient()).toBe('DocPress Demo')
  }

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
      expectAlgoliaCategory(html, 'Overview', 1)
    }
  })
  test(`${featuresURL} - custom URL hash`, async () => {
    const testUrlHash = async () => {
      await autoRetry(
        async () => {
          const hash = await page.evaluate(() => window.location.hash)
          expect(hash).toBe('#custom-hash')
        },
        { timeout: 5 * 1000 },
      )
    }
    /* Doens't work, seems to be a Playwright bug?
    await page.click('h2:has-text("Code blocks")', { timeout: 1000 })
    await page.click('h3:has-text("Custom URL hash for section heading")', { timeout: 1000 })
    await testUrlHash()
    //*/
    const text = await page.textContent('body')
    expect(text).toContain('Custom URL hash for section heading (custom hash)')
    await page.click('a[href="#custom-hash"]', { timeout: 1000 })
    await testUrlHash()
  })
  test(`${featuresURL} - JavaScript toggle`, async () => {
    const tsText1 = "const hello: string = 'world'"
    const jsText1 = "const hello = 'world'"
    const tsText2 = 'const someMessage: SomeMessage ='
    const jsText2 = 'const someMessage ='
    const hasJs = (text: string | null, yes = true) => {
      expect(text).not.toBe(null)
      if (yes) {
        expect(text).toContain(jsText1)
        expect(text).toContain(jsText2)
      } else {
        expect(text).not.toContain(jsText1)
        expect(text).not.toContain(jsText2)
      }
    }
    const hasTs = (text: string | null, yes = true) => {
      expect(text).not.toBe(null)
      if (yes) {
        expect(text).toContain(tsText1)
        expect(text).toContain(tsText2)
      } else {
        expect(text).not.toContain(tsText1)
        expect(text).not.toContain(tsText2)
      }
    }

    const textFull = await page.textContent('body')
    hasJs(textFull)
    hasTs(textFull)

    const expectTs = async () => {
      const text = await getVisibleText(page)
      hasJs(text, false)
      hasTs(text)
    }
    const expectJs = async () => {
      const text = await getVisibleText(page)
      hasJs(text)
      hasTs(text, false)
    }

    await page.evaluate(() => window.localStorage.clear())

    if (isDev) {
      await expectTs()
    } else {
      await expectJs()
    }

    await page.selectOption('select#code-lang-select', isDev ? 'JavaScript' : 'TypeScript')
    await autoRetry(
      async () => {
        if (isDev) {
          await expectJs()
        } else {
          await expectTs()
        }
      },
      { timeout: 5 * 1000 },
    )

    {
      const html = await fetchHtml(featuresURL)
      expect(html).toContain('SomeMessage')
    }
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
      expect(getTitleHtml(html)).toBe('Orphan Page | Demo')
      expectAlgoliaCategory(html, 'Guides', 0)
    }
  })

  const orphan2URL = '/orphan-2'
  test(orphan2URL, async () => {
    const html = await fetchHtml(orphan2URL)
    expect(getTitleHtml(html)).toBe('Orphan Page Without Headings | Demo')
    expect(html).toContain('Orphan Page Without Heading')
    expect(html).toContain('<meta name="algolia:category" content="Guides 2"><meta name="algolia:category:hide">')
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

type Page = typeof page
async function getVisibleText(page: Page, selector: string = 'body'): Promise<string> {
  return await page.evaluate((sel) => {
    function extractVisibleText(element: Element): string {
      const style = window.getComputedStyle(element)
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return ''
      }

      let text = ''
      for (const child of element.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          text += child.textContent
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          text += extractVisibleText(child as Element)
        }
      }
      return text
    }

    const root = document.querySelector(sel)
    return root ? extractVisibleText(root).trim() : ''
  }, selector)
}
