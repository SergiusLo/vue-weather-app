<template>
  <div class="tabs">
    <button
      class="button"
      @click="setTab('search')"
      :class="{ active: currentTab === 'search' }"
    >
      {{ $t("search") }}
    </button>
    <button
      class="button"
      @click="setTab('favorites')"
      :class="{ active: currentTab === 'favorites' }"
    >
      {{ $t("favorites") }}
    </button>
  </div>
</template>

<script>
import { useI18n } from "vue-i18n";

export default {
  props: {
    currentTab: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const { t } = useI18n();

    const setTab = (tab) => {
      emit("update:currentTab", tab);
    };

    return {
      setTab,
      t,
    };
  },
};
</script>

<style scoped>
.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.tabs button {
  margin: 0 5px;
}

.tabs .active {
  font-weight: bold;
  text-decoration: underline;
}
</style>
