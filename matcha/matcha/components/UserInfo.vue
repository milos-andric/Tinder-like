<template>
  <div class="mx-auto col-10 h-100 text-center">
    <!-- User main info -->
    <b-avatar v-if="profile_pic" size="20vw" :src="profile_pic.url"></b-avatar>
    <b-avatar v-else size="15vw"></b-avatar>
    <h2 class="mt-3">{{ first_name + ' ' + last_name }}</h2>
    <h4>{{ '@' + user_name }}</h4>

    <!-- Bio -->
    <blockquote class="blockquote mt-5">
      <p>{{ bio }}</p>
    </blockquote>

    <!-- Tags -->
    <h4 class="mt-3">
      <b-badge class="py-2 px-3" variant="dark">
        <font-awesome-icon icon="star" /> {{ score }}
      </b-badge>
      <b-badge v-if="!gender" class="py-2 px-3" variant="dark">
        <font-awesome-icon icon="mars" /> Male
      </b-badge>
      <b-badge v-else class="py-2 px-3" variant="dark">
        <font-awesome-icon icon="venus" /> Female
      </b-badge>
      <b-badge class="py-2 px-3" variant="dark">
        <font-awesome-icon :icon="getOrientationIcon()" />
        {{ getOrientation() }}
      </b-badge>
      <b-badge v-for="tag in tags" :key="tag" class="py-2 px-3 m-1">
        {{ tag }}
      </b-badge>
    </h4>

    <!-- Gallery -->
    <b-container class="my-5 p-3">
      <div v-if="images.length" class="d-flex flex-wrap justify-content-center">
        <div
          v-for="image in images"
          :key="image.image_id"
          class="position-relative"
        >
          <b-img-lazy
            :src="image.url"
            style="height: 250px"
            class="m-2 shadow bg-body rounded"
            alt="Image 1"
          >
          </b-img-lazy>
        </div>
      </div>
      <div v-else>
        <font-awesome-icon
          color="black"
          class="mb-2"
          style="font-size: 75px"
          icon="image"
        />
        <h3>No image yet</h3>
      </div>
    </b-container>

    <!-- Actions -->
    <b-container fluid>
      <b-button
        v-b-modal.report
        v-b-tooltip.hover.top="'Report user as bot'"
        class="shadow-lg"
        variant="light"
        style="border-radius: 3em; width: 5em; height: 5em"
      >
        <font-awesome-icon
          class="text-danger"
          icon="robot"
          style="font-size: 2em"
        />
      </b-button>
      <b-button
        v-b-tooltip.hover.top="'Like user'"
        class="shadow-lg btn-lg mx-3"
        variant="light"
        style="border-radius: 3em; width: 5em; height: 5em"
        @click="like"
      >
        <font-awesome-icon
          class="text-dark"
          icon="heart"
          style="font-size: 3em"
        />
      </b-button>
      <b-button
        v-b-modal.block
        v-b-tooltip.hover.top="'Block user'"
        class="shadow-lg"
        variant="light"
        style="border-radius: 3em; width: 5em; height: 5em"
      >
        <font-awesome-icon
          class="text-danger"
          icon="ban"
          style="font-size: 2em"
        />
      </b-button>
    </b-container>

    <b-modal id="report" title="Report as robot" @ok="confirmReport">
      <p class="text-center my-4">
        <font-awesome-icon icon="robot" style="font-size: 2em" />
      </p>
      <p class="text-center my-4">Report this user as a robot ?</p>
    </b-modal>

    <b-modal id="block" title="Report as robot" @ok="confirmBlock">
      <p class="text-center my-4">
        <font-awesome-icon icon="ban" style="font-size: 2em" />
      </p>
      <p class="text-center my-4">
        By blocking this user, we will not display them to you anymore and you
        will not get notification from them
      </p>
    </b-modal>

    <b-alert v-model="alertStatus" variant="danger" dismissible class="mt-3">
      {{ errorMsg }}
    </b-alert>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: this.$route.params.id,
      first_name: '',
      last_name: '',
      user_name: '',
      gender: 0,
      orientation: 2,
      bio: '',
      tags: [],
      score: 0,
      profile_pic: '',

      images: [],

      alertStatus: false,
      successStatus: false,
      errorMsg: '',
    };
  },
  async mounted() {
    await this.$axios.get('/user/' + this.id).then(e => {
      this.first_name = e.data.first_name;
      this.last_name = e.data.last_name;
      this.user_name = e.data.user_name;
      this.gender = e.data.gender;
      this.orientation = e.data.orientation;
      this.bio = e.data.bio;
      this.tags = e.data.tags;

      this.profile_pic = e.data.profile_pic;
    });

    await this.$axios.get('/user-images/' + this.id).then(e => {
      this.images = e.data;
    });
  },
  methods: {
    getOrientationIcon() {
      if (this.orientation === 0) return 'mars';
      else if (this.orientation === 2) return 'venus-mars';
      else return 'venus';
    },
    getOrientation() {
      if (this.orientation === 2) return 'Bi';
      else if (this.orientation === this.gender) return 'Gay';
      else return 'Straight';
    },
    confirmReport(e) {
      e.preventDefault();
      console.log(this.id);
    },
    confirmBlock(e) {
      e.preventDefault();
      console.log(this.id);
    },
    like() {
      console.log(this.id);
    },
  },
};
</script>
