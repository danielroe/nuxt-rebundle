import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('nuxt 5', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic-v5', import.meta.url)),
  })

  it('renders the index page', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('<div>rebundled 42</div>')
  })
})
