<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>MORE</span>
        <span class="font-weight-light">RECEIPTS</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <Sync :ps="ps"/>
      <Auth :uuid="uuid" :ps="ps"/>
    </v-app-bar>

    <v-content>
      <ReceiptNew :uuid="uuid" :ps="ps"/>
      <ReceiptRecent :uuid="uuid" :ps="ps"/>
      <InfoBar :ps="ps"/>
    </v-content>
  </v-app>
</template>

<script>
import ConsoleLogger from './services/ConsoleLogger';
import Repository from './services/Repository';
// import Repository from './services/Repository.mock';
import Authentication from './services/Authentication';
import ReceiptNew from './components/ReceiptNew';
import ReceiptRecent from './components/ReceiptRecent';
import Auth from './components/Auth';
import InfoBar from './components/InfoBar';
import Sync from './components/Sync';
import { default as uuid } from 'uuid/v4';
import { default as ps } from 'pubsub-js';
import { default as PouchDb } from 'pouchdb';

new ConsoleLogger(ps);
// new Repository(ps, uuid);
new Repository(ps, PouchDb);
new Authentication(ps);

export default {
  name: 'App',
  components: {
    ReceiptNew,
    ReceiptRecent,
    Auth,
    InfoBar,
    Sync
  },
  data: () => ({
    uuid: uuid,
    ps: ps
  }),
};
</script>
