import Client from "./client";

class UsersService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async exploreUsers() {
    const data = await this.client.get(`/api/users/explore`);
    return data;
  }

  async addFriend(friendId) {
    const data = await this.client.post(`/api/users/add-friend/${friendId}`);
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
}

export default UsersService;
