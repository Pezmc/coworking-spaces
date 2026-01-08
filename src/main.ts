import { createApp } from 'vue'
import VueTippy from 'vue-tippy'
import 'tippy.js/dist/tippy.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(VueTippy, {
  defaultProps: {
    placement: 'top',
    arrow: true,
  },
})

app.mount('#app')
