<template>
  <div class="shell">
    <Sidebar ref="sidebarRef" />
    <main class="content">
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
</script>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100dvh;
  background: #0f1116;
  transition: grid-template-columns 0.3s ease;
}

.shell:has(.sidebar.collapsed) {
  grid-template-columns: 60px 1fr;
}

.content {
  min-width: 0;
  background: #000000;
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
