<template>
  <VChart :option="option" autoresize style="height: 360px" />
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as d3 from "d3";
import { useSpacexStore } from "../../assets/useSpacexStore";
import theme from "../../assets/theme";

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
});

const axisX = byMonth.map((d) => d3.timeFormat("%Y-%m")(d[0]));
const axisY = byMonth.map((d) => d[1]);
const ma = axisY.map((_, i) => {
  const w = axisY.slice(Math.max(0, i - 2), i + 1);
  return d3.mean(w) ?? 0;
});

onMounted(async () => {
  const raw = await getLaunches();
  const byMonth = d3
    .rollups(
      raw.filter((d) => d.date_utc),
      (v) => v.length,
      (d) => d3.timeMonth(new Date(d.date_utc))
    )
    .sort((a, b) => +a[0] - +b[0]);

  const x = byMonth.map((d) => d3.timeFormat("%Y-%m")(d[0]));
  const y = byMonth.map((d) => d[1]);

  const ma = y.map((_, i) => {
    const w = y.slice(Math.max(0, i - 2), i + 1);
    return d3.mean(w) ?? 0;
  });

  option.value = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" },
    grid: { top: 40, left: 40, right: 30, bottom: 40 },
    legend: {
      data: ["Launches", "3-month avg"],
      textStyle: { color: "#ffffff" },
    },
    xAxis: {
      type: "category",
      data: x,
      axisLabel: { interval: "auto", color: "#ffffff" },
    },
    yAxis: { type: "value", axisLabel: { color: "#ffffff" } },
    series: [
      {
        name: "Launches",
        type: "bar",
        data: y,
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
        data: ma,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3 },
        itemStyle: { color: "#ffa3d6" },
        areaStyle: { color: "rgba(255,163,214,.08)" },
      },
    ],
  };
});
</script>
