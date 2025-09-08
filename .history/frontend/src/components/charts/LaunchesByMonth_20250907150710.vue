<template>
  <VChart :option="option" autoresize style="height: 360px" />
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import * as d3 from "d3";
import { useSpacexStore } from "../../stores/useSpacexStore";
import theme from "../../assets/theme";
import { typography } from "../../assets/theme";
const spacexStore = useSpacexStore();
const option = ref<any>({});

// computed to get the launches
const processedLaunches = computed(() => {
  if (!spacexStore.launches.length) return { axisX: [], axisY: [], ma: [] };

  const byMonth = d3
    .rollups(
      spacexStore.launches.filter((d) => d.date_utc),
      (v) => v.length,
      (d) => d3.timeMonth(new Date(d.date_utc))
    )
    .sort((a, b) => +a[0] - +b[0]);

  const axisX = byMonth.map((d) => d3.timeFormat("%Y-%m")(d[0]));
  const axisY = byMonth.map((d) => d[1]);
  const ma = axisY.map((_, i) => {
    const w = axisY.slice(Math.max(0, i - 2), i + 1);
    return d3.mean(w) ?? 0;
  });

  return { axisX, axisY, ma };
});

// watch which updates the chart when the data changes
watch(
  processedLaunches,
  (newData) => {
    if (newData.axisX.length) {
      updateChart(newData);
    }
  },
  { immediate: true }
);

function updateChart(data: { axisX: string[]; axisY: number[]; ma: number[] }) {
  option.value = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" },
    grid: { top: 40, left: 40, right: 30, bottom: 40 },
    legend: {
      data: ["Launches", "3-month avg"],
      textStyle: {
        color: "#ffffff",
        fontFamily: typography.primary,
      },
    },
    xAxis: {
      type: "category",
      data: data.axisX,
      axisLabel: { interval: "auto", color: "#ffffff" },
    },
    yAxis: { type: "value", axisLabel: { color: "#ffffff" } },
    series: [
      {
        name: "Launches",
        type: "bar",
        data: data.axisY,
        barWidth: "55%",
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: theme.color[2] },
              { offset: 1, color: theme.color[3] },
            ],
          },
          shadowBlur: 8,
          shadowColor: "rgba(255,88,176,.35)",
        },
      },
      {
        name: "3-month avg",
        type: "line",
        smooth: true,
        data: data.ma,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3 },
        itemStyle: { color: "#ffa3d6" },
        areaStyle: { color: "rgba(255,163,214,.08)" },
      },
    ],
  };
}
</script>
