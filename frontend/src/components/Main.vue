<template>
  <div class="content layout-column layout-stretch-start layout-padding">
    <div class="header layout-row layout-start-between layout-padding flex-none">
      <div class="menu-button flex-none">
        <md-button class="md-icon-button">
          <md-icon>menu</md-icon>
        </md-button>
      </div>
      <div class="user-info flex-none">
        <md-menu md-direction="bottom-end">
          <md-button md-menu-trigger class="md-raised">
            {{(user && user.displayName) || ''}}
            <profile-pic class="profile-pic" :src="(user && user.logo) || ''"></profile-pic>
          </md-button>
          <md-menu-content>
            <md-menu-item>Log out</md-menu-item>
            <md-menu-item>Create meme</md-menu-item>
            <md-menu-item>Log out everywhere</md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
    </div>
    <div class="layout-column layout-stretch-start layout-padding item-list flex-100">
      <virtual-list :size="111" :remain="15">
        <transition-group name="moderation-queue">
          <queue-item class="moderation-queue-item" :item-info="item" :status="status" v-for="item in state.state.moderationQueue" :key="item.id" @moderate="moderate">
          </queue-item>
        </transition-group>
      </virtual-list>
    </div>
  </div>
</template>

<script src="./main.js">
</script>

<style scoped>
.content {
  width: 70%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
}

.profile-pic {
  height: 36px;
  padding-left: 8px;
  margin-right: -8px;
}

.header {
  background-color: rgba(0,0,0,0.9);
}

.item-list {
  overflow-y: auto;
}

.moderation-queue-item {
  transition: all 1s;
  height: 111px;
  overflow-y: hidden;
}

.moderation-queue-enter, .moderation-queue-leave-to {
  opacity: 0;
}

.moderation-queue-leave-to {
  height: 0px;
  margin-bottom: 0;
}

.moderation-queue-leave-active {
  /* position: absolute;*/
}
</style>
