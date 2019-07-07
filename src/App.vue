<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>more</span>
        <span class="font-weight-light">receipts</span>
      </v-toolbar-title>
    </v-toolbar>

    <v-content>
      <ReceiptNew :uuid="uuid" :init="receiptNewInit" :categories="categories" v-on:update-objects="updateObjects"/>
      <ReceiptRecent :init="receiptRecentInit" :categories="categories" :receipts="receipts"/>
    </v-content>
  </v-app>
</template>

<script>
import Repository from './Repository.mock'
import {default as uuid} from 'uuid/v4'
import ReceiptNew from './components/ReceiptNew'
import ReceiptRecent from './components/ReceiptRecent'

export default {
  name: 'App',
  components: {
    ReceiptNew,
    ReceiptRecent
  },
  data () {
    let repo = new Repository(uuid);

    return {
      categories: null,
      receipts: null,
      receiptRecentInit: false,
      receiptNewInit: false,
      repo: repo,
      uuid: uuid
    }
  },
  beforeMount: function() {
    let end = new Date();
    let start = new Date();
    
    start.setMonth(start.getMonth() - 1);
      
    Promise.all([
      this.repo.getCategories(),
      this.repo.getReceipts(start.toISOString().substr(0, 10), end.toISOString().substr(0, 10))
    ]).then(dat => {
      this.categories = dat[0];
      this.receipts = dat[1];
      this.receiptNewInit = true;
      this.receiptRecentInit = true;
    });
  },
  methods: {
    updateObjects: function(objs) {
      let reloadCategories = false;
      let reloadReceipts = false;

      objs.forEach(elem => {
        reloadCategories |= elem.type === 'category';
        reloadReceipts |= elem.type === 'receipt';

        this.repo.updateObject(elem);
      });

      if (reloadCategories) {
        this.reloadCategories();
      }

      if (reloadReceipts) {
        this.reloadReceipts();
      }
    },
    reloadCategories: function() {
      this.repo.getCategories().then((val) => {
        this.categories = val;
      });
    },
    reloadReceipts: function() {
      let end = new Date();
      let start = new Date();
      
      start.setMonth(start.getMonth() - 1);

      this.repo.getReceipts(start.toISOString().substr(0, 10), end.toISOString().substr(0, 10)).then((val) => {
        this.receipts = val;
      });
    }
  }
}
</script>
