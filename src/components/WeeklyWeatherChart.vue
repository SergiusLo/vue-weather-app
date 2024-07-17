<template>
  <canvas ref="weatherChartCanvas"></canvas>
</template>

<script>
import { Chart } from "chart.js/auto";
import { onMounted, ref, watch } from "vue";

export default {
  props: {
    dailyData: {
      type: Array,
      required: true,
    },
    dayNight: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const weatherChartCanvas = ref(null);
    let chartInstance = null;

    const createChart = () => {
      const ctx = weatherChartCanvas.value.getContext("2d");

      if (chartInstance) {
        chartInstance.destroy();
      }

      const labels = props.dailyData.map((day) =>
        new Date(day.dt * 1000).toDateString()
      );
      const data =
        props.dayNight === "day"
          ? props.dailyData.map((day) => day.temp.day)
          : props.dailyData.map((day) => day.temp.night);

      chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Temperature (°C)",
              data: data,
              backgroundColor: "rgba(102, 112, 128, 0.4)",
              borderColor: "rgba(51, 6, 33, 1)",
              borderWidth: 1,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 7,
              pointBackgroundColor: "rgba(51, 6, 33, 0.6)",
              pointBorderColor: "rgba(51, 6, 33, 1)",
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Days",
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Temperature (°C)",
              },
            },
          },
          layout: {
            padding: {
              left: 10,
              right: 10,
              top: 10,
              bottom: 10,
            },
          },
        },
      });
    };

    onMounted(createChart);

    watch(
      () => [props.dailyData, props.dayNight],
      () => {
        if (chartInstance) {
          chartInstance.data.labels = props.dailyData.map((day) =>
            new Date(day.dt * 1000).toDateString()
          );
          chartInstance.data.datasets[0].data =
            props.dayNight === "day"
              ? props.dailyData.map((day) => day.temp.day)
              : props.dailyData.map((day) => day.temp.night);
          chartInstance.update();
        } else {
          createChart();
        }
      }
    );

    return {
      weatherChartCanvas,
    };
  },
};
</script>

<style scoped>
canvas {
  max-width: 100%;
  min-height: 300px;
}
</style>
