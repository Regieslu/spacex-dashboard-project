<template>
  <section class="panel">
    <h1>Launches & Rockets</h1>
    <div class="grid">
      <!-- Inserta aquí tus charts -->
      <!-- <LaunchesCombo /> -->
      <!-- <LaunchesStackedPretty /> -->
      <!-- <RocketsRadar /> -->
    </div>
  </section>
</template>
<style scoped>
.panel {
  padding: 16px;
  color: #e5e7eb;
}
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 900px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
