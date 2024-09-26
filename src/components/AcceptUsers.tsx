import { useEffect, useState } from 'react';
import { useRoomStore } from '../hooks/useRoom';
import { useWebsocket } from '../hooks/useWebsocket';

type UserProps = {
  id: string;
  name: string;
};

type SignInEventProps = {
  type: string;
  data: {
    user: {
      status: string;
      member: UserProps;
    };
  };
};

type SignInAcceptEventProps = {
  type: string;
  data: {
    user: {
      user_id: string;
    };
  };
};

type SignOutEventProps = {
  type: string;
  data: {
    user: {
      id: string;
    };
  };
};

export const AcceptUsers = () => {
  const { socket } = useWebsocket();

  const { room, acceptUser, refuseUser } = useRoomStore();

  const [users, setUser] = useState<UserProps[]>([]);

  useEffect(() => {
    socket.on(room?.id!!, (event) => {
      console.log(event);

      if (event.type === 'sign-in') {
        return setUser((prev) => {
          if ((event as SignInEventProps).data.user.status === 'LOGGED')
            return prev;

          const { id, name } = (event as SignInEventProps).data.user.member;

          const userAlreadyExists = prev.some((user) => user.id === id);

          if (userAlreadyExists) return prev;

          return [...prev, { id, name }];
        });
      }

      if (event.type === 'sign-in-accept') {
        return setUser((prev) => {
          const { user_id } = (event as SignInAcceptEventProps).data.user;

          const users = prev.filter((user) => user.id !== user_id);

          return users;
        });
      }

      if (event.type === 'sign-out') {
        return setUser((prev) => {
          const { id } = (event as SignOutEventProps).data.user;

          const users = prev.filter((user) => user.id !== id);

          return users;
        });
      }
    });

    return () => {
      socket.off(room?.id!!);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  return (
    <>
      {users.map((user) => (
        <div
          key={user.id}
          className="flex flex-col justify-center items-center gap-3 mt-5 border"
        >
          {user.name}
          <button onClick={() => acceptUser(user.id)}>aceitar</button>
          <button onClick={() => refuseUser(user.id)}>recusar</button>
        </div>
      ))}
    </>
  );
};
