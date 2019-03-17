import Vue from 'vue';
import Router from 'vue-router';
import Jsplumb from './views/Jsplumb.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'jsplumb',
      component: Jsplumb,
    },
  ],
});
