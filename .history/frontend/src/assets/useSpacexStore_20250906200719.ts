import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getLaunches, getRockets, getStarlink } from "../api";

export const useSpacexStore = defineStore("spacex", () => {
  // state
  const launches = ref<any[]>([]);
  const rockets = ref<any[]>([]);
  const starlink = ref<any[]>([]);

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const lastFetch = ref<Date | null>(null);

  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Computation to verify if the data is outdated
  const isDataOutdated = computed(() => {
    if (!lastFetch.value) return true;
    return Date.now() - lastFetch.value.getTime() > CACHE_DURATION;
  });

  // Funtion to fetch the data
  const fetchAllData = async () => {
    // if fata is not outdated, it does not fetch the data
    if (
      !isDataOutdated.value &&
      launches.value.length > 0 &&
      rockets.value.length > 0 &&
      starlink.value.length > 0
    ) {
      return {
        launches: launches.value,
        rockets: rockets.value,
        starlink: starlink.value,
      };
    }
    try {
      // make calls in parallel
      const [launchesData, rocketsData, starlinkData] = await Promise.all([
        getLaunches(),
        getRockets(),
        getStarlink(),
      ]);
      launches.value = launchesData;
      rockets.value = rocketsData;
      starlink.value = starlinkData;
      lastFetch.value = new Date();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "An unknown error occurred";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchRockets = async () => {};
});
