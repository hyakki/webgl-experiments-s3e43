import { createApp } from 'vue'
import App from './App.vue'
import './styles/main.scss'

import VueAware from 'vue-aware'

const app = createApp(App)

app.use(VueAware)
app.mount('#app')
