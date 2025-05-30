class User {
  constructor(
    id,
    nickname,
    email,
    passwordHash,
    age,
    gender,
    user_img,
    city,
    state
  ) {
    this.id = id;
    this.nickname = nickname;

    this.email = email;
    this.passwordHash = passwordHash;
    this.permissions = permissions;
    this.age = age;
    this.gender = gender;
    this.user_img = user_img;
    this.city = city;
    this.state = state;
  }
}
