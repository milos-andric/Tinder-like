<template>
  <div class="mx-auto col-4 h-100">
    <h2>Personal informations</h2>

    <form method="post" @submit.prevent="register">
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
        <label class="form-label">Password</label>
        <input
          v-model="password"
          type="password"
          class="form-control form-control-lg"
          name="password"
          required
        />
      </div>

      <div class="form-outline mb-4">
        <label class="form-label">Gender</label>
        <div class="d-flex">
          <div
            class="
              d-flex
              flex-column
              align-items-center
              justify-content-center
              flex-fill
            "
          >
            <input
              id="man"
              v-model="gender"
              type="radio"
              class="form-control form-control-lg mb-2"
              name="gender"
              value="0"
              required
            />
            <label for="man">Man</label>
          </div>

          <div
            class="
              d-flex
              flex-column
              align-items-center
              justify-content-center
              flex-fill
            "
          >
            <input
              id="woman"
              v-model="gender"
              type="radio"
              class="form-control form-control-lg mb-2"
              name="gender"
              value="1"
              required
            />
            <label for="woman">Woman</label>
          </div>
        </div>
      </div>

      <div class="form-outline mb-4">
        <label class="form-label">Orientation</label>
        <div class="d-flex">
          <div
            class="
              d-flex
              flex-column
              align-items-center
              justify-content-center
              flex-fill
            "
          >
            <input
              id="man"
              v-model="orientation"
              type="radio"
              class="form-control mb-2"
              name="orientation"
              value="0"
              required
            />
            <label for="man">Man</label>
          </div>

          <div
            class="
              d-flex
              flex-column
              align-items-center
              justify-content-center
              flex-fill
            "
          >
            <input
              id="woman"
              v-model="orientation"
              type="radio"
              class="form-control mb-2"
              name="orientation"
              value="1"
              required
            />
            <label for="woman">Woman</label>
          </div>

          <div
            class="
              d-flex
              flex-column
              align-items-center
              justify-content-center
              flex-fill
            "
          >
            <input
              id="bi"
              v-model="orientation"
              type="radio"
              class="form-control mb-2"
              name="orientation"
              value="2"
              required
            />
            <label for="bi">Bi</label>
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


      <vue-tags-input
        v-model="tag"
        class="mb-4"
        :tags="tags"
        @tags-changed="newTags => tags = newTags"
      />

      <b-form-file
        v-model="uploadedImg"
        :state="Boolean(uploadedImg)"
        placeholder="Choose a file or drop it here..."
        drop-placeholder="Drop file here..."
      ></b-form-file>

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
import VueTagsInput from '@johmun/vue-tags-input';

export default {
  components: {
    VueTagsInput,
  },
  data() {
    return {
      first_name: '',
      last_name: '',
      user_name: '',
      email: '',
      password: '',
      gender: 0,
      orientation: 2,
      bio: '',
      tag: '',
      tags: [],
      uploadedImg: null,
      error: null,
    }
  },

  methods: {
    async register() {
      try {
        await this.$axios.post('register', {
          first_name: this.first_name,
          last_name: this.last_name,
          user_name: this.user_name,
          email: this.email,
          password: this.password,
          gender: this.gender,
        })

        this.$router.push('/')
      } catch (e) {
        this.error = e.response.data.message
      }
    },
  },
}
</script>
