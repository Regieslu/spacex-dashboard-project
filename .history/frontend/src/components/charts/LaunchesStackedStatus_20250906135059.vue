<template>
  <VChart :option="option" autoresize style="height: 340px" />
</template>

<script setup lang="ts">
import {
  onMounted,
  ref,
} from "vue";
import * as d3 from "d3";
import { getLaunches } from "../../api";

const option = ref<any>({});

onMounted(async () => {
 const raw =  await getLaunches();
 const toYear = (d: any) => new Date(d.date_utc).getFullYear();
 const byYear = d3.rollups(
  raw.filter(d => d.date_utc),
  v => d3.rollup(v, vv => vv.length, key),
  toYear as any
 ).map(([year, counts]) => ({
  year: String(year),
  success: counts.get("Success") ?? 0,
  failure: counts.get("Failure") ?? 0,
  unknown: counts.get("Unknown") ?? 0,
 })).sort((a, b) => + a.year - + b.year);

 option.value = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    }
  },
  legend: {
    data: ["Success", "Failure", "Unknown"],
  }
  grid: {
    top: 36,
    left: 40,
    right: 20,
    bottom: 30,
  }
 }
});
</script>
