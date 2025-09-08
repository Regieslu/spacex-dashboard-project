<template>
  <div class="shell">
    <Sidebar />
    <main class="content">
      <header class="topbar">
        <h2 class="ttl">{{ currentTitle }}</h2>
        <!-- espacio para filtros globales, user, etc. -->
      </header>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from "./Sidebar.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";
const route = useRoute();
const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/launches-rockets": "Launches & Rockets",
  "/starlink": "Starlink",
};
const currentTitle = computed(() => {
  if (!route.path) return titles["/dashboard"];
  const m = Object.keys(titles).find((k) => route.path.startsWith(k));
  return titles[m || "/dashboard"];
});
</script>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100dvh;
  background: #0f1116;
}
.content {
  min-width: 0;
}
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(180deg, #0f1116, #0f111600);
  border-bottom: 1px solid #1c2130;
  padding: 12px 16px;
  color: #e5e7eb;
}
.ttl {
  font-weight: 700;
  letter-spacing: 0.2px;
}
@media (max-width: 900px) {
  .shell {
    grid-template-columns: 1fr;
  }
}
</style>
