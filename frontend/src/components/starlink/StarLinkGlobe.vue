<template>
  <div class="starlink-container">
    <div class="chart-header">
      <h3 class="chart-title">Starlink Constellation</h3>
      <div class="chart-controls">
        <div class="filter-group">
          <label class="filter-label">Launch Year:</label>
          <select v-model="selectedYear" class="year-filter">
            <option value="all">All Years</option>
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class="chart-stats">
      <div class="stat-item">
        <span class="stat-label"
          >Satellites in
          {{ selectedYear === "all" ? "All Years" : selectedYear }}</span
        >
        <span class="stat-value">{{ filteredSatellites.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Active Satellites</span>
        <span class="stat-value">{{ activeFilteredSatellites }}</span>
      </div>
    </div>
    <VChart :option="option" theme="spacex" autoresize style="height: 450px" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import "echarts-gl";
import { useSpacexStore } from "../../stores/useSpacexStore";
import { backgrounds } from "../../assets/theme";

const option = ref<any>({});
const spacexStore = useSpacexStore();
const selectedYear = ref("all");

// Get available years from launch dates
const availableYears = computed(() => {
  const years = new Set<number>();
  spacexStore.starlink.forEach((satellite: any) => {
    if (satellite.spaceTrack?.LAUNCH_DATE) {
      const year = new Date(satellite.spaceTrack.LAUNCH_DATE).getFullYear();
      if (!isNaN(year)) {
        years.add(year);
      }
    }
  });
  return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
});

// Filter satellites by selected year
const filteredSatellites = computed(() => {
  if (selectedYear.value === "all") {
    return spacexStore.starlink;
  }

  const year = parseInt(selectedYear.value);
  const filtered = spacexStore.starlink.filter((satellite: any) => {
    if (!satellite.spaceTrack?.LAUNCH_DATE) return false;
    const launchYear = new Date(satellite.spaceTrack.LAUNCH_DATE).getFullYear();
    return launchYear === year;
  });

  // Debug log
  console.log(`Filtering for year ${year}:`, {
    totalSatellites: spacexStore.starlink.length,
    filteredCount: filtered.length,
    selectedYear: selectedYear.value,
    sampleData: filtered.slice(0, 3).map((s) => ({
      name: s.spaceTrack?.OBJECT_NAME,
      launchDate: s.spaceTrack?.LAUNCH_DATE,
      decayed: s.spaceTrack?.DECAYED,
      hasInclination: !!s.spaceTrack?.INCLINATION,
    })),
  });

  return filtered;
});

const activeFilteredSatellites = computed(() => {
  return filteredSatellites.value.filter(
    (satellite: any) =>
      satellite.spaceTrack &&
      (!satellite.spaceTrack.DECAYED || satellite.spaceTrack.DECAYED === 0)
  ).length;
});

// Function to convert orbital elements to approximate position
function orbitalElementsToPosition(spaceTrack: any) {
  if (!spaceTrack) return null;

  const inclination = ((spaceTrack.INCLINATION || 0) * Math.PI) / 180; // Convert to radians
  const raan = ((spaceTrack.RA_OF_ASC_NODE || 0) * Math.PI) / 180; // Right Ascension of Ascending Node
  const meanAnomaly = ((spaceTrack.MEAN_ANOMALY || 0) * Math.PI) / 180;
  const apoapsis = spaceTrack.APOAPSIS || 550;

  // Convert orbital elements to approximate lat/lng
  // This is a simplified conversion for visualization purposes

  // For a circular orbit, mean anomaly approximates true anomaly
  const trueAnomaly = meanAnomaly;

  // Calculate position in orbital plane (simplified)
  // This gives an approximate position based on orbital mechanics

  // Calculate the argument of latitude (position along the orbit)
  const argLat = trueAnomaly;

  // Convert to Cartesian coordinates in orbital plane
  const x = Math.cos(argLat);
  const y = Math.sin(argLat) * Math.cos(inclination);
  const z = Math.sin(argLat) * Math.sin(inclination);

  // Rotate by RAAN
  const xRot = x * Math.cos(raan) - y * Math.sin(raan);
  const yRot = x * Math.sin(raan) + y * Math.cos(raan);
  const zRot = z;

  // Convert to spherical coordinates (lat/lng)
  const lat = (Math.asin(zRot) * 180) / Math.PI;
  const lng = (Math.atan2(yRot, xRot) * 180) / Math.PI;

  // Normalize longitude to 0-360
  const normalizedLng = ((lng % 360) + 360) % 360;

  return {
    lat: Math.max(-90, Math.min(90, lat)),
    lng: normalizedLng,
    altitude: apoapsis,
  };
}

// computed to get the starlink (filtered by year)
const processedStarlink = computed(() => {
  if (!filteredSatellites.value.length) {
    console.log("No filtered satellites found");
    return { points: [], satellites: [] };
  }

  // Filter satellites that have spaceTrack data (including decayed for historical view)
  const validSatellites = filteredSatellites.value.filter(
    (d: any) => d.spaceTrack && d.spaceTrack.INCLINATION != null
    // Removed decayed filter to show historical satellites
  );

  console.log("Processing satellites:", {
    filteredCount: filteredSatellites.value.length,
    validCount: validSatellites.length,
    invalidReasons: {
      noSpaceTrack: filteredSatellites.value.filter((d) => !d.spaceTrack)
        .length,
      noInclination: filteredSatellites.value.filter(
        (d) => d.spaceTrack && d.spaceTrack.INCLINATION == null
      ).length,
      decayed: filteredSatellites.value.filter(
        (d) => d.spaceTrack && d.spaceTrack.DECAYED === 1
      ).length,
    },
  });

  const points = validSatellites
    .map((d: any) => {
      const position = orbitalElementsToPosition(d.spaceTrack);
      if (!position) return null;

      return [position.lng, position.lat, position.altitude];
    })
    .filter(Boolean);

  console.log("Final points for globe:", points.length);

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

// watch for year filter changes
watch(selectedYear, () => {
  // Chart will automatically update due to processedStarlink computed property
});

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

        // Get satellite information from spaceTrack data
        const spaceTrack = satellite.spaceTrack;
        const name =
          spaceTrack?.OBJECT_NAME || `Starlink Satellite ${index + 1}`;
        const id = spaceTrack?.OBJECT_ID || satellite.id || "Unknown";
        const launchDate = spaceTrack?.LAUNCH_DATE || "Unknown";
        const altitude = spaceTrack?.APOAPSIS
          ? `${spaceTrack.APOAPSIS.toFixed(1)} km`
          : "Unknown";
        const periapsis = spaceTrack?.PERIAPSIS
          ? `${spaceTrack.PERIAPSIS.toFixed(1)} km`
          : "Unknown";
        const inclination = spaceTrack?.INCLINATION
          ? `${spaceTrack.INCLINATION.toFixed(2)}°`
          : "Unknown";
        const period = spaceTrack?.PERIOD
          ? `${spaceTrack.PERIOD.toFixed(1)} min`
          : "Unknown";
        const eccentricity = spaceTrack?.ECCENTRICITY
          ? spaceTrack.ECCENTRICITY.toFixed(4)
          : "Unknown";
        const meanMotion = spaceTrack?.MEAN_MOTION
          ? `${spaceTrack.MEAN_MOTION.toFixed(2)} rev/day`
          : "Unknown";
        const raan = spaceTrack?.RA_OF_ASC_NODE
          ? `${spaceTrack.RA_OF_ASC_NODE.toFixed(2)}°`
          : "Unknown";
        const meanAnomaly = spaceTrack?.MEAN_ANOMALY
          ? `${spaceTrack.MEAN_ANOMALY.toFixed(2)}°`
          : "Unknown";
        const status = spaceTrack?.DECAYED === 1 ? "Decayed" : "Active";

        return `
          <div style="padding: 10px; min-width: 250px;">
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
              <span style="color: #cccccc;">Apoapsis:</span> ${altitude}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #cccccc;">Periapsis:</span> ${periapsis}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #cccccc;">Inclination:</span> ${inclination}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #cccccc;">Period:</span> ${period}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #cccccc;">Eccentricity:</span> ${eccentricity}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #cccccc;">Mean Motion:</span> ${meanMotion}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #cccccc;">RAAN:</span> ${raan}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #cccccc;">Mean Anomaly:</span> ${meanAnomaly}
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
  background: #000000;
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

.chart-controls {
  margin-bottom: 15px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.year-filter {
  background: transparent;
  border: 1px solid #666666;
  border-radius: 6px;
  color: #ffffff;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  min-width: 120px;
}

.year-filter:focus {
  outline: none;
  border-color: #ff58b0;
}

.year-filter option {
  background: #000000;
  color: #ffffff;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 15px;
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

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .year-filter {
    width: 100%;
  }
}
</style>
