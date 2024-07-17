import axios from "axios";
import { ref } from "vue";

export function useWeatherBlocks() {
  const weatherBlocks = ref([]);
  const error = ref("");
  const city = ref("");
  const blockToDelete = ref(null);
  const showModal = ref(false);
  const openWeatherAPIKey = "47c2da305e4ed0b3ce57e7376f31b9c7";
  const openCageAPIKey = "ddb9bb2cf22d47fb8dda8710e2d9e1ce";

  const addWeatherBlock = async (city) => {
    try {
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${openWeatherAPIKey}`
      );

      if (geoResponse.data.length === 0) {
        throw new Error("City not found");
      }

      const { lat, lon } = geoResponse.data[0];

      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${openWeatherAPIKey}`
      );

      const newBlock = {
        city: city,
        error: "",
        info: weatherResponse.data,
        currentDayOrWeek: "day",
        dayNight: "day",
      };

      weatherBlocks.value.push(newBlock);
      return newBlock;
    } catch (err) {
      console.error("Error adding weather block:", err);
      throw err;
    }
  };

  const deleteWeatherBlock = () => {
    const index = weatherBlocks.value.findIndex(
      (block) => block.city === blockToDelete.value.city
    );
    if (index !== -1) {
      weatherBlocks.value.splice(index, 1);
      closeModal();
      enableScroll();
    }
  };

  const requestGeolocationPermission = async () => {
    try {
      await navigator.permissions.query({ name: "geolocation" });
      return true;
    } catch (error) {
      return false;
    }
  };

  const getCurrentLocationWeather = async () => {
    if (navigator.geolocation) {
      const permissionGranted = await requestGeolocationPermission();
      if (!permissionGranted) {
        error.value = "Geolocation permission denied.";
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const geoResponse = await axios.get(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}%2C${longitude}&key=${openCageAPIKey}`
            );

            const cityName =
              geoResponse.data.results[0].components.city ||
              geoResponse.data.results[0].components.town ||
              geoResponse.data.results[0].components.village;

            city.value = ""; // Reset city value

            const weatherResponse = await axios.get(
              `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&units=metric&appid=${openWeatherAPIKey}`
            );

            weatherBlocks.value.push({
              city: cityName,
              error: "",
              info: weatherResponse.data,
              dayNight: "day",
              currentDayOrWeek: "day",
            });
          } catch (err) {
            error.value = "Error fetching weather data for current location";
            console.error(err);
          }
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            error.value = "Geolocation permission denied.";
          } else {
            error.value = "Error fetching geolocation.";
          }
          console.error(err);
        }
      );
    } else {
      error.value = "Geolocation is not supported by this browser.";
    }
  };

  const closeModal = () => {
    blockToDelete.value = null;
    showModal.value = false;
    enableScroll();
  };

  const enableScroll = () => {
    document.body.style.overflow = "";
  };

  return {
    weatherBlocks,
    addWeatherBlock,
    deleteWeatherBlock,
    getCurrentLocationWeather,
    error,
    blockToDelete,
    showModal,
    closeModal,
    enableScroll,
  };
}
