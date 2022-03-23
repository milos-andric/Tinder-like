export default class User {
  constructor(attrs = {}) {
    this.last_name = attrs.last_name;
    this.first_name = attrs.first_name;
    this.email = attrs.email;
    this.gender = attrs.gender;
    this.age = attrs.age;
    this.fame = attrs.fame;
    this.bio = attrs.bio;
  }
}
