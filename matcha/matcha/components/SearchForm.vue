<template>
  <div id="search-form">
    <div>
      <input v-model="lastChecked" type="checkbox" />
      <label for="last-name-search">Last name search:</label>
      <input
        v-if="lastChecked"
        id="last-name-search"
        v-model="lastValue"
        type="search"
        name="last-name-search"
      />
    </div>

    <div>
      <input v-model="firstChecked" type="checkbox" />
      <label for="first_name-search">First name search:</label>
      <input
        v-if="firstChecked"
        id="first_name-search"
        v-model="firstValue"
        type="search"
        name="first-name-search"
      />
    </div>

    <div>
      <input v-model="ageChecked" type="checkbox" />
      <label for="age-search">Age search:</label>
      <Slider
        v-if="ageChecked"
        id="slider-age"
        v-model="ageSlider.value"
        class="slider"
        v-bind="ageSlider"
      />
    </div>

    <div>
      <input v-model="locationChecked" type="checkbox" />
      <label for="location-search">Location search (km) :</label>
      <Slider
        v-if="locationChecked"
        id="slider-location"
        v-model="locationSlider.value"
        class="slider"
        v-bind="locationSlider"
      />
    </div>

    <div>
      <input v-model="fameChecked" type="checkbox" />
      <label for="fame-search">Fame search :</label>
      <Slider
        v-if="fameChecked"
        id="slider-fame"
        v-model="fameSlider.value"
        class="slider"
        v-bind="fameSlider"
      />
    </div>

    <div>
      <input v-model="tagsChecked" type="checkbox" />
      <label for="tags-search">Tags search:</label>
      <input
        v-if="tagsChecked"
        id="tags-search"
        type="search"
        name="tags-search"
      />
    </div>
    <button id="button-search" @click="search">Search</button>

    <div v-if="rowData" id="search-result">
      <client-only>
        <ag-grid-vue
          style="width: 50vw; height: 500px; margin: auto"
          class="ag-theme-alpine"
          :columnDefs="columnDefs"
          :rowData="rowData"
        >
        </ag-grid-vue>
      </client-only>
    </div>
  </div>
</template>

<script type="module">
import Slider from '@vueform/slider/dist/slider.vue2';
import { AgGridVue } from 'ag-grid-vue';

export default {
  components: { Slider, AgGridVue },
  data: () => ({
    columnDefs: null,
    rowData: null,
    ageSlider: {
      value: [20, 40],
      min: 18,
    },
    locationSlider: {
      value: 20,
      min: 10,
    },
    fameSlider: {
      value: 20,
    },
    ageChecked: false,
    locationChecked: false,
    fameChecked: false,
    tagsChecked: false,
    firstChecked: false,
    lastChecked: false,
    firstValue: '',
    lastValue: '',
    list: [],
  }),
  beforeMount() {
    this.columnDefs = [
      { field: 'first_name', sortable: true, filter: true },
      { field: 'last_name', sortable: true, filter: true },
      { field: 'age', sortable: true, filter: true },
    ];
  },
  methods: {
    async search() {
      try {
        const searchObj = {};
        if (this.firstChecked === true) searchObj.first_name = this.firstValue;
        if (this.lastChecked === true) searchObj.last_name = this.lastValue;
        if (this.tagsChecked === true) searchObj.tags = this.tagsValue;
        if (this.ageChecked === true) searchObj.age = this.ageSlider.value;
        if (this.fameChecked === true) searchObj.fame = this.fameSlider.value;
        if (this.locationChecked === true)
          searchObj.location = this.locationSlider.value;

        await this.$axios
          .post('search', {
            searchObj,
          })
          .then(r => {
            this.list = r.data;
            this.rowData = r.data;
          });
      } catch (e) {
        this.error = e.response.data.message;
      }
    },
  },
};
</script>

<style>
@import url('../assets/sliderstyle.css');
@import url('../node_modules/ag-grid-community/dist/styles/ag-grid.css');
@import url('../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css');
#search-form {
  display: flex;
  flex-direction: column;
  align-content: center;
  margin: auto;
  width: 20%;
}
#search-result {
  margin: auto;
}
#button-search {
  margin-top: 1rem;
}
.slider {
  margin-top: 2rem;
}
</style>
// // 'field': 'age', // // 'operation': 'BETWEEN', // // 'val1': '24', // //
'val2': '26' // // }, { // // 'field': 'gender', // // 'operation': 'EQUAL', //
// 'val': '1', // // }, { // // 'field': 'location', // // 'operation': 'RANGE',
// // 'longitude': '2', // // 'lattitude': '48', // // 'distance': '100km', //
j'ai envie de baiser // // }, { // // 'field': 'tags', // // 'operation':
'LIST', // // 'tags': ['volleyball', 'levrette', 'reglisse'] // // }]
