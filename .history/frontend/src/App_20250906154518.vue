<!-- <template>
  <main style="padding: 16px; max-width: 1100px; margin: 0 auto">
    <h1>SpaceX Dashboard</h1>

    <section style="margin-top: 24px">
      <h2>Lanzamientos por mes (línea)</h2>
      <LaunchesByMonth />
    </section>

    <section style="margin-top: 24px">
      <h2>Estado por año (barras apiladas)</h2>
      <LaunchesStackedStatus />
    </section>

    <section style="margin-top: 24px">
      <h2>Radar comparativo de cohetes</h2>
      <RocketsRadar />
    </section>

    <section style="margin-top: 24px">
      <h2>Globo de Starlink</h2>
      <StarLinkGlobe />
    </section>
  </main>
</template>

<script setup lang="ts">
import LaunchesByMonth from "./components/charts/LaunchesByMonth.vue";
import LaunchesStackedStatus from "./components/charts/LaunchesStackedStatus.vue";
import RocketsRadar from "./components/charts/RocketsRadar.vue";
import StarLinkGlobe from "./components/starlink/StarLinkGlobe.vue";
</script> -->
<template>
  <AppShell />
</template>
<script setup lang="ts">
import AppShell from "@/components/layout/AppShell.vue";
</script>
