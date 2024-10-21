import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environmentOptions: {
      nuxt: {
        overrides: {
          modules: ['nuxt-rebundle'],
        },
      },
    },
    coverage: {
      reporter: ['text', 'json'],
    },
  },
})
