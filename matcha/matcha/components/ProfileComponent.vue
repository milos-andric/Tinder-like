<template>
  <div v-if="load" class="mx-auto col-10 h-100 text-center">
    <!-- Avatar -->
    <b-avatar
      v-if="profile_pic"
      size="15vw"
      to="avatar"
      :src="profile_pic.url"
    ></b-avatar>
    <b-avatar v-else size="15vw" to="avatar"></b-avatar>
    <h2 class="mt-3">{{ first_name + ' ' + last_name }}</h2>
    <h4 class="mt-3 field-overflow">{{ email }}</h4>
    <h4 class="mt-3 field-overflow">{{ '#' + user_name }}</h4>

    <!-- Bio -->
    <blockquote class="blockquote mt-5">
      <p>{{ bio }}</p>
    </blockquote>

    <!-- Tags -->
    <h4 class="mt-3">
      <b-badge class="py-2 px-3" variant="dark">
        <font-awesome-icon icon="star" /> {{ score }}
      </b-badge>
      <b-badge v-if="birth_date" class="py-2 px-3" variant="dark">
        <font-awesome-icon icon="cake-candles" />
        {{ new Date().getFullYear() - birth_date.getFullYear() }}
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

    <!-- User links -->
    <div>
      <b-link class="mr-3" to="/me">Edit personal info</b-link>
      |
      <b-link class="ml-3" to="/security">Change password</b-link>
    </div>

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
      :no-drop="true"
      @change="changeImage($event)"
    ></b-form-file>

    <b-alert v-model="alertStatus" variant="danger" dismissible class="mt-3">
      {{ alertMsg }}
    </b-alert>
    <HistoryComponent />
  </div>
  <div v-else class="text-center">
    <b-spinner
      variant="primary"
      style="width: 5rem; height: 5rem"
      label="Large Spinner Text Centered"
    ></b-spinner>
  </div>
</template>

<script>
export default {
  data() {
    return {
      first_name: '',
      last_name: '',
      user_name: '',
      email: '',
      birth_date: null,
      gender: 0,
      orientation: 2,
      bio: '',
      tags: [],
      score: 0,
      profile_pic: '',

      images: [],
      imageInput: null,

      alertStatus: false,
      alertMsg: '',

      load: false,
    };
  },
  async beforeMount() {
    if (this.$route.query.completed === "false") {
      this.alertMsg = 'You must at least have a profile picture before finding match';
      this.alertStatus = true;
    }
    await this.getUserData();
    this.load = true;
  },
  methods: {
    async getUserData() {
      await this.$axios.get('/me').then(e => {
        this.first_name = e.data.first_name;
        this.last_name = e.data.last_name;
        this.user_name = e.data.user_name;
        this.email = e.data.email;
        this.gender = e.data.gender;
        this.orientation = e.data.orientation;
        this.bio = e.data.bio;
        this.tags = e.data.tags;
        this.score = e.data.score;

        this.profile_pic = e.data.profile_pic;

        if (e.data.age) this.birth_date = new Date(e.data.age);
      });

      await this.$axios.get('/user-images').then(e => {
        this.images = e.data;
      });
    },
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
        .then(() => {
          this.alertStatus = false;
          this.getUserData();
        })
        .catch(e => {
          this.alertMsg = e.response.data.msg;
          this.alertStatus = true;
        });
    },
    async uploadImage() {
      const formData = new FormData();
      formData.append('image', this.imageInput);

      if (this.imageInput.size < 50000) {
        try {
          await this.$axios.post('/upload-image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          this.alertStatus = false;
          this.getUserData();
        } catch (e) {
          this.alertMsg = e.response.data.msg;
          this.alertStatus = true;
        }
      } else {
        this.alertMsg = 'File too heavy.';
        this.alertStatus = true;
      }
    },
  },
};
</script>

<style>
.field-overflow {
  overflow-wrap: break-word;
  width: auto;
}
</style>
