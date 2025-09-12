import { createRouter, createWebHistory } from "vue-router";

const Dashboard = () => import("../views/Dashboard.vue");
const LaunchesRockets = () => import("../views/LaunchesRockets.vue");
const Starlink = () => import("../views/StarLink.vue");

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/dashboard" },
    { path: "/dashboard", name: "Dashboard", component: Dashboard },
    {
      path: "/launches-rockets",
      name: "Launches & Rockets",
      component: LaunchesRockets,
    },
    { path: "/starlink", name: "Starlink", component: Starlink },
    { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});
