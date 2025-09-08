<!-- Ejemplo de cómo usar los colores del theme en cualquier componente -->

<template>
  <div class="example-component">
    <div class="card">Mi Card</div>
    <div class="container">Mi Contenedor</div>
  </div>
</template>

<script setup lang="ts">
// Importar los colores del theme
import { backgrounds, colors, axisText, titleText } from "../assets/theme";
</script>

<style scoped>
.example-component {
  /* Usar v-bind() para acceder a los colores importados */
  background: v-bind('backgrounds.main');
  color: v-bind('titleText');
}

.card {
  background: v-bind('backgrounds.card');
  color: v-bind('axisText');
  padding: 16px;
  border-radius: 8px;
  margin: 8px 0;
}

.container {
  background: v-bind('backgrounds.container');
  padding: 20px;
  border-radius: 12px;
}

/* También puedes usar los colores de la paleta */
.card:hover {
  background: v-bind('colors[0]'); /* #ff58b0 - magenta primario */
}
</style>
