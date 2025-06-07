import Client from "./client";

class AccountService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async createUserAccount(email, password, username, userImgSrc, city, state) {
    const data = await this.client.post("/api/accounts/signup", {
      email,
      password,
      username,
      userImgSrc,
      city,
      state,
    });
    return data;
  }

  async loginUser(email, password) {
    const data = await this.client.post("/api/accounts/login", {
      email,
      password,
    });
    return data;
  }

  async getUserInfo(userId) {
    const data = await this.client.get(`/api/accounts/${userId}`);
    return data;
  }

  async getUserFriends(userId) {
    const data = await this.client.get(`/api/accounts/${userId}/friends`);
    return data;
  }
}

export default AccountService;
