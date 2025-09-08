<template><div ref="el" style="width: 100%; height: 300px"></div></template>
<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import * as d3 from "d3";
import { getLaunches } from "@/api";

const el = ref<HTMLDivElement | null>(null);
let data: any[] = [];

onMounted(async () => {
  data = await getLaunches();
  render();
});

function render() {
  const host = el.value!;
  host.innerHTML = "";
  const width = host.clientWidth;
  const height = host.clientHeight;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const svg = d3
    .select(host)
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // group by month
  const parse = (d: string) => new Date(d);
  const byMonth = d3
    .rollups(
      data.filter((d) => d.date_utc),
      (v) => v.length,
      (d) => d3.timeMonth(parse(d.date_utc))
    )
    .sort((a, b) => a[0].getTime() - b[0].getTime());

  const axisX = d3
    .scaleTime()
    .domain(d3.extent(byMonth, (d) => d[0]) as [Date, Date])
    .range([0, innerWidth]);
  const axisY = d3
    .scaleLinear()
    .domain([0, d3.max(byMonth, (d) => d[1]) || 1])
    .nice()
    .range([innerHeight, 0]);

  g.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(axisX).ticks(6));
  g.append("g").call(d3.axisLeft(axisY));

  const line = d3
    .line<[Date, number]>()
    .x((d) => axisX(d[0]))
    .y((d) => axisY(d[1]));

  g.append("path")
    .datum(byMonth)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line as any);
}
</script>
