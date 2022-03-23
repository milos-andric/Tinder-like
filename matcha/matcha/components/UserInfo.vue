<template><div class="mx-auto col-10 h-100 text-center">
    <b-avatar
      v-if="profile_pic"
      size="15vw"
      to="/avatar"
      :src="profile_pic.url"
    ></b-avatar>
    <b-avatar v-else size="15vw"></b-avatar>
    <h2>{{ user_name }}</h2>
    <h3><font-awesome-icon icon="star" /> {{ score }}</h3>

    <b-container class="mt-5 p-3">
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
      email: '',
      gender: 0,
      orientation: 2,
      bio: '',
      tags: [],

      score: 0,
      images: [],
      profile_pic: '',

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
      this.email = e.data.email;
      this.gender = e.data.gender;
      this.orientation = e.data.orientation;
      this.bio = e.data.bio;
      this.tags = e.data.tags;
      
      this.profile_pic = e.data.profile_pic;
    });

    await this.$axios.get('/user-images/' + this.id).then(e => {
      this.images = e.data;
    });
  }
};
</script>
