<!-- components/charts/LandingSuccessChart.vue -->
<template>
  <div class="chart-container">
    <h3 class="chart-title">Landing Success Rate</h3>
    <div class="chart-controls">
      <select v-model="selectedYear" class="year-filter">
        <option value="all">All Years</option>
        <option v-for="year in availableYears" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
    </div>
    <VChart :option="option" autoresize style="height: 350px" />
    <div class="chart-stats">
      <div class="stat-item">
        <span class="stat-label">Total Landings:</span>
        <span class="stat-value">{{ totalLandings }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Success Rate:</span>
        <span class="stat-value success">{{ successRate }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useSpacexStore } from "../../stores/useSpacexStore";
import theme from "../../assets/theme";

const spacexStore = useSpacexStore();
const selectedYear = ref("all");
const option = ref<any>({});

// Computed para obtener los datos de aterrizajes
const landingData = computed(() => {
  if (!spacexStore.launches.length) {
    return { success: 0, failure: 0, unknown: 0, total: 0 };
  }

  let filteredLaunches = spacexStore.launches;

  // Filtrar por año si no es "all"
  if (selectedYear.value !== "all") {
    filteredLaunches = spacexStore.launches.filter((launch: any) => {
      const launchYear = new Date(launch.date_utc).getFullYear();
      return launchYear === parseInt(selectedYear.value);
    });
  }

  // Filtrar solo lanzamientos que tienen información de aterrizaje
  const landings = filteredLaunches.filter(
    (launch: any) =>
      launch.cores &&
      launch.cores.length > 0 &&
      launch.cores.some((core: any) => core.landing_attempt !== null)
  );

  const success = landings.filter((launch: any) =>
    launch.cores.some((core: any) => core.landing_success === true)
  ).length;

  const failure = landings.filter((launch: any) =>
    launch.cores.some((core: any) => core.landing_success === false)
  ).length;

  const unknown = landings.filter((launch: any) =>
    launch.cores.some((core: any) => core.landing_success === null)
  ).length;

  return { success, failure, unknown, total: landings.length };
});

// Años disponibles para el filtro
const availableYears = computed(() => {
  if (!spacexStore.launches.length) return [];

  const years = new Set(
    spacexStore.launches
      .filter((launch: any) => launch.date_utc)
      .map((launch: any) => new Date(launch.date_utc).getFullYear())
  );

  return Array.from(years).sort((a, b) => b - a);
});

// Estadísticas calculadas
const totalLandings = computed(() => landingData.value.total);
const successRate = computed(() => {
  if (landingData.value.total === 0) return 0;
  return Math.round(
    (landingData.value.success / landingData.value.total) * 100
  );
});

// Watch para actualizar el gráfico cuando cambien los datos
watch(
  [landingData, selectedYear],
  ([newData]) => {
    if (newData.total > 0) {
      updateChart(newData);
    }
  },
  { immediate: true }
);

function updateChart(data: {
  success: number;
  failure: number;
  unknown: number;
  total: number;
}) {
  const chartData = [
    {
      name: "Successful",
      value: data.success,
      itemStyle: { color: theme.color[5] },
    },
    {
      name: "Failed",
      value: data.failure,
      itemStyle: { color: theme.color[1] },
    },
    {
      name: "Unknown",
      value: data.unknown,
      itemStyle: { color: theme.color[2] },
    },
  ].filter((item) => item.value > 0);

  option.value = {
    ...theme,
    title: {
      show: false,
    },
    tooltip: {
      ...theme.tooltip,
      trigger: "item",
      formatter: function (params: any) {
        const percentage = ((params.value / data.total) * 100).toFixed(1);
        return `
          <div style="margin-bottom: 4px; font-weight: 600;">${params.name}</div>
          <div style="margin: 2px 0;">
            <span style="font-weight: 500;">Count:</span>
            <span style="margin-left: 8px; font-weight: 600;">${params.value}</span>
          </div>
          <div style="margin: 2px 0;">
            <span style="font-weight: 500;">Percentage:</span>
            <span style="margin-left: 8px; font-weight: 600;">${percentage}%</span>
          </div>
        `;
      },
    },
    legend: {
      ...theme.legend,
      data: chartData.map((item) => item.name),
      top: 20,
      left: "center",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "75%"],
        center: ["50%", "55%"],
        data: chartData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        label: {
          show: true,
          formatter: function (params: any) {
            const percentage = ((params.value / data.total) * 100).toFixed(1);
            return `${params.name}\n${percentage}%`;
          },
          color: "#ffffff",
          fontSize: 12,
          fontWeight: 500,
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: "#ffffff",
          },
        },
      },
    ],
  };
}
</script>

<style scoped>
.chart-container {
  background: #000000;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #263238;
}

.chart-title {
  color: #eceff1;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  font-family: "Space Grotesk", "Inter", system-ui, sans-serif;
}

.chart-controls {
  margin-bottom: 16px;
}

.year-filter {
  background: transparent;
  border: none;
  border-bottom: 1px solid #ffffff;
  border-radius: 0;
  color: #ffffff;
  padding: 8px 0;
  font-size: 14px;
  font-weight: 500;
  min-width: 120px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.year-filter:focus {
  outline: none;
  border-bottom-color: #f0f0fa;
}

.year-filter:hover {
  border-bottom-color: #f0f0fa;
}

.year-filter option {
  background: #000000;
  color: #ffffff;
  padding: 8px 12px;
  font-size: 14px;
}

.chart-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #263238;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
}

.stat-value {
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
}

.stat-value.success {
  color: #f0f0fa;
}

@media (max-width: 768px) {
  .chart-stats {
    flex-direction: column;
    gap: 12px;
  }

  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
