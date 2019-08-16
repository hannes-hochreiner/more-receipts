<template>
  <v-snackbar
    v-model="snackbar"
    :bottom="true"
    :color="log.type"
    :multi-line="true"
    :timeout="0"
    v-if="log"
  >
    {{ log.title }}
    <v-btn dark icon text @click="close">
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </v-snackbar>
</template>
<script>
export default {
  data: function() {
    return {
      snackbar: false,
      logs: [],
      log: null,
      timeoutId: null
    }
  },
  props: {
    ps: Object
  },
  beforeMount: function() {
    this.token = this.ps.subscribe('log', this.addLog.bind(this));
  },
  beforeDestroy: function() {
    this.ps.unsubscribe(this.token);
  },
  methods: {
    close: function() {
      if (this.timeoutId) {
        window.clearTimeout(this.timeoutId);
      }

      this.timeoutId = null;
      this.snackbar = false;
      this.log = null;

      this.showNextLog();
    },
    addLog: function(topic, data) {
      let topicTokens = topic.split('.');
      let log = {
        type: 'info',
        title: data.title
      };

      if (topicTokens[1] == 'error') {
        log.type = 'error';
      } else if (topicTokens[1] == 'success') {
        log.type = 'success';
      }

      this.logs.push(log);
      this.showNextLog();
    },
    showNextLog: function() {
      if (this.snackbar) {
        return;
      }

      if (this.logs.length == 0) {
        return;
      }

      this.log = this.logs.shift();

      if (this.log.type != 'error') {
        this.timeoutId = window.setTimeout(this.close.bind(this), 3000);
      }

      this.snackbar = true;
    }
  }
}
</script>