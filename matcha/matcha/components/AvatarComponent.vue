<template>
  <div class="mx-auto col-10 h-100 text-center">
    <b-link class="d-block mb-4" to="/user">Go back to profile</b-link>

    <b-avatar
      v-if="imageInput"
      size="20vw"
      to="/avatar"
      :src="imageInput.url"
    ></b-avatar>
    <b-avatar v-else size="20vw" to="/avatar"></b-avatar>
    <h2 class="mt-3">Choose your profile picture</h2>

    <b-container class="mt-5 p-3">
      <div v-if="images.length" class="d-flex flex-wrap justify-content-center">
        <div
          v-for="image in images"
          :key="image.image_id"
          class="position-relative"
          @click="changeImage(image)"
        >
          <b-img-lazy
            :src="image.url"
            style="height: 250px"
            class="m-2 shadow bg-body rounded"
            alt="Uploaded image"
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

    <button class="btn btn-primary" @click="uploadAvatar">Save</button>
    <button class="btn btn-secondary" @click="clearImage">Clear</button>

    <b-alert v-model="alertStatus" variant="danger" dismissible class="mt-3">
      {{ errorMsg }}
    </b-alert>
  </div>
</template>

<script>
export default {
  data() {
    return {
      images: [],

      imageInput: null,

      alertStatus: false,
      errorMsg: '',
    };
  },
  async beforeMount() {
    try {
      await this.$axios.get('/user-images').then(e => {
        this.images = e.data;
      });
    } catch (e) {
      this.$nuxt.context.error({
        status: 404,
      });
    }
  },
  methods: {
    changeImage(image) {
      this.imageInput = image;
    },
    clearImage() {
      this.imageInput = null;
    },
    async uploadAvatar() {
      await this.$axios
        .post('/profile-image', {
          image: this.imageInput,
        })
        .then(() => {
          this.alertStatus = false;
          this.$router.push('/user');
        })
        .catch(e => {
          this.errorMsg = e.response.data.msg;
          this.alertStatus = true;
        });
    },
  },
};
</script>
