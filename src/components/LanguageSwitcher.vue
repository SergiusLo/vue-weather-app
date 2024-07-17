<template>
  <div class="language-switcher">
    <button class="button" @click="changeLanguage('en')">EN</button>
    <button class="button" @click="changeLanguage('uk')">UK</button>
  </div>
</template>

<script>
import { useI18n } from "vue-i18n";

export default {
  setup() {
    const { locale } = useI18n();

    const changeLanguage = (lang) => {
      locale.value = lang;
    };

    return {
      changeLanguage,
    };
  },
};
</script>

<style scoped>
.language-switcher {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
