import { createApp } from "vue";
import App from "./App.vue";
import ECharts from "vue-echarts";
import * as echarts from "echarts"; // types
import theme from "./assets/theme";

echarts.registerTheme("spacex", theme as any);

const app = createApp(App);
app.component("VChart", ECharts);
app.mount("#app");
