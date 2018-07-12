<template>
  <div class="queue-item layout-column layout-stretch-start flex-none">
    <div class="item-info layout-row layout-stretch-between">
      <div class="item-type flex-none layout-row layout-center-center" :class="['item-type-'+itemInfo.type]">
        <span class="flex-none">{{itemInfo.type}}</span>
      </div>
      <div class="decisions flex-none layout-row layout-center-center">
        <div class="flex-none">
          <div class="decision" :class="['decision-'+decision.action]" v-for="decision in sortedDecisions" :key="decision.user">
            <profile-pic :user="{name: decision.user}"></profile-pic>
          </div>
        </div>
      </div>
    </div>
    <progress-bar :duration="itemInfo.duration" :finishes="itemInfo.expires"></progress-bar>
    <div class="item-content layout-row layout-stretch-start layout-padding flex-none">
      <div class="user flex-none">
        <md-avatar>
          <profile-pic :user="itemInfo.user"></profile-pic>
        </md-avatar>
        {{itemInfo.user.displayName}}
      </div>
      <div class="message layout-row layout-center-start flex-100">
        <span class="flex-none">{{itemInfo.message.message}}</span>
      </div>
      <div class="actionbuttons layout-row layout-center-center flex-none">
        <md-button class="md-icon-button"><md-icon>done</md-icon></md-button>
        <md-button class="md-icon-button"><md-icon>close</md-icon></md-button>
      </div>
    </div>
  </div>
</template>

<script src="./queueItem.js">
</script>

<style lang="scss" scoped>
.queue-item {
  background-color: rgba(255,255,255,0.2);
  margin-bottom: 8px;
}

.item-info {
  height: 50px;
}

.item-type {
  height: 100%;
  vertical-align: middle;
  padding: 0 8px;
  min-width: 75px;
  font-size: larger;

  &-sub {
    background-color: orange;
  }
  &-cheer {
    background-color: darkcyan;
  }
  &-test {
    background-color: #222;
  }
}

.user {
  font-size: large;
  margin-right: 18px;
  min-width: 200px;
}

.decision {
  display: inline-block;
  margin-left: -20px;

  img {
    height: 40px;
    width: 40px;
    border-radius: 50%;
    max-width: none;
  }

  &-accept img {
    box-shadow: 0 0 10px green, 0 0 10px green, 0 0 10px green;
  }

  &-deny img {
    box-shadow: 0 0 10px darkred, 0 0 10px darkred, 0 0 10px darkred;
  }
}
</style>
