import { VueReCaptcha } from 'vue-recaptcha-v3'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const options: any = {
    siteKey: config.public.recaptchaSiteKey,
    loaderOptions: {
      autoHideBadge: true,
      useRecaptchaNet: true,
      renderParameters: {
        hl: 'id',
      },
    },
  }
  nuxtApp.vueApp.use(VueReCaptcha, options)
})
