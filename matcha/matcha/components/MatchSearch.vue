<template>
  <div>
    <div id="search-form" class="col-4">
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
        Fame (superieur à)
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
      <button id="button-search" class="btn btn-primary" @click="searchVal">
        Search
      </button>

      <!-- Alert -->
      <b-alert v-model="alertStatus" variant="danger" dismissible class="mt-3">
        {{ alertMsg }}
      </b-alert>
    </div>
  </div>
</template>

<script type="module">
import Slider from '@vueform/slider/dist/slider.vue2';

export default {
  components: { Slider },
  data: () => ({
    search: {
      ageChecked: false,
      ageValue: [],
      locationChecked: false,
      locationValue: [],
      fameChecked: false,
      fameValue: [],
      tagsChecked: false,
      tagsValue: [],
    },
    list: [],
    ageChecked: false,
    locationChecked: false,
    fameChecked: false,
    tagsChecked: false,

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
      value: 20,
    },
    tagsValue: [],

    alertMsg: '',
    alertStatus: false,
  }),
  methods: {
    async searchVal() {
      try {
        const search = {};
        if (this.ageChecked === true) search.age = this.ageSlider.value;
        if (this.locationChecked === true)
          search.distance = this.locationSlider.value;
        if (this.fameChecked === true) search.fame = this.fameSlider.value;
        if (this.tagsChecked === true) search.tags = this.tagsValue;
        const ip = await this.$axios.get('/getIP');
        search.ip = ip.data.ip;
        this.$emit('updateList', search);
      } catch (e) {
        this.alertMsg = e.response.data.msg;
        this.alertStatus = true;
      }
    },
    loadTag(tag) {
      this.tagsValue.push(tag);
    },
  },
};
</script>

<style>
@import url('../assets/sliderstyle.css');
#search-form {
  display: flex;
  flex-direction: column;
  align-content: center;
  min-width: 300px;
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
