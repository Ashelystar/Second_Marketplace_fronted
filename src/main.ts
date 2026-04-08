import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Home from './views/Home.vue'
import router from './router'

const app = createApp(Home)

app.use(createPinia())
app.use(router)

app.mount('#app')

