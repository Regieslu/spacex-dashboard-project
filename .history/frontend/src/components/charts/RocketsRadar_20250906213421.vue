<!-- components/charts/RocketsRadar.vue -->
<template>
  <VChart :option="option" autoresize style="height: 360px" />
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useSpacexStore } from "../../assets/useSpacexStore";

const option = ref<any>({});
const spacexStore = useSpacexStore();

// computed to get the rockets
const processedRockets = computed(() => {
  if (!spacexStore.rockets.length)
    return { rows: [], max: { leo: 1, cost: 1, mass: 1 } };
  const rows = spacexStore.rockets.map((r: any) => ({
    name: r.name,
    leo:
      r.payload_weights?.find((p: any) => /LEO/i.test(p.id || p.name))?.kg ?? 0,
    cost: r.cost_per_launch ?? 0,
    mass: r.mass?.kg ?? 0,
  }));
  const max = {
    leo: Math.max(...rows.map((d) => d.leo), 1),
    cost: Math.max(...rows.map((d) => d.cost), 1),
    mass: Math.max(...rows.map((d) => d.mass), 1),
  };
  return { rows, max };
});

// watch which updates the chart when the data changes
watch(
  processedRockets,
  (newData) => {
    if (newData.rows.length) {
      updateChart(newData);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  if (!spacexStore.rockets.length) {
    await spacexStore.fetchRockets();
  }
});

function updateChart(data: {
  rows: any[];
  max: { leo: number; cost: number; mass: number };
}) {
  option.value = {
    tooltip: {},
    legend: { type: "scroll", bottom: 0, textStyle: { color: "#ffffff" } },
    radar: {
      indicator: [
        { name: "LEO payload", max: data.max.leo },
        { name: "Cost/launch", max: data.max.cost },
        { name: "Mass", max: data.max.mass },
      ],
      splitArea: { areaStyle: { color: ["#1f1f25", "#18181d"] } },
    },
    series: [
      {
        type: "radar",
        areaStyle: { opacity: 0.25 },
        lineStyle: { width: 2 },
        data: data.rows.slice(0, 5).map((r) => ({
          name: r.name,
          value: [r.leo, r.cost, r.mass],
        })),
      },
    ],
  };
}
</script>
