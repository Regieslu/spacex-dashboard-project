<!-- components/charts/FlightSuccessScatter.vue -->
<template>
  <div class="chart-container">
    <h3 class="chart-title">Flight Number vs Success Rate</h3>

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
        <label class="control-label">Time Period:</label>
        <select v-model="timePeriod" class="control-select">
          <option value="year">By Year</option>
          <option value="month">By Month</option>
        </select>
      </div>
    </div>

    <VChart :option="option" autoresize style="height: 500px" />

    <div class="chart-stats">
      <div class="stat-item">
        <span class="stat-label">Total Periods:</span>
        <span class="stat-value">{{ totalPeriods }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Avg Success Rate:</span>
        <span class="stat-value">{{ averageSuccessRate }}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Best Period:</span>
        <span class="stat-value">{{ bestPeriod }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Flights:</span>
        <span class="stat-value">{{ totalFlights }}</span>
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
const timePeriod = ref("year");
const option = ref<any>({});

// Rockets disponibles con nombres hardcodeados
const rocketNames = {
  "5e9d0d95eda69955f709d1eb": "Falcon 1",
  "5e9d0d95eda69973a809d1ec": "Falcon 9",
  "5e9d0d95eda69974db09d1ed": "Falcon Heavy",
  "5e9d0d96eda699382d09d1ee": "Starship",
};

// Datos filtrados
const filteredLaunches = computed(() => {
  let launches = spacexStore.launches.filter(
    (launch: any) => launch.date_utc && launch.flight_number
  );

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

const scatterData = computed(() => {
  if (!filteredLaunches.value.length) return { points: [], trendLine: [] };

  let groupedData;

  if (timePeriod.value === "year") {
    groupedData = d3.group(filteredLaunches.value, (d: any) =>
      new Date(d.date_utc).getFullYear()
    );
  } else {
    // Agrupar por mes-año
    groupedData = d3.group(filteredLaunches.value, (d: any) => {
      const date = new Date(d.date_utc);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    });
  }

  const points = Array.from(groupedData.entries()).map(
    ([period, launches]: [string, any[]]) => {
      const total = launches.length;
      const successful = launches.filter((launch) => launch.success).length;
      const successRate = total > 0 ? (successful / total) * 100 : 0;
      const avgFlightNumber =
        d3.mean(launches, (d: any) => d.flight_number) || 0;
      const rocketName = rocketNames[launches[0]?.rocket?.id] || "Unknown";

      return {
        period,
        avgFlightNumber,
        successRate,
        total,
        successful,
        failed: total - successful,
        rocketName,
      };
    }
  );

  // Ordenar por flight number promedio
  points.sort((a, b) => a.avgFlightNumber - b.avgFlightNumber);

  // Crear línea de tendencia
  const trendLine = points.map((point) => [
    point.avgFlightNumber,
    point.successRate,
  ]);

  return { points, trendLine };
});

// Estadísticas
const totalPeriods = computed(() => scatterData.value.points.length);
const averageSuccessRate = computed(() => {
  if (scatterData.value.points.length === 0) return "0.0";
  const avg = d3.mean(scatterData.value.points, (d) => d.successRate) || 0;
  return avg.toFixed(1);
});
const bestPeriod = computed(() => {
  if (scatterData.value.points.length === 0) return "N/A";
  const best = scatterData.value.points.reduce((max, current) =>
    current.successRate > max.successRate ? current : max
  );
  return `${best.period} (${best.successRate.toFixed(1)}%)`;
});
const totalFlights = computed(() =>
  scatterData.value.points.reduce((sum, point) => sum + point.total, 0)
);

// Watch para actualizar el gráfico
watch(
  [scatterData, selectedRocket, timePeriod],
  ([newData]) => {
    if (newData.points.length > 0) {
      updateChart(newData);
    }
  },
  { immediate: true }
);

function updateChart(data: { points: any[]; trendLine: any[] }) {
  const scatterPoints = data.points.map((point) => [
    point.avgFlightNumber,
    point.successRate,
    point.period,
    point.total,
    point.successful,
    point.failed,
    point.rocketName,
  ]);

  option.value = {
    ...theme,
    title: {
      show: false,
    },
    tooltip: {
      ...theme.tooltip,
      trigger: "item",
      formatter: function (params: any) {
        if (params.seriesName === "Trend Line") return null;

        const [
          avgFlightNumber,
          successRate,
          period,
          total,
          successful,
          failed,
          rocketName,
        ] = params.data;
        return `
          <div style="margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #ffffff;">${period}</div>
          <div style="margin: 4px 0;">
            <span style="font-weight: 500; color: #94a3b8;">Rocket:</span>
            <span style="margin-left: 8px; font-weight: 600; color: #ffffff;">${rocketName}</span>
          </div>
            <div style="margin: 4px 0;">
              <span style="font-weight: 500; color: #94a3b8;">Avg Flight Number:</span>
              <span style="margin-left: 8px; font-weight: 600; color: #ffffff;">${avgFlightNumber.toFixed(
                1
              )}</span>
            </div>
            <div style="margin: 4px 0;">
              <span style="font-weight: 500; color: #94a3b8;">Success Rate:</span>
              <span style="margin-left: 8px; font-weight: 600; color: #ffffff;">${successRate.toFixed(
                1
              )}%</span>
            </div>
          <div style="margin: 8px 0 4px 0; font-weight: 600; color: #ff58b0; font-size: 12px;">📊 BREAKDOWN</div>
          <div style="margin: 3px 0;">
            <span style="font-weight: 500; color: #94a3b8;">Total Flights:</span>
            <span style="margin-left: 8px; font-weight: 600; color: #ffffff;">${total}</span>
          </div>
          <div style="margin: 3px 0;">
            <span style="font-weight: 500; color: #94a3b8;">✅ Successful:</span>
            <span style="margin-left: 8px; font-weight: 600; color: #fef6c0;">${successful}</span>
          </div>
          <div style="margin: 3px 0;">
            <span style="font-weight: 500; color: #94a3b8;">❌ Failed:</span>
            <span style="margin-left: 8px; font-weight: 600; color: #ff83c4;">${failed}</span>
          </div>
        `;
      },
    },
    legend: {
      show: false,
    },
    grid: {
      ...theme.grid,
      left: 80,
      right: 40,
      top: 40,
      bottom: 60,
    },
    xAxis: {
      ...theme.valueAxis,
      type: "value",
      name: "Average Flight Number",
      nameLocation: "middle",
      nameGap: 30,
      axisLabel: {
        ...theme.valueAxis.axisLabel,
        color: "#ffffff",
      },
    },
    yAxis: {
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
    series: [
      {
        name: "Success Rate",
        type: "scatter",
        data: scatterPoints,
        symbolSize: function (data: any) {
          // Tamaño basado en el número total de vuelos
          return Math.max(8, Math.min(20, data[3] * 0.5));
        },
        itemStyle: {
          color: function (params: any) {
            // Color basado en la tasa de éxito
            const successRate = params.data[1];
            if (successRate >= 80) return "#fef6c0";
            if (successRate >= 60) return "#ffb84d";
            if (successRate >= 40) return "#ff8a65";
            return "#ff83c4";
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
      {
        name: "Trend Line",
        type: "line",
        data: data.trendLine,
        smooth: true,
        symbol: "none",
        lineStyle: {
          color: "#ff58b0",
          width: 2,
          type: "dashed",
        },
        tooltip: {
          show: false,
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
