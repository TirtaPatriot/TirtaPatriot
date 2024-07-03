import lint from '@antfu/eslint-config'

export default lint({
  unocss: true,
  vue: true,
  rules: {
    'vue/no-v-text-v-html-on-component': 'off',
  }
})
