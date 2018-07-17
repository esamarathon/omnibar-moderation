<template>
  <div class="queue-item layout-column layout-stretch-start flex-none">
    <div class="item-info layout-row layout-stretch-between flex-none">
      <div class="flex-none layout-row">
        <div class="item-type layout-row layout-center-center" :class="['item-type-'+itemInfo.type]">
          <span class="flex-none">{{itemInfo.type}}</span>
        </div>
        <div class="item-channel flex-none layout-row layout-center-center">
          <span class="flex-none"><a :href="'https://twitch.tv/'+itemInfo.channel.name">twitch.tv/{{itemInfo.channel.name}}</a></span>
        </div>
      </div>
      <div class="pushing-error flex-none layout-row layout-center-center" v-if="itemInfo.error">
        <md-icon>error</md-icon> Event could not be pushed: {{itemInfo.error}}
      </div>
      <div class="decisions flex-none layout-row layout-center-center">
        <div class="flex-none">
          <div class="decision" :class="['decision-'+decision.action]" v-for="decision in sortedDecisions" :key="decision.user.id">
            <profile-pic :user="{id: decision.user.id}"></profile-pic>
            <md-tooltip md-direction="bottom">{{decision.user.displayName}} voted {{decision.action}}</md-tooltip>
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
        <span class="flex-none">
          <chat-line :line="itemInfo.message"></chat-line>
        </span>
      </div>
      <div class="actionbuttons layout-row layout-center-center flex-none">
        <md-button class="md-icon-button" @click="moderate('approve')">
          <md-icon>done</md-icon>
          <md-tooltip md-direction="bottom">Approve</md-tooltip>
        </md-button>
        <md-button class="md-icon-button" @click="moderate('deny')">
          <md-icon>close</md-icon>
          <md-tooltip md-direction="bottom">Deny</md-tooltip>
        </md-button>
        <md-button class="md-icon-button" @click="moderate('veto')" v-if="status.admin">
          <md-icon>delete</md-icon>
          <md-tooltip md-direction="bottom">Veto</md-tooltip>
        </md-button>
        <md-button class="md-icon-button" @click="moderate('force')" v-if="status.admin">
          <md-icon>done_all</md-icon>
          <md-tooltip md-direction="bottom">Force</md-tooltip>
        </md-button>
      </div>
    </div>
  </div>
</template>

<script src="./queueItem.js">
</script>

<style lang="scss">
</style>
