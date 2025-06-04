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

  async getUserInfo(userId) {
    const data = await this.client.get(`api/accounts/${userId}`);
    return data;
  }
}

export default AccountService;
