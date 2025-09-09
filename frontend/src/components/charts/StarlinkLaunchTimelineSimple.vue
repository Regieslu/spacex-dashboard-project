<template>
  <div class="starlink-timeline-container">
    <div class="chart-header">
      <h3 class="chart-title">Starlink Launch Timeline</h3>
    </div>

    <VChart
      :option="chartOption"
      theme="spacex"
      autoresize
      style="height: 300px"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useSpacexStore } from "../../stores/useSpacexStore";
import { backgrounds } from "../../assets/theme";
import * as d3 from "d3";

const spacexStore = useSpacexStore();

// Process launch data from Starlink satellites
const launchData = computed(() => {
  if (!spacexStore.starlink.length) return [];

  // Group satellites by launch date from spaceTrack.LAUNCH_DATE
  const launchesByDate = d3.group(
    spacexStore.starlink.filter(
      (satellite: any) =>
        satellite.spaceTrack && satellite.spaceTrack.LAUNCH_DATE
    ),
    (satellite: any) => satellite.spaceTrack.LAUNCH_DATE
  );

  // Convert to array and sort by date
  return Array.from(launchesByDate.entries())
    .map(([date, satellites]) => ({
      date: new Date(date),
      satellites: satellites.length,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
});

// Group data by month for cleaner visualization
const groupedData = computed(() => {
  if (!launchData.value.length) return [];

  const grouped = d3.rollup(
    launchData.value,
    (v) => d3.sum(v, (d) => d.satellites),
    (d) => d3.timeFormat("%Y-%m")(d.date)
  );

  return Array.from(grouped.entries())
    .map(([period, satellites]) => ({
      period,
      satellites,
      date: new Date(period + "-01"),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
});

// Chart option
const chartOption = computed(() => {
  if (!groupedData.value.length) {
    return {
      backgroundColor: "transparent",
      title: {
        text: "No launch data available",
        left: "center",
        top: "middle",
        textStyle: { color: "#ffffff" },
      },
    };
  }

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#4ab6cf",
      textStyle: { color: "#ffffff" },
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>Satellites Launched: ${data.value}`;
      },
    },
    legend: {
      show: false,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: groupedData.value.map((d) => d.period),
      axisLine: { lineStyle: { color: "#666666" } },
      axisLabel: {
        color: "#ffffff",
        rotate: 45,
      },
      axisTick: { lineStyle: { color: "#666666" } },
    },
    yAxis: {
      type: "value",
      name: "Satellites Launched",
      nameTextStyle: { color: "#ffffff" },
      axisLine: { lineStyle: { color: "#666666" } },
      axisLabel: { color: "#ffffff" },
      axisTick: { lineStyle: { color: "#666666" } },
      splitLine: { lineStyle: { color: "#333333" } },
    },
    series: [
      {
        name: "Satellites Launched",
        type: "line",
        data: groupedData.value.map((d) => d.satellites),
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          color: "#4ab6cf",
          width: 3,
        },
        itemStyle: {
          color: "#4ab6cf",
        },
      },
    ],
    dataZoom: [
      {
        type: "inside",
        start: Math.max(0, 100 - 1000 / groupedData.value.length),
        end: 100,
      },
    ],
  };
});

// Watch for data changes
watch(
  [launchData],
  () => {
    // Chart will automatically update due to computed property
  },
  { immediate: true }
);
</script>

<style scoped>
.starlink-timeline-container {
  background: v-bind("backgrounds.container");
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #333333;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  margin-bottom: 15px;
}

.chart-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}
</style>
