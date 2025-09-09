<template>
  <div class="launch-timeline-container">
    <div class="chart-header">
      <h3 class="chart-title">Starlink Launch Timeline</h3>
      <div class="chart-controls">
        <select v-model="chartType" class="chart-type-select">
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="area">Area Chart</option>
        </select>
        <select v-model="timeGrouping" class="time-grouping-select">
          <option value="month">By Month</option>
          <option value="quarter">By Quarter</option>
          <option value="year">By Year</option>
        </select>
      </div>
    </div>

    <div class="chart-stats">
      <div class="stat-item">
        <span class="stat-label">Total Satellites</span>
        <span class="stat-value">{{ totalSatellites }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Active Satellites</span>
        <span class="stat-value">{{ activeSatellites }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">First Launch</span>
        <span class="stat-value">{{ firstLaunchDate }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Latest Launch</span>
        <span class="stat-value">{{ latestLaunchDate }}</span>
      </div>
    </div>

    <VChart
      :option="chartOption"
      theme="spacex"
      autoresize
      style="height: 400px"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useSpacexStore } from "../../stores/useSpacexStore";
import { backgrounds } from "../../assets/theme";
import * as d3 from "d3";

const spacexStore = useSpacexStore();
const chartType = ref("line");
const timeGrouping = ref("month");

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
      activeSatellites: satellites.filter(
        (s: any) => !s.spaceTrack.DECAYED || s.spaceTrack.DECAYED === 0
      ).length,
      satelliteIds: satellites.map((s: any) => s.id),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
});

// Group data by time period
const groupedData = computed(() => {
  if (!launchData.value.length) return [];

  const formatDate = (date: Date) => {
    switch (timeGrouping.value) {
      case "year":
        return d3.timeFormat("%Y")(date);
      case "quarter":
        return d3.timeFormat("%Y-Q%q")(date);
      case "month":
      default:
        return d3.timeFormat("%Y-%m")(date);
    }
  };

  const grouped = d3.rollup(
    launchData.value,
    (v) => ({
      total: d3.sum(v, (d) => d.satellites),
      active: d3.sum(v, (d) => d.activeSatellites),
    }),
    (d) => formatDate(d.date)
  );

  return Array.from(grouped.entries())
    .map(([period, data]) => ({
      period,
      satellites: data.total,
      activeSatellites: data.active,
      date: new Date(
        period +
          (timeGrouping.value === "month"
            ? "-01"
            : timeGrouping.value === "quarter"
            ? "-01"
            : "-01-01")
      ),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
});

// Statistics
const totalSatellites = computed(() =>
  launchData.value.reduce((sum, launch) => sum + launch.satellites, 0)
);
const activeSatellites = computed(() =>
  launchData.value.reduce((sum, launch) => sum + launch.activeSatellites, 0)
);
const firstLaunchDate = computed(() =>
  launchData.value.length
    ? d3.timeFormat("%Y-%m-%d")(launchData.value[0].date)
    : "N/A"
);
const latestLaunchDate = computed(() =>
  launchData.value.length
    ? d3.timeFormat("%Y-%m-%d")(
        launchData.value[launchData.value.length - 1].date
      )
    : "N/A"
);

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

  const seriesConfig = {
    line: {
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: {
        color: "#ff58b0",
        width: 3,
      },
      itemStyle: {
        color: "#ff58b0",
      },
      areaStyle: undefined,
    },
    bar: {
      type: "bar",
      itemStyle: {
        color: "#ff58b0",
        borderRadius: [2, 2, 0, 0],
      },
      emphasis: {
        itemStyle: {
          color: "#ff83c4",
        },
      },
    },
    area: {
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: {
        color: "#ff58b0",
        width: 3,
      },
      itemStyle: {
        color: "#ff58b0",
      },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(255, 88, 176, 0.4)" },
            { offset: 1, color: "rgba(255, 88, 176, 0.05)" },
          ],
        },
      },
    },
  };

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#ff58b0",
      textStyle: { color: "#ffffff" },
      formatter: (params: any) => {
        const data = params[0];
        const launchData = groupedData.value.find(
          (d) => d.period === data.name
        );
        return `${data.name}<br/>Satellites Launched: ${
          data.value
        }<br/>Active: ${launchData?.activeSatellites || 0}`;
      },
    },
    legend: {
      show: false,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: groupedData.value.map((d) => d.period),
      axisLine: { lineStyle: { color: "#666666" } },
      axisLabel: {
        color: "#ffffff",
        rotate: timeGrouping.value === "month" ? 45 : 0,
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
        data: groupedData.value.map((d) => d.satellites),
        ...seriesConfig[chartType.value as keyof typeof seriesConfig],
      },
    ],
    dataZoom: [
      {
        type: "inside",
        start: Math.max(0, 100 - 1000 / groupedData.value.length),
        end: 100,
      },
      {
        type: "slider",
        start: Math.max(0, 100 - 1000 / groupedData.value.length),
        end: 100,
        height: 20,
        bottom: 10,
        handleStyle: {
          color: "#ff58b0",
        },
        textStyle: {
          color: "#ffffff",
        },
      },
    ],
  };
});

// Watch for data changes
watch(
  [launchData, chartType, timeGrouping],
  () => {
    // Chart will update automatically via computed
  },
  { immediate: true }
);
</script>

<style scoped>
.launch-timeline-container {
  background: v-bind("backgrounds.container");
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #333333;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 10px;
}

.chart-type-select,
.time-grouping-select {
  background: transparent;
  border: 1px solid #666666;
  border-radius: 6px;
  color: #ffffff;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
}

.chart-type-select:focus,
.time-grouping-select:focus {
  outline: none;
  border-color: #ff58b0;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 88, 176, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 88, 176, 0.2);
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  color: #cccccc;
  font-size: 12px;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  color: #ff58b0;
  font-size: 16px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .chart-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .chart-controls {
    flex-direction: column;
    width: 100%;
  }
}
</style>
