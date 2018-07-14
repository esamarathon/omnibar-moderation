// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';

import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default-dark.css';

import VirtualScrollList from 'vue-virtual-scroll-list';

import './styles/base.scss';

Vue.config.productionTip = false;

Vue.use(VueMaterial);
Vue.component('virtual-list', VirtualScrollList);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
