import Vue from 'vue';
import Router from 'vue-router';
import Main from '@/components/Main.vue';
import Login from '@/components/Login.vue';
import QueueItem from '@/components/QueueItem.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import ProfilePic from '@/components/ProfilePic.vue';
import ChatLine from '@/components/ChatLine.vue';

Vue.use(Router);
Vue.component('QueueItem', QueueItem);
Vue.component('ProgressBar', ProgressBar);
Vue.component('ProfilePic', ProfilePic);
Vue.component('ChatLine', ChatLine);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Main',
      component: Main
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
});
