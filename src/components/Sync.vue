<template>
  <v-btn dark icon @click="sync" color="grey">
    <v-icon>mdi-sync</v-icon>
  </v-btn>
</template>
<script>
export default {
  props: {
    ps: Object
  },
  methods: {
    sync: function() {
      this.ps.publish(`sys.synchronizeDatabase.request`);
    }
  }
}
</script>