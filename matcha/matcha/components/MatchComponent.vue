<template>
  <div id="matchContainer" class="col-10 m-auto d-flex flex-column">
    <div class="w-100 match100">
      <div class="swiper h-100">
        <div class="swiper-wrapper">
          <div
            v-for="user in users"
            :key="user.user_id"
            class="profile position-relative overflow-hidden mb-5 swiper-slide"
          >
            <div id="profile-image" class="position-absolute"></div>

            <div
              id="profile-info"
              class="position-absolute d-flex justify-content-between align-items-end"
            >
              <div>
                <h2 class="nameAge">
                  {{ user.first_name + getAge(user) }}
                </h2>
                <h3 class="location">
                  {{ getDistance(user) + ' (' + user.ville + ')' }}
                </h3>
              </div>
              <b-link :to="'/user/' + user.user_id">
                <font-awesome-icon icon="circle-info" color="white" />
              </b-link>
            </div>

            <img
              :src="
                user.profile_pic ||
                'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Reuni%C3%A3o_com_o_ator_norte-americano_Keanu_Reeves_%2846806576944%29_%28cropped%29.jpg/260px-Reuni%C3%A3o_com_o_ator_norte-americano_Keanu_Reeves_%2846806576944%29_%28cropped%29.jpg'
              "
              class="swiper-lazy h-100 w-100"
              style="object-fit: cover"
              alt="Responsive image"
            />
          </div>
        </div>

        <div class="swiper-button-next"></div>
      </div>
    </div>

    <div
      v-if="users.length"
      class="d-flex justify-content-around align-items-end mt-4"
    >
      <font-awesome-icon
        id="icon-match-dislike"
        icon="xmark"
        @click="dislike()"
      />
      <font-awesome-icon id="icon-match-like" icon="fire" @click="like()" />
    </div>
    <div v-else class="col-10 m-auto text-center">
      <h1>No users to show you yet</h1>
    </div>
    <MatchSearch @updateList="updateList" />
    <b-form-group v-slot="{ ariaDescribedby }" label="Sorting">
      <b-form-radio
        v-model="sort"
        :aria-describedby="ariaDescribedby"
        name="some-radios"
        class="unselectable"
        value="location"
        checked
        >Sort by location</b-form-radio
      >
      <b-form-radio
        v-model="sort"
        :aria-describedby="ariaDescribedby"
        name="some-radios"
        class="unselectable"
        value="age"
        >Sort by Age</b-form-radio
      >
      <b-form-radio
        v-model="sort"
        :aria-describedby="ariaDescribedby"
        name="some-radios"
        class="unselectable"
        value="fame"
      >
        Sort by Fame</b-form-radio
      >
      <b-form-radio
        v-model="sort"
        :aria-describedby="ariaDescribedby"
        name="some-radios"
        class="unselectable"
        value="tags"
      >
        Sort by Tags</b-form-radio
      >
    </b-form-group>
  </div>
</template>

<script>
import { Swiper, Navigation, EffectCards, Lazy } from 'swiper';
import 'swiper/swiper-bundle.min.css';

export default {
  data() {
    return {
      users: [],
      selected: 0,
      ip: null,
      swiper: null,
      search: {},
      sort: 'location',
    };
  },
  mounted() {
    Swiper.use([Navigation, EffectCards, Lazy]);

    this.swiper = new Swiper('.swiper', {
      effect: 'cards',

      preloadImages: false,
      lazy: true,

      grabCursor: true,
      direction: 'horizontal',
      allowSlidePrev: false,

      navigation: {
        nextEl: '.swiper-button-next',
      },
    });

    this.swiper.on('slideChange', async e => {
      this.selected = e.activeIndex;

      // Set new users as viewed
      await this.view();

      // Generate new recommandation when no left
      if (e.activeIndex + 1 === this.users.length) {
        const res = await this.generateMatches();
        this.users = [...this.users, ...res.data];
        this.$nextTick(() => this.swiper.update());
      }
    });
  },
  async beforeMount() {
    const res = await this.generateMatches();
    this.users = res.data;

    if (this.users.length !== 0) await this.view();
  },
  methods: {
    async like() {
      await this.$axios.post('like', {
        targetId: this.users[this.selected].user_id,
      });
      await this.swiper.slideNext();
    },
    async view() {
      await this.$axios.post('view', {
        targetId: this.users[this.selected].user_id,
      });
    },
    async generateMatches() {
      const search = this.search;
      search.order = this.sort;
      const res = await this.$axios.post('matchFilter', { search });
      return res;
    },
    dislike() {
      this.swiper.slideNext();
    },
    getDistance(user) {
      if (user.distance) {
        return 'à ' + Math.round(user.distance) + ' km';
      } else {
        return '';
      }
    },
    getAge(user) {
      if (user.age)
        return (
          ', ' +
          (new Date().getFullYear() - new Date(user.age).getFullYear()) +
          ' ans'
        );
      else return '';
    },
    async updateList(search) {
      this.search = search;
      const res = await this.generateMatches();
      this.users = res.data;

      this.$nextTick(() => this.swiper.update());
    },
  },
};
</script>

<style>
#matchContainer {
  max-width: 750px;
}
.match100 {
  height: 80%;
}
.profile {
  border-radius: 20px;
}
#profile-info {
  width: 100%;
  font-size: 5vw;
  bottom: 0;
  color: white;
  padding: 3%;
}
.nameAge {
  font-size: 2rem;
}
.location {
  font-size: 1.5rem;
}

@media (min-width: 1600px) {
  #profile-info {
    font-size: 75px;
    padding: 3%;
  }
}
#profile-image {
  box-shadow: inset 0px 0px 50px 25px rgba(0, 0, 0, 0.9);
  height: 100%;
  width: 120%;
  margin-left: -10%;
  margin-right: -10%;
}
#icon-match-like {
  width: 10%;
  height: 100%;
  max-width: 100px;
  cursor: pointer;
  color: greenyellow;
}
#icon-match-dislike {
  width: 10%;
  height: 100%;
  max-width: 100px;
  cursor: pointer;
  color: rgb(255, 85, 47);
}
.image {
  min-height: 100px;
  min-width: 100px;
}
.unselectable {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
