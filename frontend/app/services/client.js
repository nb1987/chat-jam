import axios from "axios";
import Cookies from "js-cookie";

class Client {
  constructor(abortController, authContext) {
    this.abortController = abortController;
    this.authContext = authContext;
    this.axios = axios.create({
      withCredentials: true,
      signal: this.abortController.signal,
      headers: authContext.accessToken
        ? {
            Authorization: `Bearer ${authContext.accessToken}`,
          }
        : {},
    });
  }

  async get(endpoint) {
    const response = await this.axios.get(endpoint);
    return response.data;
  }

  async post(endpoint, payload) {
    const response = await this.axios.post(endpoint, payload);
    return response.data;
  }

  async refreshAccessToken() {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) throw new Error("No refresh token found");

    const res = await axios.post(
      "/api/accounts/tokens",
      {
        refreshToken,
      },
      { withCredentials: true }
    );

    const { accessToken, refreshToken: newRefresh } = res.data;

    // store new tokens
    Cookies.set("refreshToken", newRefresh, {
      secure: true,
      sameSite: "Strict",
      expires: 14,
    });

    this.authContext.setAccessToken(accessToken);
    this.axios.defaults.headers.Authorization = `Bearer ${accessToken}`;

    return accessToken;
  }
}

export default Client;
