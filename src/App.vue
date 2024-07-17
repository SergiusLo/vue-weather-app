<template>
  <div class="wrapper">
    <LanguageSwitcher />
    <h1 class="title">{{ $t("weatherApp") }}</h1>
    <Tabs :currentTab="currentTab" @update:currentTab="setCurrentTab" />

    <div
      class="modal"
      v-if="showExceedLimitModal"
      @click="showExceedLimitModal = false"
    >
      <div class="modal__content" @click.stop>
        <p>{{ $t("maxFavorites") }}</p>
        <button @click="showExceedLimitModal = false">OK</button>
      </div>
    </div>

    <div class="modal" v-if="showModal" @click="cancelDelete">
      <div class="modal__content" @click.stop>
        <p>{{ $t("areYouSure") }} {{ blockToDelete.city }}?</p>
        <button @click="deleteWeatherBlock">{{ $t("delete") }}</button>
        <button @click="cancelDelete">{{ $t("cancel") }}</button>
      </div>
    </div>

    <div v-if="currentTab === 'favorites'">
      <FavoriteBlock
        :favoriteBlocks="favoriteBlocks"
        :isFavorite="isFavorite"
        :toggleFavorite="toggleFavorite"
        :toggleDayNightFavorite="toggleDayNightFavorite"
        :toggleDayOrWeek="toggleDayOrWeek"
      />
    </div>
    <div v-if="currentTab === 'search'">
      <WeatherSearch
        :weather-blocks="weatherBlocks"
        :favorite-limit-reached="favoriteLimitReached"
        :is-favorite="isFavorite"
        :toggle-favorite="toggleFavorite"
        :toggle-day-night="toggleDayNight"
        :toggle-day-or-week-main-block="toggleDayOrWeekMainBlock"
        :open-modal="openModal"
        @add-weather-block="handleAddWeatherBlock"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { onMounted, ref } from "vue";
import WeatherChart from "./components/WeatherChart.vue";

import { useI18n } from "vue-i18n";
import FavoriteBlock from "./components/FavoriteBlock.vue";
import LanguageSwitcher from "./components/LanguageSwitcher.vue";
import Tabs from "./components/Tabs.vue";
import WeatherSearch from "./components/WeatherSearch.vue";
import WeeklyWeatherChart from "./components/WeeklyWeatherChart.vue";
import { useWeatherBlocks } from "./hooks/useWeatherBlocks.js";

