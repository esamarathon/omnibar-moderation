<template>
  <div class="content layout-column layout-center-center">
    <md-card>
      <md-card-media>
        <img src="../assets/esa-logo.png" alt="ESA">
      </md-card-media>
      <md-card-header>
        <div class="md-title">ESA omnibar moderation</div>
      </md-card-header>
      <md-card-content class="layout-row layout-center-center">
        <md-button class="twitch-login" @click="login">
          Log in with twitch
        </md-button>
      </md-card-content>
    </md-card>
  </div>
</template>

<script src="./login.js">
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.twitch-login {
  background-color: #6441a5;
  color: white;
  border-radius: 5px;
}
</style>
