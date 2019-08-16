<template>
  <div>
    <v-menu bottom left>
      <template v-slot:activator="{ on }">
        <v-btn dark icon v-on="on" color="grey">
          <v-icon>mdi-account</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item key="logout" @click="logout">
          <v-list-item-title>log out</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-dialog v-model="dialogCredentials" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{title}}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" v-for="cred in credentials" :key="cred.name">
                <v-text-field :label="cred.displayName" :type="cred.type" required v-model="cred.value"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="cancelCredentials">cancel</v-btn>
          <v-btn color="blue darken-1" text @click="submitCredentials">submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  props: {
    ps: Object,
    uuid: Function
  },
  data: () => ({
    dialogCredentials: false,
    credentials: [],
    title: '',
    getCredentialsToken: null,
    getNewPasswordToken: null,
    topicTokens: []
  }),
  beforeMount: function() {
    this.getCredentialsToken = this.ps.subscribe('sys.getCredentials.request', this.getCredentials.bind(this));
    this.getNewPasswordToken = this.ps.subscribe('sys.getNewPassword.request', this.getCredentials.bind(this));
  },
  beforeDestroy: function() {
    this.ps.unsubscribe(this.getCredentialsToken);
    this.getCredentialsToken = null;
    this.ps.unsubscribe(this.getCredentialsToken);
    this.getCredentialsToken = null;
  },
  methods: {
    getCredentials: function(topic) {
      this.topicTokens = topic.split('.');

      if (this.topicTokens[1] == 'getCredentials') {
        this.title = 'Login';
        this.credentials = [
          {name: 'username', displayName: 'Username', type: 'text'},
          {name: 'password', displayName: 'Password', type: 'password'}
        ];
      } else if (this.topicTokens[1] == 'getNewPassword') {
        this.title = 'New Password';
        this.credentials = [
          {name: 'newPassword', displayName: 'Password', type: 'password'}
        ];
      } else {
        return;
      }

      this.dialogCredentials = true;
    },
    submitCredentials: function() {
      this.dialogCredentials = false;
      let res = { ok: true };

      if (this.topicTokens[1] == 'getCredentials') {
        res.credentials = {};

        for (let idx in this.credentials) {
          res.credentials[this.credentials[idx].name] = this.credentials[idx].value;
        }
      } else if (this.topicTokens[1] == 'getNewPassword') {
        res.newPassword = this.credentials[0].value;
      } else {
        return;
      }

      this.ps.publish(`${this.topicTokens[0]}.${this.topicTokens[1]}.response`, res);
      this.credentials = [];
    },
    cancelCredentials: function() {
      this.dialogCredentials = false;
      this.ps.publish(`${this.topicTokens[0]}.${this.topicTokens[1]}.response`, {
        error: 'getting credentials cancelled'
      });
      this.credentials = [];
    },
    logout: function() {
      let token = this.ps.subscribe('sys.logout.response', function(topic, data) {
        this.ps.unsubscribe(token);

        if (!data.ok) {
          this.ps.publish('log.error', {
            title: 'logout failed',
            error: data.error
          });

          return;
        }

        this.ps.publish('log.success', {
          title: 'logout succeeded'
        });
      }.bind(this));
      this.ps.publish('sys.logout.request');
    }
  }
}
</script>