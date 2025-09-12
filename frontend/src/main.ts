import { createApp } from "vue";
import App from "./App.vue";
import ECharts from "vue-echarts";
import * as echarts from "echarts";
import theme from "./assets/theme";
import "./assets/base.css";
import { router } from "./router";
import { createPinia } from "pinia";
echarts.registerTheme("spacex", theme as any);

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.component("VChart", ECharts);
app.use(router);
app.mount("#app");
