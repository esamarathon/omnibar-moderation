<template>
  <div class="lightbox layout-row layout-wrap">
    <div class="lightbox-thumbnail-box flex-none" v-for="(mediaItem, index) in items" :key="index" @click="showDialog = true">
      <img :src="mediaItem.thumbnail" class="lightbox-thumbnail">
    </div>
    <md-dialog :md-active.sync="showDialog" class="rounded-dialog" :md-fullscreen="false">
      <div class="lightbox-tabs" v-if="showDialog">
        <div class="lightbox-scroller layout-row" :style="{left: `${-page*100}%`}">
          <div class="lightbox-tab flex-none" v-for="(mediaItem, index) in items" :style="{backgroundImage:`url(${mediaItem.img})`}" :key="index"></div>
        </div>
        <div class="lightbox-control left layout-column layout-start-center" :class="{disabled: page === 0}" @click="go(-1)"><div class="flex-none">&langle;</div></div>
        <div class="lightbox-control right layout-column layout-end-center" :class="{disabled: page === items.length - 1}" @click="go(1)"><div class="flex-none">&rangle;</div></div>
      </div>
    </md-dialog>
  </div>
</template>

<style lang="scss" scoped>
.rounded-dialog {
  border-radius: 5px;
}

.lightbox-tabs {
  width: 80vw;
  height: 80vh;
  overflow: hidden;
  position: relative;
}

.lightbox-tab {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center center;
  position: relative;
  height: 100%;
  width: 100%;
  display: inline-block;
}

.lightbox-scroller {
  position: absolute;
  height: 100%;
  min-width: 100%;
  transition: left 0.5s;
}

.lightbox-control {
  font-size: 10vh;
  color: white;
  -webkit-text-stroke: 2px black;
  width: 40%;
  height: 100%;
  position: absolute;
  top: 0;

  &.disabled {
    -webkit-text-stroke: 2px grey;
  }

  &.left {
    left: 0;
  }

  &.right {
    right: 0;
  }
}

.lightbox-thumbnail {
  border: 1px solid white;
  margin-left: 4px;
  img {
    max-height: 100px;
    max-width: 100px;
  }
}
</style>

<script>
export default {
  data: () => ({
    showDialog: false,
    page: 0
  }),
  props: {
    items: Array
  },
  methods: {
    go (dir) {
      const newPage = this.page + dir;
      if (newPage >= 0 && newPage < this.items.length) {
        this.page = newPage;
      }
    }
  }
};
</script>
