<template>
  <div class="mini-chart-container">
    <VChart :option="option" theme="spacex" autoresize style="height: 300px" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import theme from "../../assets/theme";

const props = defineProps<{
  data: Array<{ month: string; count: number }>;
}>();

const option = computed(() => {
  const months = props.data.map((d) => d.month);
  const counts = props.data.map((d) => d.count);

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: theme.tooltipBg,
      borderColor: "#263238",
      textStyle: { color: "#eceff1" },
    },
    grid: {
      left: 40,
      right: 20,
      top: 20,
      bottom: 40,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: months,
      axisLabel: { color: "#cfd8dc" },
      axisLine: { lineStyle: { color: "#90a4ae55" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#cfd8dc" },
      splitLine: { lineStyle: { color: "#546e7a55" } },
    },
    series: [
      {
        type: "line",
        data: counts,
        smooth: true,
        lineStyle: {
          color: "#ff58b0",
          width: 3,
        },
        itemStyle: {
          color: "#ff58b0",
          borderColor: "#161a20",
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(255, 88, 176, 0.3)" },
              { offset: 1, color: "rgba(255, 88, 176, 0.05)" },
            ],
          },
        },
        symbol: "circle",
        symbolSize: 6,
      },
    ],
  };
});
</script>

<style scoped>
.mini-chart-container {
  background: #161a20;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #263238;
}
</style>