export default {
  components: {
    LanguageSwitcher,
    WeatherChart,
    WeeklyWeatherChart,
    Tabs,
    FavoriteBlock,
    WeatherSearch,
  },
  setup() {
    const { t } = useI18n();
    const { locale } = useI18n();
    const city = ref("");
    const error = ref("");
    const mapboxSearchResults = ref([]);
    const searchError = ref(false);
    let queryTimeout = null;

    const mapboxAPIKey = "pk.eyJ1Ijoiam9obmtvbWFybmlja2kiLCJhIjoiY2t5NjFzODZvMHJkaDJ1bWx6OGVieGxreSJ9.IpojdT3U3NENknF6_WhR2Q"
    const favoriteBlocks = ref([]);
    const currentTab = ref("search");
    const currentDayOrWeek = ref("day");
    const showExceedLimitModal = ref(false);
    const favoriteLimitReached = ref(false);

    const {
      weatherBlocks,
      addWeatherBlock,
      deleteWeatherBlock,
      getCurrentLocationWeather,
      blockToDelete,
      showModal,
      closeModal,
      enableScroll,
    } = useWeatherBlocks();

    const setCurrentTab = (tab) => {
      currentTab.value = tab;
    };

    const handleAddWeatherBlock = (newBlock) => {
      weatherBlocks.value.push(newBlock);
    };

    const getSearchResults = () => {
      clearTimeout(queryTimeout);
      queryTimeout = setTimeout(async () => {
        if (city.value.trim().length >= 2) {
          try {
            const response = await axios.get(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                city.value
              )}.json?access_token=${mapboxAPIKey}&types=place`
            );
            mapboxSearchResults.value = response.data.features;
            searchError.value = false;
          } catch (error) {
            console.error(error);
            searchError.value = true;
          }
        } else {
          mapboxSearchResults.value = [];
          searchError.value = false;
        }
      }, 300);
    };

    const previewCity = (searchResult) => {
      city.value = searchResult.place_name;
      mapboxSearchResults.value = [];
    };

    const openModal = (block) => {
      blockToDelete.value = block;
      showModal.value = true;
      disableScroll();
    };

    const cancelDelete = () => {
      closeModal();
      enableScroll();
    };

    const disableScroll = () => {
      document.body.style.overflow = "hidden";
    };

    const loadWeatherForCurrentLocation = async () => {
      try {
        await getCurrentLocationWeather(city.value); // Pass city as a parameter
      } catch (err) {
        error.value = err.message;
      }
    };

    const addFavorite = (block) => {
      if (favoriteBlocks.value.length >= 5) {
        showExceedLimitModal.value = true;
        return;
      }

      if (!favoriteBlocks.value.some((fav) => fav.city === block.city)) {
        favoriteBlocks.value.push({
          ...block,
        });
        saveFavorites();
      }
    };

    const removeFavorite = (block) => {
      const index = favoriteBlocks.value.findIndex(
        (fav) => fav.city === block.city
      );
      if (index !== -1) {
        favoriteBlocks.value.splice(index, 1);
        saveFavorites();
      }
    };

    const loadFavorites = () => {
      const favorites = JSON.parse(localStorage.getItem("favorites"));
      if (favorites) {
        favoriteBlocks.value = favorites.map((favorite) => ({
          ...favorite,
          currentDayOrWeek: "day",
          dayNight: "day",
        }));
      }
    };
    const saveFavorites = () => {
      localStorage.setItem("favorites", JSON.stringify(favoriteBlocks.value));
    };

    const setTab = (tab) => {
      currentTab.value = tab;
    };

    const isFavorite = (block) => {
      return favoriteBlocks.value.some((fav) => fav.city === block.city);
    };

    const toggleFavorite = (block) => {
      if (isFavorite(block)) {
        removeFavorite(block);
      } else {
        addFavorite(block);
      }
    };
    const toggleDayOrWeek = (index) => {
      favoriteBlocks.value[index].currentDayOrWeek =
        favoriteBlocks.value[index].currentDayOrWeek === "day" ? "week" : "day";
    };

    const toggleDayOrWeekMainBlock = (index) => {
      weatherBlocks.value[index].currentDayOrWeek =
        weatherBlocks.value[index].currentDayOrWeek === "day" ? "week" : "day";
    };

    const toggleDayNight = (index) => {
      weatherBlocks.value[index].dayNight =
        weatherBlocks.value[index].dayNight === "day" ? "night" : "day";
    };

    const toggleDayNightFavorite = (index) => {
      favoriteBlocks.value[index].dayNight =
        favoriteBlocks.value[index].dayNight === "day" ? "night" : "day";
    };
    const changeLanguage = (lang) => {
      locale.value = lang;
    };

    onMounted(() => {
      loadFavorites();
      getCurrentLocationWeather();
    });
    return {
      t,
      city,
      error,
      mapboxSearchResults,
      searchError,
      weatherBlocks,
      addWeatherBlock,
      toggleDayOrWeekMainBlock,
      toggleDayNightFavorite,
      toggleDayNight,
      getSearchResults,
      changeLanguage,
      previewCity,
      deleteWeatherBlock,
      blockToDelete,
      showModal,
      openModal,
      closeModal,
      cancelDelete,
      disableScroll,
      enableScroll,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      favoriteBlocks,
      saveFavorites,
      isFavorite,
      setTab,
      favoriteLimitReached,
      currentTab,
      currentDayOrWeek,
      toggleDayOrWeek,
      showExceedLimitModal,
      setCurrentTab,
      handleAddWeatherBlock,
      loadWeatherForCurrentLocation,
    };
  },
};
</script>
<style scoped>
.error {
  color: #d03939;
}
.language-switcher {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.wrapper {
  max-width: 1180px;
  height: 100vh;
  margin: 0 auto;
  padding: 10px;
  text-align: center;
  color: #fff;
}

.wrapper h1 {
  margin-top: 50px;
}

.wrapper p {
  margin-top: 20px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow: hidden;
}

.modal__content {
  font-size: 20px;
  background-color: #1f0f24;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

.modal__content p {
  margin-bottom: 15px;
}

.modal__content button {
  background-color: #e3bc4b;
  color: #fff;
  border-radius: 10px;
  border: 2px solid #b99935;
  padding: 10px 15px;
  margin-right: 10px;
  cursor: pointer;
}

.modal__content button:hover {
  background-color: #b99935;
}

@media (max-width: 768px) {
}
</style>
