import { useState, useEffect } from "react";
import UsersService from "@frontend/services/users.service";

export default function useBlockStatusHooks(friendId, authContext) {
  const [blockFriend, setBlockFriend] = useState(null);

  useEffect(() => {
    const fetchBlockStatus = async () => {
      const abortController = new AbortController();
      const usersService = new UsersService(abortController, authContext);
      const didBlock = await usersService.hasUserBlockedFriend(friendId);
      setBlockFriend(didBlock);
    };

    fetchBlockStatus();
  }, [friendId, authContext]);

  return [blockFriend, setBlockFriend];
}
