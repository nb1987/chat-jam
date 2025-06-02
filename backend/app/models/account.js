import { hashPassword } from "../utils/auth.js";

class Account {
  constructor(username, email, passwordHash, userImgSrc, city, state) {
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.userImgSrc = userImgSrc;
    this.city = city;
    this.state = state;
  }

  static createAccount(payload) {
    return new Account(
      payload.username?.trim(),
      payload.email?.trim(),
      payload.password && hashPassword(payload.password),
      payload.userImgSrc || null,
      payload.city?.trim(),
      payload.state
    );
  }
}

export default Account;
