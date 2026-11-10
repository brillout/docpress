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
    expect(html).toContain('<meta property="og:type" content="website">')
    expect(html).toContain('<meta property="og:title" content="DocPress Demo">')
    expect(html).toContain('<meta property="og:url" content="fake-website.example.org">')
    expect(html).toContain('<meta property="og:description" content="DocPress Demonstration.">')
    expect(html).toContain('<meta name="twitter:site" content="@brillout">')
    expect(html).toContain('aria-label="Changelog (v0.4.255)"')
    expect(html).toContain('href="https://x.com/brillout"')
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
    expect(text).toContain('Edit')
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
      // The YAML frontmatter of the ```md code block is highlighted, see getHighlighter.ts
      expect(html).toContain('>author</span>')
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
    // The page's own link (the "On this page" rail, earlier in the DOM, also links to the section)
    await page.click('.page-content a[href="#custom-hash"]', { timeout: 1000 })
    await testUrlHash()
  })
  test(`${featuresURL} - JavaScript toggle`, async () => {
    const tsText1 = "const hello: string = 'world'"
    const jsText1 = "const hello = 'world'"
    const tsText2 = 'const someMessage: SomeMessage ='
    const jsText2 = 'const someMessage ='
    const tsText3 = "const hello: string = 'world'\nconst hello: string[] = ['hello', 'world']"
    const jsText3 = "const hello = 'world'\nconst hello = ['hello', 'world']"
    const tsText4 = 'pages/(marketing)/index/+Page.ts'
    const jsText4 = 'pages/(marketing)/index/+Page.js'
    const hasJs = (text: string | null, yes = true) => {
      expect(text).not.toBe(null)
      if (yes) {
        expect(text).toContain(jsText1)
        expect(text).toContain(jsText2)
        expect(text).toContain(jsText3)
        expect(text).toContain(jsText4)
      } else {
        expect(text).not.toContain(jsText1)
        expect(text).not.toContain(jsText2)
        expect(text).not.toContain(jsText3)
        expect(text).not.toContain(jsText4)
      }
    }
    const hasTs = (text: string | null, yes = true) => {
      expect(text).not.toBe(null)
      if (yes) {
        expect(text).toContain(tsText1)
        expect(text).toContain(tsText2)
        expect(text).toContain(tsText3)
        expect(text).toContain(tsText4)
      } else {
        expect(text).not.toContain(tsText1)
        expect(text).not.toContain(tsText2)
        expect(text).not.toContain(tsText3)
        expect(text).not.toContain(tsText4)
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

    await expectJs()

    if (!isDev) {
      await page.locator('#choice-TypeScript').first().dispatchEvent('click')
    }

    await autoRetry(
      async () => {
        if (!isDev) {
          await expectTs()
        }
      },
      { timeout: 5 * 1000 },
    )

    // Test hiding the copy button
    const bashPreHtml = await page.innerHTML('pre[data-language="bash"]')
    expect(bashPreHtml).not.toContain('Copy to clipboard')

    {
      const html = await fetchHtml(featuresURL)
      expect(html).toContain('SomeMessage')
    }
  })

  test(`${featuresURL} - Choice Group`, async () => {
    const honoNpmChoiceText = 'npm install hono @photonjs/hono'
    const expressPnpmChoiceText = 'pnpm add express @photonjs/express'
    const honoChoiceText = "import { Hono } from 'hono'"
    const expressChoiceText = "import express from 'express'"
    const fastifyChoiceText = "import fastify from 'fastify'"

    const hasHonoChoice = (text: string | null, yes = true) => {
      expect(text).not.toBe(null)
      if (yes) {
        expect(text).toContain(honoNpmChoiceText)
        expect(text).toContain(honoChoiceText)
      } else {
        expect(text).not.toContain(honoNpmChoiceText)
        expect(text).not.toContain(honoChoiceText)
      }
    }

    const hasExpressChoice = (text: string | null, yes = true) => {
      expect(text).not.toBe(null)
      if (yes) {
        expect(text).toContain(expressPnpmChoiceText)
        expect(text).toContain(expressChoiceText)
      } else {
        expect(text).not.toContain(expressPnpmChoiceText)
        expect(text).not.toContain(expressChoiceText)
      }
    }

    const hasFastifyChoice = (text: string | null, yes = true) => {
      expect(text).not.toBe(null)
      if (yes) {
        expect(text).toContain(fastifyChoiceText)
      } else {
        expect(text).not.toContain(fastifyChoiceText)
      }
    }

    const textFull = await page.textContent('body')

    hasHonoChoice(textFull)
    hasExpressChoice(textFull)
    hasFastifyChoice(textFull)

    const expectHonoChoice = async () => {
      const text = await getVisibleText(page)
      hasHonoChoice(text)
      hasExpressChoice(text, false)
      hasFastifyChoice(text, false)
    }

    const expectExpressChoice = async () => {
      const text = await getVisibleText(page)
      hasHonoChoice(text, false)
      hasExpressChoice(text)
      hasFastifyChoice(text, false)
    }

    const expectFastifyChoice = async () => {
      await page.locator('#choice-Fastify').first().dispatchEvent('click')
      const text = await getVisibleText(page)
      hasHonoChoice(text, false)
      hasExpressChoice(text, false)
      hasFastifyChoice(text)
    }

    await page.evaluate(() => window.localStorage.clear())

    await expectHonoChoice()

    if (!isDev) {
      await page.locator('#choice-pnpm').first().dispatchEvent('click')
      await page.locator('#choice-Express').first().dispatchEvent('click')
    }

    await autoRetry(
      async () => {
        if (!isDev) {
          await expectExpressChoice()
          await expectFastifyChoice()
        }
      },
      { timeout: 5 * 1000 },
    )
  })

  test(`${featuresURL} - Choice Group nested in a <Tabs> choice`, async () => {
    // The `uiFramework` group is toggled by `<Tabs>` (its choices start with prose, so it has no dropdown) — but the
    // code blocks it contains still get their own npm/pnpm dropdown, also inside blockquotes.
    const reactChoice = page.locator('.choice[data-choice-value="React"]', { hasText: 'Install vike-react' })
    expect(await reactChoice.count()).toBe(1)
    expect(await reactChoice.locator('.choice-select__list[data-choice-group="pkgManager"]').count()).toBe(2)
    expect(await reactChoice.locator('blockquote .choice-select__list[data-choice-group="pkgManager"]').count()).toBe(1)
    const vueChoice = page.locator('.choice[data-choice-value="Vue"]', { hasText: 'Install vike-vue' })
    expect(await vueChoice.locator('.choice-select__list[data-choice-group="pkgManager"]').count()).toBe(1)
    expect(await vueChoice.locator('.choice-select__list[data-choice-group="codeLang"]').count()).toBe(1)

    // Multi-line commands are converted line by line (comments and package names containing `npm` are left alone)
    const text = await page.textContent('body')
    expect(text).toContain('npm install vike-react')
    expect(text).toContain('pnpm add vike-react')
    expect(text).toContain('yarn add vike-react')
    expect(text).toContain('bun add vike-react')
    expect(text).toContain('# Make sure you install skills-npm\nnpm install -D skills-npm\nnpx skills-npm setup')
    expect(text).toContain('# Make sure you install skills-npm\npnpm add -D skills-npm\npnpm dlx skills-npm setup')
    expect(text).toContain('# Make sure you install skills-npm\nyarn add --dev skills-npm\nyarn dlx skills-npm setup')
    expect(text).toContain('# Make sure you install skills-npm\nbun add --dev skills-npm\nbun x skills-npm setup')
  })

  test(`${featuresURL} - Choice Group without content for the selected choice`, async () => {
    // A group displays nothing while a choice it doesn't have content for is selected: it doesn't fall back to another
    // choice. (Only a choice absent from the whole page falls back, see `H3` below.)
    const expressNoteText = 'Express.js is deprecated.'
    const tsOnlyText = 'Some content only shown to TypeScript users.'
    const honoChoiceText = "import { Hono } from 'hono'"
    const helloReactText = 'Hello from React'
    const installSolidText = 'Install vike-solid'

    {
      const html = await fetchHtml(featuresURL)
      const getSelectedChoiceSSR = (text: string) =>
        page.evaluate(
          ([html, text]) => {
            const doc = new DOMParser().parseFromString(html, 'text/html')
            const choiceEl = [...doc.querySelectorAll('.choice')].filter((el) => el.textContent!.includes(text)).pop()!
            return choiceEl.closest('.choice-group')!.querySelector('select')!.value
          },
          [html, text] as const,
        )
      expect(await getSelectedChoiceSSR(expressNoteText)).toBe('Hono')
      expect(await getSelectedChoiceSSR(tsOnlyText)).toBe('JavaScript')
    }

    const expectVisible = async (text: string, yes = true) => {
      await autoRetry(
        async () => {
          const visibleText = await getVisibleText(page)
          if (yes) {
            expect(visibleText).toContain(text)
          } else {
            expect(visibleText).not.toContain(text)
          }
        },
        { timeout: 5 * 1000 },
      )
    }
    const clickTab = async (choiceGroup: string, choice: string) => {
      await page
        .locator(`.choice-tabs__tab-list[data-choice-group="${choiceGroup}"] label`, { hasText: choice })
        .click()
    }
    const load = async (choices: Record<string, string> = {}) => {
      await page.evaluate((choices) => {
        window.localStorage.clear()
        for (const [group, choice] of Object.entries(choices))
          window.localStorage.setItem(`docpress:choice:${group}`, choice)
      }, choices)
      await page.goto(getServerUrl() + featuresURL)
      await page.waitForFunction(() => (window as any).__docpress_hydrationFinished)
    }

    await load()
    await expectVisible(honoChoiceText)
    await expectVisible(expressNoteText, false)
    await expectVisible(tsOnlyText, false)

    await clickTab('server', 'Express')
    await expectVisible(expressNoteText)
    await clickTab('server', 'Fastify')
    await expectVisible(expressNoteText, false)
    await clickTab('server', 'Hono')
    await expectVisible(honoChoiceText)
    await expectVisible(expressNoteText, false)

    // The `React`/`Vue` group displays nothing while the `Solid` tab is selected
    await expectVisible(helloReactText)
    await clickTab('uiFramework', 'Solid')
    await expectVisible(installSolidText)
    await expectVisible(helloReactText, false)

    await load({ codeLang: 'TypeScript' })
    await expectVisible(tsOnlyText)

    // `H3` is absent from the page (hidden from the tabs, without content): fall back to the default choice (#169)
    await load({ server: 'H3' })
    await expectVisible(honoChoiceText)
    await expectVisible(expressNoteText, false)

    await page.evaluate(() => window.localStorage.clear())
  })

  const somePageUrl = '/some-page'
  test(`${somePageUrl} - custom <Pre> injected into nested MDX`, async () => {
    await page.goto(getServerUrl() + somePageUrl)
    const choiceGroupHtml = await page.innerHTML('div.choice-group')
    expect(choiceGroupHtml).toContain('Copy to clipboard')
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

  test(`${featuresURL} - "Docs" dropdown opened with the keyboard focuses its first link (narrow desktop)`, async () => {
    await open(featuresURL, 'desktopNarrow')
    await openWithKeyboard('#menu-navigation-0 a[href]')
  })

  test(`${featuresURL} - menu dialog opened with the keyboard: focus on the close button and back on the toggle, also opened again and scrolled down (tablet)`, async () => {
    const closeButton = '#menu-modal-wrapper .menu-modal-close'
    await open(featuresURL, 'tablet')
    await openWithKeyboard(closeButton)
    await openWithKeyboard(closeButton)
    // Once the scroll event is past (a scroll of the page closes the menu)
    await page.evaluate(() => window.scrollTo(0, 400))
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await openWithKeyboard(closeButton)
  })

  test(`${featuresURL} - "Docs" menu wherever the left navigation is hidden`, async () => {
    const isMenuToggleShown = async (url: string, viewport: Viewport) => {
      await open(url, viewport)
      return await page.isVisible('.menu-toggle-0')
    }
    expect(await isMenuToggleShown(featuresURL, 'desktopNarrow')).toBe(true)
    // Beside the left navigation, the category tabs replace it
    expect(await isMenuToggleShown(featuresURL, 'desktop')).toBe(false)
    // `hideMenuLeft`
    expect(await isMenuToggleShown('/tiny', 'desktop')).toBe(true)
    // Detached pages
    expect(await isMenuToggleShown(orphanURL, 'desktop')).toBe(true)
  })

  test(`${featuresURL} - "Skip to content" focused on a scrolled page`, async () => {
    await open(featuresURL, 'desktop')
    await page.evaluate(() => window.scrollTo(0, 800))
    await page.keyboard.press('Tab')
    // The page isn't scrolled back to the top to show it
    const focus = await page.evaluate(() => ({
      isSkipLink: document.activeElement!.matches('.skip-link'),
      scrollY: window.scrollY,
    }))
    expect(focus.isSkipLink).toBe(true)
    expect(focus.scrollY).toBe(800)
  })

  test(`${featuresURL} - the "Menu" toggle's focus ring isn't cut off (phone)`, async () => {
    await open(featuresURL, 'phone')
    await page.focus('.nav-head-menu-toggle')
    await expectWholeFocusRing('.nav-head-menu-toggle .text-menu')
  })

  test(`${featuresURL} - the logo lines up with the left navigation's text edge and the first category tab's icon, and doesn't move between pages`, async () => {
    const getLogoLeft = () =>
      page.evaluate(() => document.querySelector('.nav-head-logo img')?.getBoundingClientRect().left ?? null)
    await open(featuresURL, 'desktop')
    // The text edge: where the hairline of the left navigation's pages is
    const navLeftTextLeft = await page.evaluate(
      () => document.querySelector('#nav-left .nav-item-level-2')?.getBoundingClientRect().left ?? null,
    )
    const logoLeft = await getLogoLeft()
    expect(logoLeft).toBe(navLeftTextLeft)
    // The logo doesn't move between pages
    await open(landingPageUrl, 'desktop')
    expect(await getLogoLeft()).toBe(logoLeft)
    await open(featuresURL, 'desktopNarrow')
    const left = await page.evaluate(() => {
      const getLeft = (selector: string) => document.querySelector(selector)?.getBoundingClientRect().left ?? null
      return { logo: getLeft('.nav-head-logo img'), icon: getLeft('.category-tabs .category-tab-icon') }
    })
    expect(left.icon).toBe(left.logo)
  })

  for (const viewport of ['desktopSmall', 'desktop'] as const) {
    test(`${featuresURL} - "On this page" is as wide as the left navigation, the content in the middle (${viewport})`, async () => {
      await open(featuresURL, viewport)
      const widths = await page.evaluate(() => {
        const getRect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect()
        const content = getRect('.page-content')
        return {
          nav: getRect('#nav-left').width,
          navigation: getRect('#navigation-container').width,
          rail: getRect('#toc-rail').width,
          contentCenter: (content.left + content.right) / 2,
          viewportCenter: innerWidth / 2,
        }
      })
      expect(widths.rail).toBe(widths.nav)
      // The navigation stays in its column
      expect(widths.navigation <= widths.nav).toBe(true)
      expect(widths.contentCenter).toBe(widths.viewportCenter)
    })
  }

  test(`${featuresURL} - the left navigation doesn't repeat the category the current tab names`, async () => {
    await open(featuresURL, 'desktop')
    expect(await page.textContent('.category-tabs .category-tab.is-current')).toBe('Overview')
    expect(await page.isVisible('#nav-left .nav-item-level-2')).toBe(true)
    expect(await getVisibleText(page, '#nav-left')).not.toContain('Overview')
  })

  test(`${featuresURL} - the left navigation and "On this page" don't move as the header hides and comes back`, async () => {
    await open(featuresURL, 'short')
    const getRects = () =>
      page.evaluate(() =>
        ['#navigation-container', '.toc-rail-sticky']
          .map((selector) => {
            const { left, top, width, height } = document.querySelector(selector)!.getBoundingClientRect()
            return `${selector}: ${left}px, ${top}px, ${width}x${height}`
          })
          .join('; '),
      )
    await scrollTo(1200)
    await expectHeaderRows(headerHidden)
    const rects = await getRects()
    await scrollTo(1199)
    await expectHeaderRows(headerShown)
    expect(await getRects()).toBe(rects)
  })

  test(`${featuresURL} - the top bar names the category while the category tabs are hidden, and nothing else in it or the sides moves`, async () => {
    await open(featuresURL, 'laptop')
    const getRects = () =>
      page.evaluate(() =>
        ['.nav-head-logo', '.search-link', '.nav-head-secondary', '#navigation-container', '.toc-rail-sticky']
          .map((selector) => {
            const { left, top, width, height } = document.querySelector(selector)!.getBoundingClientRect()
            return `${selector}: ${left}px, ${top}px, ${width}x${height}`
          })
          .join('; '),
      )
    const getCategory = () =>
      page.evaluate(() => {
        const { visibility, opacity } = getComputedStyle(document.querySelector('.nav-head-category')!)
        return `${visibility}, opacity ${opacity}`
      })
    expect(await page.textContent('.nav-head-category')).toBe('Overview')
    await scrollTo(1200)
    await expectHeaderRows(headerShown, tabsHidden)
    await scrollTo(1199)
    await autoRetry(async () => expect(await getCategory()).toBe('hidden, opacity 0'), { timeout: 5 * 1000 })
    await expectHeaderRows(headerShown)
    const rects = await getRects()
    await scrollTo(1200)
    expect(await getRects()).toBe(rects)
    await autoRetry(
      async () => {
        expect(await isScrolledDown()).toBe(true)
        expect(await getRects()).toBe(rects)
        expect(await getCategory()).toBe('visible, opacity 1')
      },
      { timeout: 5 * 1000 },
    )
    await scrollTo(1199)
    await autoRetry(async () => expect(await getCategory()).toBe('hidden, opacity 0'), { timeout: 5 * 1000 })
    expect(await getRects()).toBe(rects)
  })

  test(`${featuresURL} - the top bar's category fades out as the category tabs come back`, async () => {
    await open(featuresURL, 'laptop')
    await scrollTo(1200)
    await autoRetry(async () => expect(await isScrolledDown()).toBe(true), { timeout: 5 * 1000 })
    // A fade that outlasts the test
    await page.addStyleTag({ content: ':root { --dp-duration-reveal: 60s; }' })
    await scrollTo(1199)
    await autoRetry(
      async () => {
        expect(await isScrolledDown()).toBe(false)
        const { visibility, opacity } = await page.evaluate(() => {
          const { visibility, opacity } = getComputedStyle(document.querySelector('.nav-head-category')!)
          return { visibility, opacity }
        })
        expect(visibility).toBe('visible')
        expect(opacity).toMatch(/^0\.\d*[1-9]/)
      },
      { timeout: 5 * 1000 },
    )
  })

  test(`${featuresURL} - the top bar's category keeps the keyboard focus on scroll up`, async () => {
    await open(featuresURL, 'laptop')
    // Shown and hidden at once
    await page.addStyleTag({ content: ':root { --dp-duration-reveal: 0s; }' })
    await scrollTo(1200)
    await autoRetry(async () => expect(await isScrolledDown()).toBe(true), { timeout: 5 * 1000 })
    await page.focus('.nav-head-logo')
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => document.activeElement!.className)).toContain('nav-head-category')
    await page.keyboard.press('ArrowUp')
    await autoRetry(async () => expect(await isScrolledDown()).toBe(false), { timeout: 5 * 1000 })
    // A hidden element loses the focus on the next frame
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const category = await page.evaluate(() => ({
      isFocused: document.activeElement!.matches('.nav-head-category'),
      visibility: getComputedStyle(document.querySelector('.nav-head-category')!).visibility,
    }))
    expect(category.isFocused).toBe(true)
    expect(category.visibility).toBe('visible')
  })

  test(`${featuresURL} - the logo's link spans the top bar up to the search (phone)`, async () => {
    await open(featuresURL, 'phone')
    const bar = await page.evaluate(() => ({
      logoRight: document.querySelector('.nav-head-logo')!.getBoundingClientRect().right,
      searchLeft: document.querySelector('.search-link')!.getBoundingClientRect().left,
    }))
    expect(bar.logoRight).toBe(bar.searchLeft)
  })

  test(`${featuresURL} - "On this page" counts from the top of the screen while the header is hidden`, async () => {
    await open(featuresURL, 'short')
    // A slide that outlasts the scroll: the rail is measured from where it ends up
    await page.addStyleTag({ content: ':root { --dp-duration-reveal: 60s; }' })
    // Scrolled down (the header slides away) until the "Code blocks" section ends half a top bar below where the rail
    // counts from (17px, TocRail.tsx): still on screen, but not if the header were counted as shown
    const sectionEnd = 17 + (await getCssPx('--nav-head-height')) / 2
    await page.evaluate(
      (sectionEnd) =>
        window.scrollTo(0, document.getElementById('basic')!.getBoundingClientRect().top + window.scrollY - sectionEnd),
      sectionEnd,
    )
    await autoRetry(
      async () => {
        const isCodeBlocksInked = await page.evaluate(() =>
          document.querySelector('.toc-item[href="#code-blocks"]')!.hasAttribute('data-visible'),
        )
        expect(isCodeBlocksInked).toBe(true)
      },
      { timeout: 5 * 1000 },
    )
  })

  test(`${featuresURL} - "On this page" after a jump down: the clicked section is the first marked`, async () => {
    await open(featuresURL, 'desktop')
    // Above the "Diff" heading, only its top margin is on screen
    await page.click('.toc-item[href="#diff"]')
    await autoRetry(
      async () => {
        const firstInked = await page.evaluate(
          () => document.querySelector('.toc-item[data-visible]')?.getAttribute('href') ?? null,
        )
        expect(firstInked).toBe('#diff')
      },
      { timeout: 5 * 1000 },
    )
  })

  test(`${featuresURL} - the header hides on scroll down and comes back on scroll up`, async () => {
    await open(featuresURL, 'short')
    await scrollTo(1200)
    await expectHeaderRows(headerHidden)
    await scrollTo(1199)
    await expectHeaderRows(headerShown)
    await scrollTo(1500)
    await expectHeaderRows(headerHidden)
  })

  test(`${featuresURL} - the header stays on a viewport tall enough for it`, async () => {
    await open(featuresURL, 'desktop')
    // Hidden at once
    await page.addStyleTag({ content: ':root { --dp-duration-reveal: 0s; }' })
    await scrollTo(1200)
    await autoRetry(async () => expect(await isScrolledDown()).toBe(true), { timeout: 5 * 1000 })
    await expectHeaderRows(headerShown)
  })

  test(`${featuresURL} - the strip the hidden header leaves takes clicks`, async () => {
    await open(featuresURL, 'short')
    const navHeadHeight = await getCssPx('--nav-head-height')
    const stripYs = [navHeadHeight / 2, navHeadHeight + (await getCssPx('--nav-tabs-height')) / 2]
    await scrollTo(1200)
    await autoRetry(
      async () => {
        expect(await isScrolledDown()).toBe(true)
        // The page, not the header
        const inHeader = await page.evaluate(
          (ys) => ys.filter((y) => document.elementFromPoint(700, y)!.closest('header')),
          stripYs,
        )
        expect(inHeader.join()).toBe('')
      },
      { timeout: 5 * 1000 },
    )
  })

  test(`${featuresURL} - Tab into the hidden header shows it without scrolling the page, with a whole focus ring`, async () => {
    await open(featuresURL, 'short')
    await scrollTo(1500)
    await expectHeaderRows(headerHidden)
    // "Skip to content", then the header's first control
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement!.closest('.nav-head'))).toBe(true)
    await expectHeaderRows(headerShown)
    expect(await page.evaluate(() => window.scrollY)).toBe(1500)
    const isLastControlFocused = await page.evaluate(() => {
      const controls = document.querySelectorAll<HTMLElement>('.nav-head :is(a[href], button)')
      const lastControl = controls[controls.length - 1]
      lastControl?.focus({ preventScroll: true })
      return !!lastControl && document.activeElement === lastControl
    })
    expect(isLastControlFocused).toBe(true)
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => document.activeElement!.matches('.category-tabs .category-tab'))).toBe(true)
    // The tabs' row scrolls sideways: it clips
    await expectWholeFocusRing('.category-tab:focus')
  })

  test('client-side navigation', async () => {
    await open(orphanURL, 'desktop')
    await page.click('.nav-head a[href="/"]')
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
const viewports = {
  phone: { width: 390, height: 844 },
  tablet: { width: 800, height: 720 },
  // Between `viewTablet` (1016) and `viewDesktop` (1061): a desktop too narrow for the left navigation
  desktopNarrow: { width: 1040, height: 720 },
  // A 1280px window without its scrollbar: from `viewTocRail` (1160), the "On this page" rail
  desktopSmall: { width: 1265, height: 720 },
  // Below `viewHeightTopBarStays` (700): a scroll down hides the whole header
  short: { width: 1440, height: 500 },
  // Below `viewHeightHeaderStays` (900): a scroll down hides the category tabs
  laptop: { width: 1440, height: 800 },
  // Nothing hides
  desktop: { width: 1440, height: 900 },
}
type Viewport = keyof typeof viewports
async function open(url: string, viewport: Viewport) {
  await page.setViewportSize(viewports[viewport])
  await page.goto(getServerUrl() + url)
  await page.waitForFunction(() => (window as any).__docpress_hydrationFinished)
}
async function openWithKeyboard(focused: string) {
  await page.focus('.menu-toggle-0')
  await page.keyboard.press('Enter')
  await autoRetry(
    async () => {
      const menu = await page.evaluate(
        (focused) => ({
          isOpen: document.documentElement.classList.contains('menu-modal-show'),
          isFocused: document.activeElement === document.querySelector(focused),
        }),
        focused,
      )
      expect(menu.isOpen).toBe(true)
      expect(menu.isFocused).toBe(true)
    },
    { timeout: 5 * 1000 },
  )
  await page.keyboard.press('Escape')
  await autoRetry(
    async () => {
      const menu = await page.evaluate(() => ({
        isOpen: document.documentElement.classList.contains('menu-modal-show'),
        isToggleFocused: document.activeElement === document.querySelector('.menu-toggle-0'),
      }))
      expect(menu.isOpen).toBe(false)
      expect(menu.isToggleFocused).toBe(true)
    },
    { timeout: 5 * 1000 },
  )
}
async function scrollTo(y: number) {
  await page.evaluate((y) => window.scrollTo(0, y), y)
}
async function isScrolledDown() {
  return await page.evaluate(() => document.documentElement.classList.contains('scrolled-down'))
}
// Both rows, by the top bar + the tabs + the hairline (63 + 44 + 1)
const headerHidden = 'matrix(1, 0, 0, 1, 0, -108)'
// The tabs alone, by their own height (44)
const tabsHidden = 'matrix(1, 0, 0, 1, 0, -44)'
const headerShown = 'none'
async function expectHeaderRows(topBarTransform: string, tabsTransform: string = topBarTransform) {
  await autoRetry(
    async () => {
      const transforms = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.top-nav-sticky > :is(.nav-head, .category-tabs)')).map(
          (row) => getComputedStyle(row).transform,
        ),
      )
      expect(transforms.join('; ')).toBe(`${topBarTransform}; ${tabsTransform}`)
    },
    { timeout: 5 * 1000 },
  )
}
// A length custom property, as the top bar reads it (e.g. `--nav-head-height`)
async function getCssPx(name: string): Promise<number> {
  const px = await page.evaluate(
    (name) => parseFloat(getComputedStyle(document.querySelector('.nav-head')!).getPropertyValue(name)),
    name,
  )
  expect(px > 0).toBe(true)
  return px
}
// The focus ring of `selector` is drawn and no ancestor's overflow cuts it off (`clip-path` and `contain` aren't checked)
async function expectWholeFocusRing(selector: string) {
  const ring = await page.evaluate((selector) => {
    const element = document.querySelector(selector)!
    const { outlineStyle, outlineOffset, outlineWidth } = getComputedStyle(element)
    const outset = parseFloat(outlineOffset) + parseFloat(outlineWidth)
    const r = element.getBoundingClientRect()
    const clippedBy: string[] = []
    for (let el = element.parentElement; el; el = el.parentElement) {
      const { overflowX, overflowY } = getComputedStyle(el)
      if (overflowX === 'visible' && overflowY === 'visible') continue
      const box = el.getBoundingClientRect()
      const left = box.left + el.clientLeft
      const top = box.top + el.clientTop
      const isInside =
        r.left - outset >= left &&
        r.top - outset >= top &&
        r.right + outset <= left + el.clientWidth &&
        r.bottom + outset <= top + el.clientHeight
      if (!isInside) clippedBy.push(`${el.tagName.toLowerCase()}.${el.className}`)
    }
    return { outlineStyle, clippedBy: clippedBy.join(', ') }
  }, selector)
  expect(ring.outlineStyle).not.toBe('none')
  expect(ring.clippedBy).toBe('')
}
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
