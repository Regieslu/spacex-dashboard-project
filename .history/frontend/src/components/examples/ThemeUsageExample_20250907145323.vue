<!-- Ejemplo de cómo usar los colores y tipografía del theme en cualquier componente -->

<template>
  <div class="example-component">
    <h1 class="title-primary">Título Principal</h1>
    <h2 class="title-secondary">Título Secundario</h2>
    <div class="card">Mi Card con fuente principal</div>
    <div class="container">Mi Contenedor</div>
    <div class="mono-text">Texto monoespaciado (como SpaceX)</div>
  </div>
</template>

<script setup lang="ts">
// Importar los colores y tipografía del theme
import { backgrounds, colors, axisText, titleText, typography } from "../assets/theme";
</script>

<style scoped>
.example-component {
  /* Usar v-bind() para acceder a los colores y fuentes importados */
  background: v-bind("backgrounds.main");
  color: v-bind("titleText");
  font-family: v-bind("typography.primary");
  padding: 20px;
}

.title-primary {
  font-family: v-bind("typography.primary");
  font-weight: 700;
  color: v-bind("titleText");
}

.title-secondary {
  font-family: v-bind("typography.secondary");
  font-weight: 600;
  color: v-bind("axisText");
}

.card {
  background: v-bind("backgrounds.card");
  color: v-bind("axisText");
  padding: 16px;
  border-radius: 8px;
  margin: 8px 0;
  font-family: v-bind("typography.primary");
}

.container {
  background: v-bind("backgrounds.container");
  padding: 20px;
  border-radius: 12px;
  font-family: v-bind("typography.primary");
}

.mono-text {
  font-family: v-bind("typography.mono");
  background: v-bind("backgrounds.card");
  padding: 12px;
  border-radius: 6px;
  margin: 8px 0;
  color: v-bind("titleText");
}

/* También puedes usar los colores de la paleta */
.card:hover {
  background: v-bind("colors[0]"); /* #ff58b0 - magenta primario */
}
</style>
