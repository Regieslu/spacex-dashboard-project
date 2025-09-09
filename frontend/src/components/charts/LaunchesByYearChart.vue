<template>
  <div class="chart-container">
    <h3 class="chart-title">Launches by Year</h3>

    <div class="chart-controls">
      <div class="control-group">
        <label class="control-label">Rocket:</label>
        <select v-model="selectedRocket" class="control-select">
          <option value="all">All Rockets</option>
          <option value="falcon1">Falcon 1</option>
          <option value="falcon9">Falcon 9</option>
          <option value="falconheavy">Falcon Heavy</option>
          <option value="starship">Starship</option>
        </select>
      </div>

      <div class="control-group">
        <label class="control-label">Chart Type:</label>
        <select v-model="chartType" class="control-select">
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="area">Area Chart</option>
        </select>
      </div>

      <div class="control-group">
        <label class="control-label">Show Success Rate:</label>
        <input
          v-model="showSuccessRate"
          type="checkbox"
          class="control-checkbox"
        />
      </div>
    </div>

    <VChart :option="option" autoresize style="height: 500px" />

    <div class="chart-stats">
      <div class="stat-item">
        <span class="stat-label">Total Launches:</span>
        <span class="stat-value">{{ totalLaunches }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Peak Year:</span>
        <span class="stat-value">{{ peakYear }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Growth Rate:</span>
        <span class="stat-value" :class="growthClass">{{ growthRate }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Avg per Year:</span>
        <span class="stat-value">{{ averagePerYear }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useSpacexStore } from "../../stores/useSpacexStore";
import theme from "../../assets/theme";
import * as d3 from "d3";

const spacexStore = useSpacexStore();
const selectedRocket = ref("all");
const chartType = ref("line");
const showSuccessRate = ref(false);
const option = ref<any>({});

// hardcodear rockets
const rocketNames = {
  "5e9d0d95eda69955f709d1eb": "Falcon 1",
  "5e9d0d95eda69973a809d1ec": "Falcon 9",
  "5e9d0d95eda69974db09d1ed": "Falcon Heavy",
  "5e9d0d96eda699382d09d1ee": "Starship",
};

// Datos filtrados
const filteredLaunches = computed(() => {
  let launches = spacexStore.launches.filter((launch: any) => launch.date_utc);

  // Filtrar por rocket
  if (selectedRocket.value !== "all") {
    launches = launches.filter((launch: any) => {
      const rocketId = launch.rocket?.id;
      const rocketName = rocketNames[rocketId];
      return (
        rocketName &&
        rocketName.toLowerCase().replace(/\s+/g, "") === selectedRocket.value
      );
    });
  }

  return launches;
});

// Procesar datos para el gráfico
const chartData = computed(() => {
  if (!filteredLaunches.value.length)
    return { years: [], launches: [], successRates: [], details: [] };

  // Agrupar por año
  const yearGroups = d3.group(filteredLaunches.value, (d: any) =>
    new Date(d.date_utc).getFullYear()
  );

  // Crear array de años ordenados
  const years = Array.from(yearGroups.keys()).sort((a, b) => a - b);

  const launchesData = years.map((year) => {
    const yearLaunches = yearGroups.get(year) || [];
    const total = yearLaunches.length;
    const successful = yearLaunches.filter(
      (launch: any) => launch.success
    ).length;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return {
      year: year.toString(),
      total,
      successful,
      failed: total - successful,
      successRate,
    };
  });

  return {
    years: launchesData.map((d) => d.year),
    launches: launchesData.map((d) => d.total),
    successRates: launchesData.map((d) => d.successRate),
    details: launchesData,
  };
});

// Estadísticas
const totalLaunches = computed(() => filteredLaunches.value.length);

const peakYear = computed(() => {
  if (!chartData.value.details.length) return "N/A";

  const peak = chartData.value.details.reduce((max, current) =>
    current.total > max.total ? current : max
  );

  return `${peak.year} (${peak.total})`;
});

const growthRate = computed(() => {
  if (chartData.value.launches.length < 2) return "N/A";

  const firstYear = chartData.value.launches[0];
  const lastYear =
    chartData.value.launches[chartData.value.launches.length - 1];

  if (firstYear === 0) return "N/A";

  const growth = ((lastYear - firstYear) / firstYear) * 100;

  if (growth > 0) return `+${growth.toFixed(0)}%`;
  if (growth < 0) return `${growth.toFixed(0)}%`;
  return "0%";
});

const growthClass = computed(() => {
  const rate = growthRate.value;
  if (rate.includes("+")) return "success";
  if (rate.includes("-")) return "error";
  return "";
});

const averagePerYear = computed(() => {
  if (chartData.value.years.length === 0) return "N/A";
  const avg = totalLaunches.value / chartData.value.years.length;
  return avg.toFixed(1);
});

watch(
  [chartData, selectedRocket, chartType, showSuccessRate],
  ([newData]) => {
    if (newData.years.length > 0) {
      updateChart(newData);
    }
  },
  { immediate: true }
);

function updateChart(data: {
  years: string[];
  launches: number[];
  successRates: number[];
  details: any[];
}) {
  const series = [];

  // Serie principal (lanzamientos)
  if (chartType.value === "line") {
    series.push({
      name: "Total Launches",
      type: "line",
      data: data.launches,
      smooth: true,
      symbol: "circle",
      symbolSize: 8,
      lineStyle: {
        color: "#fef6c0",
        width: 3,
      },
      itemStyle: {
        color: "#fef6c0",
        borderColor: "#ffffff",
        borderWidth: 2,
      },
      areaStyle: showSuccessRate.value
        ? undefined
        : {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#fef6c040" },
                { offset: 1, color: "#fef6c010" },
              ],
            },
          },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
    });
  } else if (chartType.value === "bar") {
    series.push({
      name: "Total Launches",
      type: "bar",
      data: data.launches,
      itemStyle: {
        color: "#fef6c0",
        borderRadius: [4, 4, 0, 0],
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
    });
  } else if (chartType.value === "area") {
    series.push({
      name: "Total Launches",
      type: "line",
      data: data.launches,
      smooth: true,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: {
        color: "#fef6c0",
        width: 2,
      },
      itemStyle: {
        color: "#fef6c0",
      },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "#fef6c060" },
            { offset: 1, color: "#fef6c020" },
          ],
        },
      },
    });
  }

  // Serie de success rate si está habilitada
  if (showSuccessRate.value) {
    series.push({
      name: "Success Rate (%)",
      type: "line",
      yAxisIndex: 1,
      data: data.successRates,
      smooth: true,
      symbol: "diamond",
      symbolSize: 6,
      lineStyle: {
        color: "#ff58b0",
        width: 2,
        type: "dashed",
      },
      itemStyle: {
        color: "#ff58b0",
      },
    });
  }

  option.value = {
    ...theme,
    title: {
      show: false,
    },
    tooltip: {
      ...theme.tooltip,
      trigger: "axis",
      formatter: function (params: any) {
        const year = params[0].axisValue;
        const detail = data.details.find((d) => d.year === year);

        let result = `<div style="margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #ffffff;">${year}</div>`;

        params.forEach((param: any) => {
          if (param.seriesName === "Total Launches") {
            result += `
              <div style="margin: 4px 0; padding: 4px 0; border-bottom: 1px solid #333;">
                <span style="display: inline-block; width: 10px; height: 10px; background: ${param.color}; margin-right: 8px; border-radius: 2px;"></span>
                <span style="font-weight: 500; color: #94a3b8;">Total Launches:</span>
                <span style="margin-left: 8px; font-weight: 600; color: #ffffff;">${param.value}</span>
              </div>
            `;
          } else if (param.seriesName === "Success Rate (%)") {
            result += `
              <div style="margin: 4px 0;">
                <span style="display: inline-block; width: 10px; height: 10px; background: ${
                  param.color
                }; margin-right: 8px; border-radius: 2px;"></span>
                <span style="font-weight: 500; color: #94a3b8;">Success Rate:</span>
                <span style="margin-left: 8px; font-weight: 600; color: #ffffff;">${param.value.toFixed(
                  1
                )}%</span>
              </div>
            `;
          }
        });

        if (detail) {
          result += `
            <div style="margin: 8px 0 4px 0; font-weight: 600; color: #ff58b0; font-size: 12px;">📊 BREAKDOWN</div>
            <div style="margin: 3px 0;">
              <span style="font-weight: 500; color: #94a3b8;">✅ Successful:</span>
              <span style="margin-left: 8px; font-weight: 600; color: #fef6c0;">${detail.successful}</span>
            </div>
            <div style="margin: 3px 0;">
              <span style="font-weight: 500; color: #94a3b8;">❌ Failed:</span>
              <span style="margin-left: 8px; font-weight: 600; color: #ff83c4;">${detail.failed}</span>
            </div>
          `;
        }

        return result;
      },
    },
    legend: {
      ...theme.legend,
      data: series.map((s) => s.name),
      top: 20,
      left: "center",
    },
    grid: {
      ...theme.grid,
      left: 80,
      right: 40,
      top: 80,
      bottom: 60,
    },
    xAxis: {
      ...theme.valueAxis,
      type: "category",
      data: data.years,
      name: "Year",
      nameLocation: "middle",
      nameGap: 30,
      axisLabel: {
        ...theme.valueAxis.axisLabel,
        color: "#ffffff",
      },
    },
    yAxis: [
      {
        ...theme.valueAxis,
        type: "value",
        name: "Number of Launches",
        nameLocation: "middle",
        nameGap: 50,
        axisLabel: {
          ...theme.valueAxis.axisLabel,
          color: "#ffffff",
        },
      },
      ...(showSuccessRate.value
        ? [
            {
              ...theme.valueAxis,
              type: "value",
              name: "Success Rate (%)",
              nameLocation: "middle",
              nameGap: 50,
              min: 0,
              max: 100,
              axisLabel: {
                ...theme.valueAxis.axisLabel,
                color: "#ffffff",
                formatter: function (value: number) {
                  return value + "%";
                },
              },
            },
          ]
        : []),
    ],
    series,
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
  margin: 0 0 20px 0;
  font-family: "Space Grotesk", "Inter", system-ui, sans-serif;
}

.chart-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: end;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
}

.control-select {
  background: transparent;
  border: none;
  border-bottom: 1px solid #ffffff;
  border-radius: 0;
  color: #ffffff;
  padding: 8px 0;
  font-size: 14px;
  font-weight: 500;
  min-width: 140px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.control-select:focus {
  outline: none;
  border-bottom-color: #ff58b0;
}

.control-select:hover {
  border-bottom-color: #ff58b0;
}

.control-select option {
  background: #000000;
  color: #ffffff;
  padding: 8px 12px;
  font-size: 14px;
}

.control-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #ff58b0;
  cursor: pointer;
}

.chart-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #263238;
  flex-wrap: wrap;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 120px;
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
  color: #fef6c0;
}

.stat-value.error {
  color: #ff83c4;
}

@media (max-width: 768px) {
  .chart-controls {
    flex-direction: column;
    gap: 12px;
  }

  .control-select {
    min-width: 100%;
  }

  .chart-stats {
    flex-direction: column;
    gap: 12px;
  }

  .stat-item {
    flex-direction: row;
    justify-content: space-between;
    min-width: auto;
  }
}
</style>
