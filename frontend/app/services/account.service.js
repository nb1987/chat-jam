import Client from "./client";

class AccountService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async createUserAccount(formData) {
    const data = await this.client.post("/api/accounts/signup", formData);
    return data;
  }

  async loginUser(email, password) {
    const data = await this.client.post("/api/accounts/login", {
      email,
      password,
    });
    return data;
  }

  async resetPasswordRequest(email) {
    const data = await this.client.post("/api/accounts/reset-password", {
      email,
    });
    return data;
  }

  async updatePassword(resetToken, password) {
    const data = await this.client.post("/api/accounts/update-password", {
      resetToken,
      password,
    });

    return data;
  }

  async changePassword(password) {
    const data = await this.client.patch("/api/accounts/change-password", {
      password,
    });

    return data;
  }

  async getTokenPair(refreshToken) {
    const data = await this.client.post("/api/accounts/refresh-tokens", {
      refreshToken,
    });
    return data;
  }

  async getUserInfo() {
    const data = await this.client.get(`/api/accounts/user`);
    return data;
  }

  async editUserAccount(formData) {
    const data = await this.client.patch(
      "/api/accounts/edit-profile",
      formData
    );
    return data;
  }

  async deleteAccount() {
    await this.client.delete("/api/accounts/delete-account");
  }
}

export default AccountService;
