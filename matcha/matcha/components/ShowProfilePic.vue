<template>
  <div class="mx-auto col-10 h-100 text-center">
    <b-avatar
      v-if="imageInput"
      size="20vh"
      to="avatar"
      :src="imageInput.url"
    ></b-avatar>
    <b-avatar v-else size="20vh" to="avatar"></b-avatar>
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
  async mounted() {
    await this.$axios.get('/user-images').then(e => {
      this.images = e.data;
    });
  },
  methods: {
    changeImage(image) {
      this.imageInput = image;
    },
    clearImage() {
      this.imageInput = null;
    },
  },
};
</script>
