<!-- components/charts/RocketsRadar.vue -->
<template>
  <VChart :option="option" autoresize style="height: 360px" />
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getRockets } from "@/api";
const option = ref<any>({});

onMounted(async () => {
  const rockets = await getRockets();
  // normaliza 3 métricas: payload_to_leo(kg), cost_per_launch, mass(kg)
  const rows = rockets.map((r: any) => ({
    name: r.name,
    leo:
      r.payload_weights?.find((p: any) => /LEO/i.test(p.id || p.name))?.kg ?? 0,
    cost: r.cost_per_launch ?? 0,
    mass: r.mass?.kg ?? 0,
  }));
  // escalas máximas
  const max = {
    leo: Math.max(...rows.map((d) => d.leo), 1),
    cost: Math.max(...rows.map((d) => d.cost), 1),
    mass: Math.max(...rows.map((d) => d.mass), 1),
  };
  option.value = {
    tooltip: {},
    legend: { type: "scroll", bottom: 0 },
    radar: {
      indicator: [
        { name: "LEO payload", max: max.leo },
        { name: "Cost/launch", max: max.cost },
        { name: "Mass", max: max.mass },
      ],
      splitArea: { areaStyle: { color: ["#1f1f25", "#18181d"] } },
    },
    series: [
      {
        type: "radar",
        areaStyle: { opacity: 0.25 },
        lineStyle: { width: 2 },
        data: rows.slice(0, 5).map((r) => ({
          // limita a 5 para legibilidad
          name: r.name,
          value: [r.leo, r.cost, r.mass],
        })),
      },
    ],
  };
});
</script>
