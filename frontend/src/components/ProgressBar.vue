<template>
  <div class="outer-progress">
    <div class="inner-progress" v-progress-update="{finishes, duration}"></div>
  </div>
</template>

<style scoped>
.outer-progress {
  height: 5px;
  background-color: #cccccc;
}
.inner-progress {
  height: 100%;
  width: 50%;
  background-color: #239aff;
}
</style>

<script src="./progressbar.js">
</script>
