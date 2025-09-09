<!-- components/starlink/StarlinkGlobeECharts.vue -->
<template>
  <div class="starlink-container">
    <div class="chart-header">
      <h3 class="chart-title">Starlink Constellation</h3>
      <div class="chart-stats"></div>
    </div>
    <VChart :option="option" theme="spacex" autoresize style="height: 480px" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import "echarts-gl";
import { useSpacexStore } from "../../stores/useSpacexStore";
import { backgrounds } from "../../assets/theme";

const option = ref<any>({});
const spacexStore = useSpacexStore();

// Statistics
const totalSatellites = computed(() => spacexStore.starlink.length);
const activeSatellites = computed(
  () =>
    spacexStore.starlink.filter(
      (satellite: any) =>
        satellite.spaceTrack &&
        (!satellite.spaceTrack.DECAYED || satellite.spaceTrack.DECAYED === 0)
    ).length
);

// computed to get the starlink
const processedStarlink = computed(() => {
  if (!spacexStore.starlink.length) return { points: [], satellites: [] };

  const validSatellites = spacexStore.starlink.filter(
    (d: any) => d.latitude != null && d.longitude != null
  );

  const points = validSatellites.map((d: any) => [
    d.longitude,
    d.latitude,
    d.altitude_km ?? 500,
  ]);

  return { points, satellites: validSatellites };
});

// watch which updates the chart when the data changes
watch(
  processedStarlink,
  (newData) => {
    if (newData.points.length) {
      updateChart(newData);
    }
  },
  { immediate: true }
);

function updateChart(data: { points: number[][]; satellites: any[] }) {
  option.value = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#ff58b0",
      textStyle: { color: "#ffffff" },
      formatter: (params: any) => {
        const index = params.dataIndex;
        const satellite = data.satellites[index];

        if (!satellite) return "No data available";

        // Get satellite information from available data
        const name =
          satellite.spaceTrack?.OBJECT_NAME ||
          `Starlink Satellite ${index + 1}`;
        const id = satellite.spaceTrack?.OBJECT_ID || satellite.id || "Unknown";
        const launchDate = satellite.spaceTrack?.LAUNCH_DATE || "Unknown";
        const altitude = satellite.altitude_km
          ? `${satellite.altitude_km.toFixed(1)} km`
          : "Unknown";
        const velocity = satellite.velocity_kms
          ? `${satellite.velocity_kms.toFixed(2)} km/s`
          : "Unknown";
        const inclination = satellite.spaceTrack?.INCLINATION
          ? `${satellite.spaceTrack.INCLINATION.toFixed(2)}°`
          : "Unknown";
        const period = satellite.spaceTrack?.PERIOD
          ? `${satellite.spaceTrack.PERIOD.toFixed(1)} min`
          : "Unknown";
        const status =
          satellite.spaceTrack?.DECAYED === 1 ? "Decayed" : "Active";

        return `
          <div style="padding: 10px; min-width: 200px;">
            <div style="color: #ff58b0; font-weight: bold; margin-bottom: 8px; font-size: 14px;">
              ${name}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #cccccc;">ID:</span> ${id}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #cccccc;">Launch Date:</span> ${launchDate}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #cccccc;">Altitude:</span> ${altitude}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #cccccc;">Velocity:</span> ${velocity}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #cccccc;">Inclination:</span> ${inclination}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #cccccc;">Period:</span> ${period}
            </div>
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #333;">
              <span style="color: #cccccc;">Status:</span> 
              <span style="color: ${
                status === "Active" ? "#00ff88" : "#ff6b6b"
              }; font-weight: bold;">
                ${status}
              </span>
            </div>
          </div>
        `;
      },
    },
    globe: {
      baseTexture:
        "https://fastly.jsdelivr.net/gh/apache/echarts-website@asf-site/examples/data-gl/asset/world.topo.bathy.200401.jpg",
      heightTexture:
        "https://fastly.jsdelivr.net/gh/apache/echarts-website@asf-site/examples/data-gl/asset/bathymetry_bw_composite_4k.jpg",
      shading: "lambert",
      environment: "#0b0e13",
      viewControl: {
        autoRotate: true,
        autoRotateSpeed: 3,
        distance: 300, // zoom out
      },
    },
    visualMap: {
      show: false,
      min: 300,
      max: 600,
      inRange: { color: ["#ff83c4", "#ff58b0"] },
    },
    series: [
      {
        type: "scatter3D",
        coordinateSystem: "globe",
        symbolSize: (val: any) => Math.max(1, (val[2] - 250) / 80),
        itemStyle: { opacity: 0.9 },
        data: data.points,
      },
    ],
  };
}
</script>

<style scoped>
.starlink-container {
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
  margin: 0 0 15px 0;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 10px;
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: rgba(255, 88, 176, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 88, 176, 0.2);
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
    grid-template-columns: 1fr;
  }
}
</style>
