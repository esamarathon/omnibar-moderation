<template>
  <div class="content layout-column layout-stretch-start layout-padding">
    <div class="header layout-row layout-start-between layout-padding flex-none">
      <div class="menu-button flex-none">
        <md-menu md-direction="bottom-end">
          <md-button md-menu-trigger class="md-icon-button">
            <md-icon>menu</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item @click="logout()">Log out</md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
      <div class="user-info flex-none">
        {{(user && user.displayName) || ''}}
        <profile-pic class="profile-pic" :src="(user && user.logo) || ''"></profile-pic>
      </div>
    </div>
    <div class="layout-column layout-stretch-start item-list flex-100">
      <div class="error-popup" v-if="connectionError"><md-icon>warning</md-icon> {{connectionError}}</div>
      <div class="layout-padding" :class="{blur: connectionError}">
        <transition-group name="moderation-queue">
          <queue-item class="moderation-queue-item" :item-info="item" :status="status" @moderate="moderate" v-for="item in state.state.moderationQueue" :key="item.id">
          </queue-item>
        </transition-group>
        <div v-if="state.state.moderationQueue.length === 0" class="layout-row layout-center-center"><span class="flex-none no-items-found">No items found.</span></div>
      </div>
    </div>
  </div>
</template>

<script src="./main.js">
</script>

<style scoped lang="scss">
$break-small: 1000px;

.error-popup {
  background-color: darkred;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px;
  border-radius: 4px;
  font-size: 1.5em;
  z-index: 200;
}

.blur {
  filter: blur(4px);
  pointer-events: none;
}

.content {
  width: 70%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);

  @media screen and (max-width: $break-small) {
    width: 100%;
  }
}

.user-info {
  background-color: #555;
  border-radius: 5px 0 0 5px;
  padding-left: 8px;
  height: 36px;

  .profile-pic {
    height: 36px;
    width: 36px;
    margin-left: 8px;
    margin-right: 0;
  }
}

.header {
  background-color: rgba(0,0,0,0.9);
}

.item-list {
  overflow-y: auto;
  position: relative;
}

.moderation-queue-item {
  transition: all 1s;
  overflow-y: hidden;
}

.moderation-queue-enter, .moderation-queue-leave-to {
  opacity: 0;
}

.moderation-queue-leave-to {
  height: 0px;
  min-height: 0;
  margin-bottom: 0;
}

.no-items-found {
  font-size: 20px;
}
</style>
