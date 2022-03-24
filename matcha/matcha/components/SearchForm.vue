<template>
  <main>
    <div id="search-form" class="col-6">
      <div>
        <b-form-checkbox v-model="lastChecked"
          >Last name search</b-form-checkbox
        >
        <b-form-input
          v-if="lastChecked"
          id="last-name-search"
          v-model="lastValue"
          class="my-2"
          name="last-name-search"
        />
      </div>

      <div>
        <b-form-checkbox v-model="firstChecked"
          >First name search</b-form-checkbox
        >
        <b-form-input
          v-if="firstChecked"
          id="first_name-search"
          v-model="firstValue"
          class="my-2"
          name="first-name-search"
        />
      </div>

      <div>
        <b-form-checkbox v-model="ageChecked">Age search</b-form-checkbox>
        <Slider
          v-if="ageChecked"
          id="slider-age"
          v-model="ageSlider.value"
          class="slider"
          v-bind="ageSlider"
        />
      </div>

      <div>
        <b-form-checkbox v-model="locationChecked"
          >Location search (km)</b-form-checkbox
        >
        <Slider
          v-if="locationChecked"
          id="slider-location"
          v-model="locationSlider.value"
          class="slider"
          v-bind="locationSlider"
        />
      </div>

      <div>
        <b-form-checkbox v-model="fameChecked">Fame search</b-form-checkbox>
        <Slider
          v-if="fameChecked"
          id="slider-fame"
          v-model="fameSlider.value"
          class="slider"
          v-bind="fameSlider"
        />
      </div>

      <div>
        <b-form-checkbox v-model="tagsChecked">Tags search</b-form-checkbox>
        <b-form-input
          v-if="tagsChecked"
          id="tags-search"
          name="tags-search"
          class="my-2"
        />
      </div>
      <button id="button-search" class="btn btn-primary" @click="search">
        Search
      </button>
    </div>

    <div v-if="rowData" id="search-result" class="mt-5 col-10">
      <client-only>
        <ag-grid-vue
          style="height: 500px; margin: auto"
          class="ag-theme-material"
          :columnDefs="columnDefs"
          :rowData="rowData"
        >
        </ag-grid-vue>
      </client-only>
    </div>
  </main>
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
      {
        field: 'first_name',
        sortable: true,
        filter: true,
        onCellClicked: e => this.$router.push('/user/' + e.data.user_id),
      },
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
@import url('../node_modules/ag-grid-community/dist/styles/ag-theme-material.css');
#search-form {
  display: flex;
  flex-direction: column;
  align-content: center;
  margin: auto;
}
#search-result {
  margin: auto;
}
#button-search {
  margin-top: 3rem;
}
.slider {
  margin-top: 3rem;
  margin-bottom: 1rem;
}
</style>
