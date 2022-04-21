<template>
  <div class="mx-auto col-4 h-100" style="min-width: 300px">
    <NuxtLink to="/user">Edit avatar</NuxtLink>

    <h2>Personal informations</h2>

    <form method="post" @submit.prevent="updateInfo">
      <div class="form-outline mb-4">
        <label class="form-label">First name</label>
        <input
          v-model="first_name"
          type="text"
          class="form-control form-control-lg"
          name="first_name"
          required
        />
      </div>

      <div class="form-outline mb-4">
        <label class="form-label">Last name</label>
        <input
          v-model="last_name"
          type="text"
          class="form-control form-control-lg"
          name="last_name"
          required
        />
      </div>

      <div class="form-outline mb-4">
        <label class="form-label">Username</label>
        <input
          v-model="user_name"
          type="text"
          class="form-control form-control-lg"
          name="user_name"
          required
        />
      </div>

      <div class="form-outline mb-4">
        <label class="form-label">Email</label>
        <input
          v-model="email"
          type="email"
          class="form-control form-control-lg"
          name="email"
          required
        />
      </div>
      <div class="form-outline mb-4">
        <label class="form-label">Localisation</label>
        <input
          v-model="ville"
          class="form-control form-control-lg"
          name="ville"
        />
      </div>
      <div v-if="displayCoord">
        <p class="coord">Latitude : {{ latitude }}</p>
        <p class="coord">Longitude : {{ longitude }}</p>
      </div>

      <div class="form-outline mb-4">
        <label for="birth_date" class="form-label">Birth date</label>

        <b-form-datepicker
          id="birth_date"
          v-model="birth_date"
          class="mb-2"
          :max="max_date"
          locale="fr"
        ></b-form-datepicker>
      </div>

      <div class="form-outline mb-4">
        <label class="form-label">Gender</label>
        <div class="d-flex">
          <div
            class="d-flex flex-column align-items-center justify-content-center flex-fill"
          >
            <input
              id="male"
              v-model="gender"
              type="radio"
              class="form-control form-control-lg mb-2"
              name="gender"
              value="0"
              required
            />
            <label for="male">Male</label>
          </div>

          <div
            class="d-flex flex-column align-items-center justify-content-center flex-fill"
          >
            <input
              id="female"
              v-model="gender"
              type="radio"
              class="form-control form-control-lg mb-2"
              name="gender"
              value="1"
              required
            />
            <label for="female">Female</label>
          </div>
        </div>
      </div>

      <div class="form-outline mb-4">
        <label class="form-label">Orientation</label>
        <div class="d-flex">
          <div
            class="d-flex flex-column align-items-center justify-content-center flex-fill"
          >
            <input
              id="male"
              v-model="orientation"
              type="radio"
              class="form-control mb-2"
              name="orientation"
              value="0"
              required
            />
            <label for="male">Male</label>
          </div>

          <div
            class="d-flex flex-column align-items-center justify-content-center flex-fill"
          >
            <input
              id="female"
              v-model="orientation"
              type="radio"
              class="form-control mb-2"
              name="orientation"
              value="1"
              required
            />
            <label for="female">Female</label>
          </div>

          <div
            class="d-flex flex-column align-items-center justify-content-center flex-fill"
          >
            <input
              id="both"
              v-model="orientation"
              type="radio"
              class="form-control mb-2"
              name="orientation"
              value="2"
              required
            />
            <label for="both">Both</label>
          </div>
        </div>
      </div>

      <div class="form-outline mb-4">
        <label for="bio" class="form-label">Biography</label>

        <b-form-textarea
          id="bio"
          v-model="bio"
          placeholder="Enter something..."
          rows="3"
          max-rows="6"
          class="form-control form-control-lg"
        ></b-form-textarea>
      </div>

      <div class="form-outline mb-4">
        <label for="tags-basic" class="form-label">
          Type a new tag and press enter
        </label>
        <TagSuggestions numberOfTags="5" @loadTag="loadTag" />
        <b-form-tags v-model="tags" input-id="tags-basic"></b-form-tags>
      </div>

      <b-alert v-model="alertStatus" variant="danger" dismissible class="mt-3">
        {{ errorMsg }}
      </b-alert>

      <b-alert
        v-model="successStatus"
        variant="success"
        dismissible
        class="mt-3"
      >
        Your informations have successfully been updated
      </b-alert>

      <div class="text-lg-start mt-4 pt-2">
        <button
          type="submit"
          class="btn btn-primary btn-lg"
          style="padding-left: 2.5rem; padding-right: 2.5rem"
        >
          Save
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    const maxDate = new Date();
    maxDate.setYear(maxDate.getFullYear() - 18);

    return {
      first_name: '',
      last_name: '',
      user_name: '',
      email: '',
      birth_date: null,
      max_date: maxDate,
      gender: 0,
      orientation: 2,
      latitude: '',
      longitude: '',
      ville: '',
      bio: '',
      displayCoord: false,
      tags: [],

      alertStatus: false,
      successStatus: false,
      errorMsg: '',
    };
  },
  async beforeMount() {
    await this.getInfo();
  },
  methods: {
    async getInfo() {
      await this.$axios.get('/me').then(e => {
        this.first_name = e.data.first_name;
        this.last_name = e.data.last_name;
        this.user_name = e.data.user_name;
        this.email = e.data.email;
        this.gender = e.data.gender;
        if (e.data.age) {
          const format = new Date(Date.parse(e.data.age));
          this.birth_date = format.toISOString().split('T')[0];
        }
        this.orientation = e.data.orientation;
        this.bio = e.data.bio;
        this.tags = e.data.tags;
        this.ville = e.data.ville + ' ' + e.data.zip;
        this.latitude = e.data.latitude;
        this.longitude = e.data.longitude;
        if (e.data.latitude) {
          this.displayCoord = true;
        } else {
          this.displayCoord = false;
        }
      });
    },
    async updateInfo() {
      try {
        let tmpVille;
        if (this.ville.trim() !== '') {
          tmpVille = this.ville;
        }
        await this.$axios.post('updateUserInfo', {
          first_name: this.first_name,
          last_name: this.last_name,
          user_name: this.user_name,
          email: this.email,
          birth_date: this.birth_date,
          gender: this.gender,
          orientation: this.orientation,
          bio: this.bio,
          tags: this.tags,
          ville: tmpVille,
        });
        this.successStatus = true;
        this.alertStatus = false;
        await this.getInfo();
      } catch (e) {
        this.errorMsg = e.response.data.msg;
        this.successStatus = false;
        this.alertStatus = true;
      }
    },
    loadTag(tag) {
      this.tags.push(tag);
    },
  },
};
</script>
<style>
.coord {
  color: grey;
  size: 0.7rem;
}
</style>
