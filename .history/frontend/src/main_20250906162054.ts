import { createApp } from "vue";
import App from "./App.vue";
import ECharts from "vue-echarts";
import * as echarts from "echarts"; // types
import theme from "./assets/theme";
import "./assets/base.css";
import { router } from "./router";
echarts.registerTheme("spacex", theme as any);

const app = createApp(App);
app.component("VChart", ECharts);
app.use(router);
app.mount("#app");
