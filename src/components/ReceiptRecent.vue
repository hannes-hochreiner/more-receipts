<template>
  <v-layout row wrap>
    <v-flex xs12 sm6 md4>
      <v-list>
        <template v-for="(amount, category) in sums">
          <v-list-tile :key="category">
             <v-list-tile-content>
                <v-list-tile-title>
                  <v-layout>
                    {{category}}<v-spacer></v-spacer>{{formatAmount(amount)}}
                  </v-layout>
                </v-list-tile-title>
             </v-list-tile-content>
          </v-list-tile>
        </template>
        <v-list-tile key="total">
           <v-list-tile-content>
              <v-list-tile-title>
                <v-layout>
                  total<v-spacer></v-spacer>{{formatAmount(total)}}
                </v-layout>
              </v-list-tile-title>
           </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-flex>
  </v-layout>
</template>
<script>
export default {
  props: {
    categories: Array,
    receipts: Array,
    init: Boolean
  },
  data: () => ({
  }),
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
