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
      let pst = this.ps.subscribe(`sys.synchronizeDatabase.request`, function(topic, data) {
        this.ps.unsubscribe(pst);

        if (data.ok) {
          this.ps.publish('log.success', {title: 'synchronization succeeded'});
        } else {
          this.ps.publish('log.error', {title: 'synchronization failed'});
        }
      }.bind(this));
      this.ps.publish(`sys.synchronizeDatabase.request`);
    }
  }
}
</script>