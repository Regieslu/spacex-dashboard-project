<!-- components/starlink/StarlinkGlobeECharts.vue -->
<template>
  <div class="starlink-container">
    <VChart :option="option" theme="spacex" autoresize style="height: 520px" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import "echarts-gl";
import { useSpacexStore } from "../../stores/useSpacexStore";
import { backgrounds } from "../../assets/theme";

const option = ref<any>({});
const spacexStore = useSpacexStore();

// computed to get the starlink
const processedStarlink = computed(() => {
  if (!spacexStore.starlink.length) return { points: [] };
  const points = spacexStore.starlink
    .filter((d: any) => d.latitude != null && d.longitude != null)
    .map((d: any) => [d.longitude, d.latitude, d.altitude_km ?? 500]);
  return { points };
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

function updateChart(data: { points: number[][] }) {
  option.value = {
    backgroundColor: "transparent",
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
