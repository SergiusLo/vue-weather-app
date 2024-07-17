<template>
  <div>
    <div class="search">
      <input
        class="input"
        type="text"
        v-model="city"
        @input="getSearchResults"
        :placeholder="$t('enterCityName')"
      />
      <div class="error" v-if="favoriteLimitReached">
        {{ $t("maxFavorites") }}
      </div>
      <ul class="search__items-list" v-if="mapboxSearchResults.length">
        <p v-if="searchError">
          {{ $t("sorryError") }}
        </p>
        <template v-else>
          <li
            v-for="searchResult in mapboxSearchResults"
            :key="searchResult.id"
            class="search__item-list"
            @click="previewCity(searchResult)"
          >
            {{ searchResult.place_name }}
          </li>
        </template>
      </ul>

      <button class="button" v-if="city !== ''" @click="addWeatherBlock()">
        +
      </button>
      <button class="button" disabled v-else>{{ $t("enterCityName") }}</button>
      <div class="error">{{ error }}</div>
    </div>

    <div class="weather">
      <div v-for="(block, index) in weatherBlocks" :key="index">
        <div class="card" :class="{ favorite: isFavorite(block) }">
          <div class="card__inner">
            <h2 class="title">{{ $t("todaysWeather") }} - {{ block.city }}</h2>
            <div class="card__btns">
              <button class="button" @click="openModal(block)">
                {{ $t("deleteBlock") }}
              </button>
              <button class="button" @click="toggleFavorite(block)">
                {{
                  isFavorite(block)
                    ? $t("removeFromFavorites")
                    : $t("addToFavorites")
                }}
              </button>
              <button class="button" @click="toggleDayNight(index)">
                {{
                  block.dayNight === "day"
                    ? $t("changeToNight")
                    : $t("changeToDay")
                }}
              </button>
              <button class="button" @click="toggleDayOrWeekMainBlock(index)">
                {{ $t("dayWeek") }}
              </button>
            </div>
            <div v-if="block.info">
              <div v-if="block.currentDayOrWeek === 'day'">
                <div class="card__inner">
                  <img
                    class="weather__icon"
                    :src="`https://openweathermap.org/img/wn/${
                      block.dayNight === 'day'
                        ? block.info.current.weather[0].icon
                        : block.info.daily[0].weather[0].icon
                    }.png`"
                    :alt="
                      block.dayNight === 'day'
                        ? block.info.current.weather[0].description
                        : block.info.daily[0].weather[0].description
                    "
                  />
                  <p>
                    {{ $t("temperature") }}:
                    {{
                      block.dayNight === "day"
                        ? block.info.current.temp
                        : block.info.daily[0].temp.night
                    }}°C
                  </p>
                  <p>
                    {{ $t("feelsLike") }}:
                    {{
                      block.dayNight === "day"
                        ? block.info.current.feels_like
                        : block.info.daily[0].feels_like.night
                    }}°C
                  </p>
                  <p>
                    {{ $t("weather") }}:
                    {{
                      block.dayNight === "day"
                        ? block.info.current.weather[0].description
                        : block.info.daily[0].weather[0].description
                    }}
                  </p>
                </div>
                <h2>{{ $t("hourlyWeatherToday") }}</h2>
                <div class="hourly-weather">
                  <WeatherChart :hourly-data="block.info.hourly.slice(0, 24)" />
                </div>
              </div>
            </div>
            <div v-if="block.currentDayOrWeek === 'week'">
              <div v-if="block.info">
                <h2>{{ $t("weeklyForecast") }}</h2>
                <div class="hourly-weather">
                  <WeeklyWeatherChart
                    :daily-data="block.info.daily.slice(0, 5)"
                    :dayNight="block.dayNight"
                  />
                </div>
                <div
                  v-for="(day, dayIndex) in block.info.daily.slice(0, 5)"
                  :key="dayIndex"
                  class="five-day__items"
                >
                  <p>{{ new Date(day.dt * 1000).toDateString() }}</p>
                  <img
                    class="weather__icon"
                    :src="`https://openweathermap.org/img/wn/${
                      block.dayNight === 'day'
                        ? day.weather[0].icon.replace('n', 'd')
                        : day.weather[0].icon.replace('d', 'n')
                    }.png`"
                    :alt="
                      block.dayNight === 'day'
                        ? day.weather[0].description
                        : day.weather[0].description
                    "
                  />
                  <p>
                    {{ $t("temperature") }}:
                    {{
                      block.dayNight === "day" ? day.temp.day : day.temp.night
                    }}°C
                  </p>
                </div>
              </div>
              <p class="error">{{ block.error }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import WeatherChart from "./WeatherChart.vue";
import WeeklyWeatherChart from "./WeeklyWeatherChart.vue";

export default {
  components: {
    WeatherChart,
    WeeklyWeatherChart,
  },
  props: {
    weatherBlocks: {
      type: Array,
      required: true,
    },
    favoriteLimitReached: {
      type: Boolean,
      required: true,
    },
    isFavorite: {
      type: Function,
      required: true,
    },
    toggleFavorite: {
      type: Function,
      required: true,
    },
    toggleDayNight: {
      type: Function,
      required: true,
    },
    toggleDayOrWeekMainBlock: {
      type: Function,
      required: true,
    },
    openModal: {
      type: Function,
      required: true,
    },
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const city = ref("");
    const error = ref("");
    const mapboxSearchResults = ref([]);
    const searchError = ref(false);
    const openWeatherAPIKey = "47c2da305e4ed0b3ce57e7376f31b9c7";
    const mapboxAPIKey = "pk.eyJ1Ijoiam9obmtvbWFybmlja2kiLCJhIjoiY2t5NjFzODZvMHJkaDJ1bWx6OGVieGxreSJ9.IpojdT3U3NENknF6_WhR2Q"


    const getSearchResults = async () => {
      if (city.value.length < 2) {
        mapboxSearchResults.value = [];
        return;
      }

      try {
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${city.value}.json?access_token=${mapboxAPIKey}&types=place`
        );
        mapboxSearchResults.value = response.data.features;
      } catch (err) {
        searchError.value = true;
      }
    };

    const previewCity = (searchResult) => {
      city.value = searchResult.place_name;
      mapboxSearchResults.value = [];
    };

    const addWeatherBlock = async () => {
      if (props.weatherBlocks.length >= 5) {
        error.value = "Max 5 weather blocks";
        return;
      }

      if (city.value.trim().length < 2) {
        error.value = "Please enter a city more than 1 letter long";
        return false;
      }

      error.value = "";

      if (
        props.weatherBlocks.some(
          (block) => block.city.toLowerCase() === city.value.toLowerCase()
        )
      ) {
        error.value = "This city is already added";
        return;
      }

      try {
        const geoResponse = await axios.get(
          `https://api.openweathermap.org/geo/1.0/direct?q=${city.value}&limit=1&appid=${openWeatherAPIKey}`
        );

        if (geoResponse.data.length === 0) {
          error.value = "City not found";
          return;
        }

        const { lat, lon } = geoResponse.data[0];

        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${openWeatherAPIKey}`
        );

        emit("add-weather-block", {
          city: city.value,
          error: "",
          info: weatherResponse.data,
          currentDayOrWeek: "day",
          dayNight: "day",
        });

        city.value = "";
      } catch (err) {
        error.value = "Error fetching weather data";
        console.error(err);
      }
    };

    return {
      t,
      city,
      error,
      mapboxSearchResults,
      searchError,
      getSearchResults,
      previewCity,
      addWeatherBlock,
    };
  },
};
</script>

<style scoped>
.search {
  position: relative;
}

.input {
  margin-top: 30px;
  background: transparent;
  border: 0;
  border-bottom: 2px solid #110813;
  color: #fcfcfc;
  font-size: 14px;
  padding: 5px 8px;
  outline: none;
}

.input:focus {
  border-bottom-color: #6e2d7d;
}

.search__items-list {
  list-style: none;
  position: absolute;
  background: #1f0f24;
  color: #fff;
  width: 100%;
  padding: 8px 4px;
  top: 66px;
  z-index: 20;
}

.search__item-list {
  cursor: pointer;
  padding: 4px 0;
}

.search__item-list:hover {
  background: #6e2d7d;
  color: #b99935;
}

.weather__icon {
  display: block;
  width: 100px;
  height: 100px;
  height: auto;
}

.weather {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 20px;
}

.card__btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  margin-top: 20px;
  margin-bottom: 30px;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.9);
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.card.favorite {
  box-shadow: 0 0 1rem rgba(120, 61, 214, 0.9);
}
.card__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  flex-direction: column;
}
.five-day__items {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
</style>
