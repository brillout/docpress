export { testRun }

import { test, expect, run, fetchHtml, page, getServerUrl } from '@brillout/test-e2e'

function testRun(cmd: 'pnpm run dev' | 'pnpm run preview') {
  {
    // Preview => `npm run preview` takes a long time
    // Dev => `Learn more collapsible` takes a long time
    const additionalTimeout = 120 * 1000
    run(cmd, { additionalTimeout })
  }

  test('/', async () => {
    const html = await fetchHtml('/')
    expect(html).toContain('Introduction')
    expect(html).toContain('Feature 1')
    expect(html).toContain('Some global note.')
    await page.goto(getServerUrl() + '/')
    const text = await page.textContent('body')
    expect(text).toContain('Some global note.')
  })

  test('/features', async () => {
    await page.goto(getServerUrl() + '/features')
    const text = await page.textContent('body')
    expect(text).toContain('Some global note.')
    expect(text).toContain('Another page: Another Section > Some Page.')
  })
}
