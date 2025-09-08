<template><div ref="el" style="width: 100%; height: 300px;"></div></template>
<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
import * as d3 from 'd3';
import { getLaunches } from '@/api';

const el = ref<HTMLDivElement|null>(null);
let data: any[] = [];

onMounted(async () => {
  data = await getLaunches();
  render();
});

function render() {
}