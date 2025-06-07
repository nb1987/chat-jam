import axios from "axios";
import Cookies from "js-cookie";

// make API requests
class Client {
  constructor(abortController, authContext) {
    this.abortController = abortController;
    this.authContext = authContext;
    this.axios = axios.create({
      withCredentials: true, //cookies are sent.
      signal: this.abortController.signal, // allow request abortion.
      headers: {},
    });

    if (authContext.accessToken) {
      this.axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${authContext.accessToken}`;
    }
  } // set a default header & every request uses it automatically.

  async refreshAccessToken() {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) throw new Error("No refresh token found");

    const res = await axios.post(
      "/api/accounts/refresh-tokens",
      { refreshToken },
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

  async get(endpoint) {
    const response = await this.axios.get(endpoint);
    return response.data;
  }

  async post(endpoint, payload) {
    const response = await this.axios.post(endpoint, payload);
    return response.data;
  }

  async patch(endpoint, payload) {
    const response = await this.axios.patch(endpoint, payload);
    return response.data;
  }

  async delete(endpoint, payload) {
    const response = await this.axios.delete(endpoint, payload);
    return response.data;
  }

  async makeRequest(requestFn, isRetry = false) {
    try {
      const res = await requestFn();
      return res.data;
    } catch (err) {
      const isUnauthorized = err.response?.status === 401;

      if (!isRetry && isUnauthorized) {
        try {
          await this.refreshAccessToken();
          return await this.makeRequest(requestFn, true);
        } catch (refreshErr) {
          console.error("Refresh failed", refreshErr.message);
          throw refreshErr;
        }
      }
    }
  }
}

export default Client;
