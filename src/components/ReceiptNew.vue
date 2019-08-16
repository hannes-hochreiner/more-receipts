<template>
  <v-layout row wrap>
    <v-flex xs12 sm6 md4 offset-xs0 offset-sm3 offset-md4>
      <v-form ref="form" lazy-validation>
        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          full-width
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="date"
              label="date"
              prepend-icon="mdi-calendar"
              readonly
              v-on="on"
              :rules="dateRules"
            ></v-text-field>
          </template>
          <v-date-picker v-model="date" @input="menu = false"></v-date-picker>
        </v-menu>
        <v-text-field
          v-model="amount"
          :rules="amountRules"
          prepend-icon="mdi-cash-100"
          label="amount"
        ></v-text-field>
        <v-combobox
          v-model="category"
          :items="categories"
          item-text="title"
          item-value="_id"
          :rules="categoryRules"
          label="category"
          @change="combochange"
        ></v-combobox>
        <v-btn @click="submit">create</v-btn>
      </v-form>
    </v-flex>
  </v-layout>
</template>
<script>
export default {
  props: {
    ps: Object,
    uuid: Function
  },
  data: () => ({
    date: (new Date()).toISOString().substr(0, 10),
    menu: false,
    amount: null,
    dateRules: [
      v => (typeof v !== 'undefined' && v !== null && v !== '') || 'please select a date'
    ],
    amountRules: [
      v => !Number.isNaN(Number.parseFloat(v)) || 'amount must be a number'
    ],
    categoryRules: [
      v => ((v !== null) && (typeof v === 'object')) || 'please select a category'
    ],
    category: null,
    categories: []
  }),
  beforeMount: function() {
    this.ps.subscribe('sys.getCategories.response', this.updateCategories.bind(this));
    this.ps.publish(`sys.getCategories.request.${this.uuid()}`);
  },
  methods: {
    updateCategories(topic, data) {
      if (!data.ok && typeof data.categories !== 'undefined') {
        return
      }

      this.categories = data.categories;
    },
    submit () {
      if (this.$refs.form.validate()) {
        this.menu = false;
        let objs = [];

        if (typeof this.categories.find(elem => elem.id === this.category.id) === 'undefined') {
          objs.push(this.category);
        }

        objs.push({
          type: 'receipt',
          id: this.uuid(),
          date: this.date,
          amount: Number.parseFloat(this.amount),
          category_id: this.category.id
        });

        this.ps.publish(`sys.updateObjects.request.${this.uuid()}`, {
          objects: objs
        });

        // resetting the form did not work well with setting the date again
        // hence, I am resetting the form manually
        // afterwards, the validation needs to be reset
        this.category = null;
        this.amount = null;
        this.date = (new Date()).toISOString().substr(0, 10);
        this.$refs.form.resetValidation();
      }
    },
    combochange(e) {
      if (typeof e === 'string' && e !== '') {
        this.category = {
          type: 'category',
          id: this.uuid(),
          title: e
        };
      }
    }
  }
}
</script>
