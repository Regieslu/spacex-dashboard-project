<!-- components/starlink/StarlinkGlobeECharts.vue -->
<template>
  <VChart :option="option" theme="spacex" autoresize style="height: 520px" />
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import "echarts-gl";
import { getStarlink } from "../../api";
const option = ref<any>({});

onMounted(async () => {
  const data = await getStarlink();
  const points = data
    .filter((d: any) => d.latitude != null && d.longitude != null)
    .map((d: any) => [d.longitude, d.latitude, d.altitude_km ?? 500]);

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
        data: points,
      },
    ],
  };
});
</script>
