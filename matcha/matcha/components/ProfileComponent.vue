<template>
  <div class="mx-auto col-10 h-100 text-center">
    <b-avatar size="15vw"></b-avatar>
    <h2>{{ user_name }}</h2>
    <h3><font-awesome-icon icon="star" /> {{ score }}</h3>

    <b-container class="mt-5 p-3 d-flex flex-wrap justify-content-center">
      <b-img-lazy
        src="https://picsum.photos/250/250/?image=54"
        class="m-2"
        alt="Image 1"
      ></b-img-lazy>

      <b-img-lazy
        src="https://picsum.photos/250/250/?image=58"
        class="m-2"
        alt="Image 2"
      ></b-img-lazy>

      <b-img-lazy
        src="https://picsum.photos/250/250/?image=59"
        alt="Image 3"
        class="m-2"
      >
      </b-img-lazy>

      <b-img-lazy
        src="https://picsum.photos/250/250/?image=57"
        alt="Image 3"
        class="m-2"
      >
      </b-img-lazy>

      <b-img-lazy
        src="https://picsum.photos/250/250/?image=60"
        alt="Image 3"
        class="m-2"
      >
      </b-img-lazy>
    </b-container>

    <!-- <b-form-file
      v-model="image"
      placeholder="Choose a file or drop it here..."
      drop-placeholder="Drop file here..."
      
    ></b-form-file> -->

    <input type="file" @change="changeImage($event)" />

    <button @click="uploadImage">lol</button>

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
      score: 0,

      image: '',

      alertStatus: false,
      errorMsg: '',
    };
  },
  async mounted() {
    await this.$axios.get('/user').then(e => {
      this.user_name = e.data.user_name;
      this.score = e.data.score;
    });
  },
  methods: {
    changeImage(e) {
      this.image = e.target.files[0];
    },
    async uploadImage(e) {
      const formData = new FormData();
      formData.append('image', this.image);

      await this.$axios
        .post('/uploadImg', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(function () {
          console.log('SUCCESS!!');
        })
        .catch(function () {
          console.log('FAILURE!!');
        });
    },
  },
};
</script>
