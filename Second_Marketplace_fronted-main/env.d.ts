/// <reference types="vite/client" />

declare module 'vue' {
  export type Ref<T> = { value: T }
  export function ref<T>(value: T): Ref<T>
  export function computed<T>(getter: () => T): Ref<T>
  export function onMounted(fn: () => void): void
  export function defineComponent(options: any): any
  export function createApp(rootComponent: any): any
  const Vue: any
  export default Vue
}

declare module 'vue-router' {
  export const createRouter: any
  export const createWebHistory: any
  export const useRoute: any
  export const useRouter: any
  export const RouterLink: any
  export const RouterView: any
  const VueRouter: any
  export default VueRouter
}

declare module 'pinia' {
  export function defineStore(id: string, options: any): any
  export function createPinia(): any
  const Pinia: any
  export default Pinia
}
