<template>
  <span class="chat-line">
    <span v-for="token in tokens" :is="token.type" :data="token.data" :type="token.type"></span>
  </span>
</template>

<script src="./chatline.js">
</script>

<style scoped>

</style>
