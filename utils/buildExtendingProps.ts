import type { ComponentObjectPropsOptions, ExtractPropTypes } from 'vue'
// @ts-expect-error typings only
import { propsFactory } from 'vuetify/lib/util/propsFactory.mjs'

export default function buildExtendingProps<B, E>(baseProps: B, extendedProps: E, source: any) {
  const combinedProps = { ...baseProps, ...extendedProps }
  const builder = propsFactory(combinedProps, source)
  return builder() as ComponentObjectPropsOptions<B & ExtractPropTypes<E>>
}
