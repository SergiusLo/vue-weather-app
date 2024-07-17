<template>
  <div v-if="favoriteBlocks.length === 0">
    <p>{{ $t("noFavorites") }}</p>
  </div>
  <div v-for="(block, index) in favoriteBlocks" :key="index">
    <div class="card" :class="{ favorite: isFavorite(block) }">
      <div class="card__inner">
        <h2 class="title">{{ $t("todaysWeather") }} - {{ block.city }}</h2>
        <div class="card__btns">
          <button class="button" @click="toggleFavorite(block)">
            {{
              isFavorite(block)
                ? $t("removeFromFavorites")
                : $t("addToFavorites")
            }}
          </button>
          <button class="button" @click="toggleDayNightFavorite(index)">
            {{
              block.dayNight === "day" ? $t("changeToNight") : $t("changeToDay")
            }}
          </button>
          <button class="button" @click="toggleDayOrWeek(index)">
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
                :daily-data="block.info.daily.slice(0, 7)"
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
                {{ block.dayNight === "day" ? day.temp.day : day.temp.night }}°C
              </p>
            </div>
          </div>
          <p class="error">{{ block.error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from "vue-i18n";
import WeatherChart from "./WeatherChart.vue";
import WeeklyWeatherChart from "./WeeklyWeatherChart.vue";

export default {
  props: {
    favoriteBlocks: {
      type: Array,
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
    toggleDayNightFavorite: {
      type: Function,
      required: true,
    },
    toggleDayOrWeek: {
      type: Function,
      required: true,
    },
  },
  components: {
    WeatherChart,
    WeeklyWeatherChart,
  },
  setup(props) {
    const { t } = useI18n();

    const handleToggleFavorite = (block) => {
      props.toggleFavorite(block);
    };

    const handleToggleDayNightFavorite = (index) => {
      props.toggleDayNightFavorite(index);
    };

    const handleToggleDayOrWeek = (index) => {
      props.toggleDayOrWeek(index);
    };

    return {
      t,
      handleToggleFavorite,
      handleToggleDayNightFavorite,
      handleToggleDayOrWeek,
    };
  },
};
</script>

<style scoped>
.card {
  height: auto;
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

.card__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  flex-direction: column;
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
.weather__delete-btn {
  margin: 10px 0;
}
.hourly-weather {
  display: flex;
  padding: 10px;
}

.hourly-weather__item {
  flex: 0 0 auto;
  width: 80px;
  text-align: center;
  border: 1px solid #ddd;
  padding: 10px;
  margin-right: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.card__btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.five-day__items {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.error {
  color: red;
}
</style>
