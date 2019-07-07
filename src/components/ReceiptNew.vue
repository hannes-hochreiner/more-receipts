<template>
  <v-layout row wrap>
    <v-flex xs12 sm6 md4>
      <v-form ref="form" lazy-validation>
        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="date"
              label="date"
              prepend-icon="event"
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
    categories: Array,
    init: Boolean,
    uuid: Function
  },
  data: () => ({
    date: new Date().toISOString().substr(0, 10),
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
    category: null
  }),
  methods: {
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

        this.$emit('update-objects', objs);
        this.$refs.form.reset();
        this.date = new Date().toISOString().substr(0, 10);
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
