<template>
  <div class="mx-auto col-10 h-100 text-center">
    <b-avatar
      v-if="profile_pic"
      size="15vw"
      to="avatar"
      :src="profile_pic.url"
    ></b-avatar>
    <b-avatar v-else size="15vw" to="avatar"></b-avatar>
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
          <button
            class="btn position-absolute m-2 px-3"
            style="
              right: 0;
              top: 0;
              font-size: 20px;
              background: rgba(0 0 0 / 50%);
            "
            @click="deleteImage(image.image_id, image.url)"
          >
            <font-awesome-icon color="white" icon="trash" />
          </button>
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

    <b-form-file
      class="mt-5"
      placeholder="Choose a file or drop it here..."
      drop-placeholder="Drop file here..."
      @change="changeImage($event)"
    ></b-form-file>

    <b-alert v-model="alertStatus" variant="danger" dismissible class="mt-3">
      {{ errorMsg }}
    </b-alert>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user_name: '',
      profile_pic: '',
      score: 0,
      images: [],

      imageInput: null,

      alertStatus: false,
      errorMsg: '',
    };
  },
  async mounted() {
    await this.$axios.get('/user').then(e => {
      this.user_name = e.data.user_name;
      this.profile_pic = e.data.profile_pic;
      this.score = e.data.score;
    });

    await this.$axios.get('/user-images').then(e => {
      this.images = e.data;
    });
  },
  methods: {
    changeImage(e) {
      this.imageInput = e.target.files[0];
      if (this.imageInput) {
        this.uploadImage();
        e.target.files = null;
        e.target.value = null;
        this.imageInput = null;
      }
    },
    async deleteImage(id, url) {
      await this.$axios
        .post('/delete-image', { id, url })
        .then(e => {
          this.$axios.get('/user-images').then(e => {
            this.images = e.data;
            this.alertStatus = false;
          });
        })
        .catch(e => {
          this.errorMsg = e.response.data.msg;
          this.alertStatus = true;
        });
    },
    async uploadImage() {
      const formData = new FormData();
      formData.append('image', this.imageInput);

      await this.$axios
        .post('/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(() => {
          this.alertStatus = false;
          this.$axios.get('/user-images').then(e => {
            this.images = e.data;
          });
        })
        .catch(e => {
          this.errorMsg = e.response.data.msg;
          this.alertStatus = true;
        });
    },
  },
};
</script>
