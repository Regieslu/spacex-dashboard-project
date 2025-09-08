import { createApp } from "vue";
import App from "./App.vue";
import ECharts from "vue-echarts";
import "echarts"; // types

const app = createApp(App);
app.component("VChart", ECharts);
app.mount("#app");
