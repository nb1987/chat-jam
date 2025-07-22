import Client from "./client";

class UsersService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async getUserFriends() {
    const data = await this.client.get(`/api/users/friends`);
    return data;
  }

  async exploreUsers() {
    const data = await this.client.get(`/api/users/explore`);
    return data;
  }

  async addFriend(friendId) {
    const data = await this.client.post(`/api/users/add-friend/${friendId}`);
    return data;
  }

  async removeFriend(friendId) {
    const data = await this.client.delete(
      `/api/users/remove-friend/${friendId}`
    );
    return data;
  }

  async blockFriend(friendId) {
    const data = await this.client.post(`/api/users/block-friend/${friendId}`);
    return data;
  }

  async unblockFriend(friendId) {
    const data = await this.client.delete(
      `/api/users/unblock-friend/${friendId}`
    );
    return data;
  }

  async searchUserByEmail(email) {
    const data = await this.client.get(`/api/users/search-by-email/${email}`);
    return data;
  }

  async searchUserByUsername(username) {
    const data = await this.client.get(
      `/api/users/search-by-username/${username}`
    );
    return data;
  }

  // is user blocked by someone?
  async getBlockStatus(friendId) {
    const data = await this.client.get(
      `/api/users/is-sender-blocked/${friendId}`
    );
    return data;
  }

  async hasUserBlockedFriend(friendId) {
    const data = await this.client.get(
      `/api/users/did-sender-block-friend/${friendId}`
    );
    return data;
  }
}

export default UsersService;
