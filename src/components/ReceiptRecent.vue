<template>
  <v-layout row wrap>
    <v-flex xs10 sm8 md6 offset-xs1 offset-sm2 offset-md3>
      <v-list>
        <template v-for="(amount, category) in sums">
          <v-list-item :key="category">
             <v-list-item-content>
                <v-list-item-title>
                  <v-layout>
                    {{category}}<v-spacer></v-spacer>{{formatAmount(amount)}}
                  </v-layout>
                </v-list-item-title>
             </v-list-item-content>
          </v-list-item>
        </template>
        <v-list-item key="total">
           <v-list-item-content>
              <v-list-item-title>
                <v-layout>
                  total<v-spacer></v-spacer>{{formatAmount(total)}}
                </v-layout>
              </v-list-item-title>
           </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-flex>
  </v-layout>
</template>
<script>
export default {
  props: {
    ps: Object,
    uuid: Function
  },
  data: function() {
    return {
      categories: [],
      receipts: []
    };
  },
  beforeMount: function() {
    this.ps.subscribe('sys.updateReceipt.response', function(topic, data) {
      if (!data || !data.ok) {
        return;
      }

      this.requestReceiptUpdate();
    }.bind(this));

    this.ps.subscribe('sys.updateCategory.response', function(topic, data) {
      if (!data || !data.ok) {
        return;
      }

      this.requestCategoryUpdate();
    }.bind(this));

    this.requestUpdates();
  },
  computed: {
    total: function() {
      if (typeof this.categories === 'undefined' || this.categories === null) {
        return {};
      }

      if (typeof this.receipts === 'undefined' || this.receipts === null) {
        return {};
      }

      return this.receipts.reduce((acc, elem) => {
        acc += elem.amount;

        return acc;
      }, 0);
    },
    sums: function() {
      if (typeof this.categories === 'undefined' || this.categories === null) {
        return {};
      }

      if (typeof this.receipts === 'undefined' || this.receipts === null) {
        return {};
      }

      let cats = this.categories.reduce((acc, elem) => {
        acc[elem.id] = elem.title;

        return acc;
      }, {});

      return this.receipts.map(elem => {
        return {catagory: cats[elem.category_id], amount: elem.amount};
      }).reduce((acc, elem) => {
        if (typeof acc[elem.catagory] === 'undefined') {
          acc[elem.catagory] = 0;
        }

        acc[elem.catagory] += elem.amount;

        return acc;
      }, {});
    }
  },
  methods: {
    requestReceiptUpdate() {
      let id = this.uuid();
      let token = this.ps.subscribe(`sys.getReceiptsInInterval.response.${id}`, function(topic, data) {
        this.ps.unsubscribe(token);

        if (!data.ok || !data.receipts) {
          return;
        }

        this.receipts = data.receipts;
      }.bind(this));

      let dateStart = new Date();
      dateStart.setDate(dateStart.getDate() - 30);

      this.ps.publish(`sys.getReceiptsInInterval.request.${id}`, {
        start: dateStart.toISOString().substr(0, 10),
        end: (new Date()).toISOString().substr(0, 10)
      });
    },
    requestCategoryUpdate() {
      let id = this.uuid();
      let token = this.ps.subscribe(`sys.getCategories.response.${id}`, function(topic, data) {
        this.ps.unsubscribe(token);

        if (!data.ok || !data.categories) {
          return;
        }

        this.categories = data.categories;
      }.bind(this));
      this.ps.publish(`sys.getCategories.request.${id}`);
    },
    requestUpdates() {
      this.requestCategoryUpdate();
      this.requestReceiptUpdate();
    },
    formatAmount: function(amt) {
      let tok = (Math.round(amt * 100) / 100).toString().split('.');

      if (tok.length == 1) {
        tok.push('00');
      }

      while (tok[1].length < 2) {
        tok[1] = tok[1] + '0';
      }

      return tok.join('.');
    }
  }
}
</script>
