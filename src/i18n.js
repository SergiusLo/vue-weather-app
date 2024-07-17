import { createI18n } from 'vue-i18n';

// Переводы
const messages = {
  en: {
    weatherApp: 'Weather App',
    search: 'Search',
    favorites: 'Favorites',
    addToFavorites: 'Add to favorites',
    removeFromFavorites: 'Remove from favorites',
    changeToNight: 'Change to Night',
    changeToDay: 'Change to Day',
    dayWeek: 'Day/Week',
    hourlyWeatherToday: 'Hourly Weather Today',
    temperature: 'Temperature',
    feelsLike: 'Feels Like',
    weather: 'Weather',
    maxFavorites: 'You can add a maximum of 5 favorite cities.',
    areYouSure: 'Are you sure you want to delete the weather block for',
    delete: 'Delete',
    cancel: 'Cancel',
    noFavorites: 'No favorite cities added yet.',
    todaysWeather: "Today's Weather",
    weeklyForecast: 'Weather Forecast for 5 Days',
    enterCityName: 'Enter city name',
    sorryError: 'Sorry, something went wrong, please try again.',
    deleteBlock: 'Delete weather block',
  },
  uk: {
    weatherApp: 'Прогноз Погоди',
    search: 'Пошук',
    favorites: 'Обрані',
    addToFavorites: 'Додати до обраного',
    removeFromFavorites: 'Видалити з обраного',
    changeToNight: 'Змінити на ніч',
    changeToDay: 'Змінити на день',
    dayWeek: 'День/Тиждень',
    hourlyWeatherToday: 'Погодинний прогноз на сьогодні',
    temperature: 'Температура',
    feelsLike: 'Відчувається як',
    weather: 'Погода',
    maxFavorites: 'Ви можете додати максимум 5 обраних міст.',
    areYouSure: 'Ви впевнені, що хочете видалити блок погоди для',
    delete: 'Видалити',
    cancel: 'Скасувати',
    noFavorites: 'Ще не додано обраних міст.',
    todaysWeather: 'Сьогоднішня погода',
    weeklyForecast: 'Прогноз погоди на 5 днів',
    enterCityName: 'Введіть назву міста',
    sorryError: 'Вибачте, щось пішло не так, спробуйте ще раз.',
    deleteBlock: 'Видалити блок погоди',
  },
};


const i18n = createI18n({
   legacy: false,
  locale: 'en', 
  messages,
});

export default i18n;
