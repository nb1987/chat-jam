import { hashPassword } from "../utils/auth.js";

class Account {
  constructor(userName, email, passwordHash, userImgSrc, city, state) {
    this.userName = userName;
    this.email = email;
    this.passwordHash = passwordHash;
    this.userImgSrc = userImgSrc;
    this.city = city;
    this.state = state;
  }

  static createAccount(payload) {
    return new Account(
      payload.userName?.trim(),
      payload.email?.trim(),
      payload.password && hashPassword(payload.password),
      payload.userImgSrc || null,
      payload.city?.trim(),
      payload.state
    );
  }
}

export default Account;
