import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import mitt from 'mitt';


const app = createApp(App)

app.use(store).mount('#app')