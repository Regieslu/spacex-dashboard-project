import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getLaunches,
  getRockets,
  getStarlink,
  getUpcomingLaunches,
} from "../api";

export const useSpacexStore = defineStore("spacex", () => {
  // state
  const launches = ref<any[]>([]);
  const rockets = ref<any[]>([]);
  const starlink = ref<any[]>([]);
  const upcomingLaunches = ref<any[]>([]);

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Cache individual por tipo de dato
  const lastFetchLaunches = ref<Date | null>(null);
  const lastFetchRockets = ref<Date | null>(null);
  const lastFetchStarlink = ref<Date | null>(null);
  const lastFetchUpcomingLaunches = ref<Date | null>(null);

  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Computed para verificar si cada tipo de dato está obsoleto
  const isLaunchesOutdated = computed(() => {
    if (!lastFetchLaunches.value) return true;
    return Date.now() - lastFetchLaunches.value.getTime() > CACHE_DURATION;
  });

  const isRocketsOutdated = computed(() => {
    if (!lastFetchRockets.value) return true;
    return Date.now() - lastFetchRockets.value.getTime() > CACHE_DURATION;
  });

  const isStarlinkOutdated = computed(() => {
    if (!lastFetchStarlink.value) return true;
    return Date.now() - lastFetchStarlink.value.getTime() > CACHE_DURATION;
  });

  const isUpcomingLaunchesOutdated = computed(() => {
    if (!lastFetchUpcomingLaunches.value) return true;
    return (
      Date.now() - lastFetchUpcomingLaunches.value.getTime() > CACHE_DURATION
    );
  });

  // Funtion to fetch the data
  const fetchAllData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // make calls in parallel
      const [launchesData, rocketsData, starlinkData, upcomingData] =
        await Promise.all([
          getLaunches(),
          getRockets(),
          getStarlink(),
          getUpcomingLaunches(),
        ]);
      launches.value = launchesData;
      rockets.value = rocketsData;
      starlink.value = starlinkData;
      upcomingLaunches.value = upcomingData;
      lastFetchLaunches.value = new Date();
      lastFetchRockets.value = new Date();
      lastFetchStarlink.value = new Date();
      lastFetchUpcomingLaunches.value = new Date();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "An unknown error occurred";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchRockets = async () => {
    if (!isRocketsOutdated.value && rockets.value.length > 0) {
      return rockets.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await getRockets();
      rockets.value = data;
      lastFetchRockets.value = new Date();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Error fetching rockets";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchLaunches = async () => {
    if (!isLaunchesOutdated.value && launches.value.length > 0) {
      return launches.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await getLaunches();
      launches.value = data;
      lastFetchLaunches.value = new Date();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Error fetching launches";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchStarlink = async () => {
    if (!isStarlinkOutdated.value && starlink.value.length > 0) {
      return starlink.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await getStarlink();
      starlink.value = data;
      lastFetchStarlink.value = new Date();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Error fetching starlink";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUpcomingLaunches = async () => {
    if (
      !isUpcomingLaunchesOutdated.value &&
      upcomingLaunches.value.length > 0
    ) {
      return upcomingLaunches.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await getUpcomingLaunches();
      upcomingLaunches.value = data;
      lastFetchUpcomingLaunches.value = new Date();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Error fetching upcoming launches";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearCache = () => {
    launches.value = [];
    rockets.value = [];
    starlink.value = [];
    upcomingLaunches.value = [];
    lastFetchLaunches.value = null;
    lastFetchRockets.value = null;
    lastFetchStarlink.value = null;
    lastFetchUpcomingLaunches.value = null;
    error.value = null;
    isLoading.value = false;
  };

  // Función helper para cargar datos específicos según la vista
  const fetchForView = async (
    viewType: "dashboard" | "launches-rockets" | "starlink"
  ) => {
    switch (viewType) {
      case "dashboard":
        return Promise.all([
          fetchLaunches(),
          fetchRockets(),
          fetchStarlink(),
          fetchUpcomingLaunches(),
        ]);
      case "launches-rockets":
        return Promise.all([fetchLaunches(), fetchRockets()]);
      case "starlink":
        return fetchStarlink();
      default:
        return Promise.resolve();
    }
  };

  return {
    // state
    launches,
    rockets,
    starlink,
    upcomingLaunches,
    isLoading,
    error,
    lastFetchLaunches,
    lastFetchRockets,
    lastFetchStarlink,
    lastFetchUpcomingLaunches,

    // computed
    isLaunchesOutdated,
    isRocketsOutdated,
    isStarlinkOutdated,
    isUpcomingLaunchesOutdated,

    // actions
    fetchAllData,
    fetchRockets,
    fetchLaunches,
    fetchStarlink,
    fetchUpcomingLaunches,
    fetchForView,
    clearCache,
  };
});
