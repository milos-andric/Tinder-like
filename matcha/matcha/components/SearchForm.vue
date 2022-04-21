<template>
  <main>
    <div id="search-form" class="col-4">
      <h3 class="text-center mb-4">Search by:</h3>

      <!-- Last name -->
      <b-button
        v-b-toggle.last-name-accordion
        class="mb-2"
        block
        variant="secondary"
      >
        Last name
      </b-button>
      <b-collapse
        id="last-name-accordion"
        v-model="lastChecked"
        class="mb-2"
        role="tabpanel"
      >
        <b-form-input
          id="last-name-search"
          v-model="lastValue"
          name="last-name-search"
        />
      </b-collapse>

      <!-- First name -->
      <b-button
        v-b-toggle.first-name-accordion
        class="mb-2"
        block
        variant="secondary"
      >
        First name
      </b-button>
      <b-collapse
        id="first-name-accordion"
        v-model="firstChecked"
        class="mb-2"
        role="tabpanel"
      >
        <b-form-input
          id="first-name-search"
          v-model="firstValue"
          name="first-name-search"
        />
      </b-collapse>

      <!-- Age -->
      <b-button v-b-toggle.age-accordion class="mb-2" block variant="secondary">
        Age
      </b-button>
      <b-collapse
        id="age-accordion"
        v-model="ageChecked"
        class="mb-2"
        role="tabpanel"
      >
        <Slider
          v-if="ageChecked"
          id="slider-age"
          v-model="ageSlider.value"
          class="slider"
          v-bind="ageSlider"
        />
      </b-collapse>

      <!-- Location -->
      <b-button
        v-b-toggle.location-accordion
        class="mb-2"
        block
        variant="secondary"
      >
        Location (km)
      </b-button>
      <b-collapse
        id="location-accordion"
        v-model="locationChecked"
        class="mb-2"
        role="tabpanel"
      >
        <Slider
          v-if="locationChecked"
          id="slider-location"
          v-model="locationSlider.value"
          class="slider"
          v-bind="locationSlider"
        />
      </b-collapse>

      <!-- Fame -->
      <b-button
        v-b-toggle.fame-accordion
        class="mb-2"
        block
        variant="secondary"
      >
        Fame
      </b-button>
      <b-collapse
        id="fame-accordion"
        v-model="fameChecked"
        class="mb-2"
        role="tabpanel"
      >
        <Slider
          v-if="fameChecked"
          id="slider-fame"
          v-model="fameSlider.value"
          class="slider"
          v-bind="fameSlider"
        />
      </b-collapse>

      <!-- Tags -->
      <b-button
        v-b-toggle.tags-accordion
        class="mb-2"
        block
        variant="secondary"
      >
        Tags
      </b-button>
      <b-collapse
        id="tags-accordion"
        v-model="tagsChecked"
        class="mb-2"
        role="tabpanel"
      >
        <TagSuggestions numberOfTags="5" @loadTag="loadTag" />
        <b-form-tags v-model="tagsValue" input-id="tags-basic"></b-form-tags>
      </b-collapse>

      <!-- Submit button -->
      <button id="button-search" class="btn btn-primary" @click="search">
        Search
      </button>

      <!-- Alert -->
      <b-alert v-model="alertStatus" variant="danger" dismissible class="mt-3">
        {{ alertMsg }}
      </b-alert>
    </div>

    <!-- Dataset -->
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
    list: [],

    lastChecked: false,
    firstChecked: false,
    ageChecked: false,
    locationChecked: false,
    fameChecked: false,
    tagsChecked: false,

    lastValue: '',
    firstValue: '',
    ageSlider: {
      value: [20, 40],
      min: 18,
    },
    locationSlider: {
      value: 20,
      min: 10,
      max: 1000,
    },
    fameSlider: {
      value: [20, 200],
      max: 500,
    },
    tagsValue: [],

    alertMsg: '',
    alertStatus: false,
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
      {
        field: 'age',
        valueFormatter: this.dateFormat,
        sortable: true,
        filter: true,
      },
      { headerName: 'Fame', field: 'score', sortable: true, filter: true },
      {
        headerName: 'Distance (km)',
        field: 'distance',
        valueFormatter: this.distanceFormat,
        sortable: true,
        filter: true,
      },
    ];
  },
  methods: {
    async search() {
      try {
        const search = {};
        if (this.lastChecked === true) search.last_name = this.lastValue;
        if (this.firstChecked === true) search.first_name = this.firstValue;
        if (this.ageChecked === true) search.age = this.ageSlider.value;
        if (this.locationChecked === true)
          search.distance = this.locationSlider.value;
        if (this.fameChecked === true) search.fame = this.fameSlider.value;
        if (this.tagsChecked === true) search.tags = this.tagsValue;
        const ip = await this.$axios.get('/getIP');
        search.ip = ip.data.ip;
        const res = await this.$axios.post('search', { search });
        this.list = res.data;
        this.rowData = res.data;
      } catch (e) {
        this.alertMsg = e.response.data.msg;
        this.alertStatus = true;
      }
    },
    loadTag(tag) {
      this.tagsValue.push(tag);
    },
    dateFormat(data) {
      if (data.value)
        return new Date().getFullYear() - new Date(data.value).getFullYear();
      else {
        return '';
      }
    },
    distanceFormat(data) {
      if (data.value) return data.value.toFixed(1);
      else {
        return null;
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
