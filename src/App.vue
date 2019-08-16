<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>MORE</span>
        <span class="font-weight-light">RECEIPTS</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-content>
      <ReceiptNew :uuid="uuid" :ps="ps"/>
      <ReceiptRecent :uuid="uuid" :ps="ps"/>
    </v-content>
  </v-app>
</template>

<script>
import ConsoleLogger from './services/ConsoleLogger';
import Repository from './services/Repository.mock';
import ReceiptNew from './components/ReceiptNew';
import ReceiptRecent from './components/ReceiptRecent';
import { default as uuid } from 'uuid/v4';
import { default as ps } from 'pubsub-js';

new ConsoleLogger(ps);
new Repository(ps, uuid);

export default {
  name: 'App',
  components: {
    ReceiptNew,
    ReceiptRecent
  },
  data: () => ({
    uuid: uuid,
    ps: ps
  }),
};
</script>
