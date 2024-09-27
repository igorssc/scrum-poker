import React, {
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { getCoordinates } from '../utils/getCoordinates';
import api from '../services/api';
import { RoomProps as RoomPropsProtocols } from '../protocols/Room';
import { MemberProps } from '../protocols/Member';
import { createContext } from 'use-context-selector';

type CreateRoomProps = {
  roomName: string;
  userName: string;
  theme: string;
};

type EnterRoomProps = {
  roomId: string;
  userName: string;
  access?: string;
};

type RoomProps = {
  id: string;
  owner_id: string;
  access: string;
};

type UserProps = {
  id: string;
};

type RoomContextProps = {
  room: RoomProps | null;
  user: UserProps | null;
  waitingLogin: boolean;
  setWaitingLogin: Dispatch<SetStateAction<boolean>>;
  createRoom: (props: CreateRoomProps) => Promise<void>;
  enterRoom: (props: EnterRoomProps) => Promise<void>;
  acceptUser: (userId: string) => Promise<void>;
  refuseUser: (userId: string) => Promise<void>;
  clear: () => void;
  logout: () => Promise<void>;
  isHydrated: boolean;
  tabId: string;
};

export const RoomContext = createContext<RoomContextProps>(
  {} as RoomContextProps,
);

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [room, setRoom] = useState<RoomProps | null>(() => {
    const savedRoom = localStorage.getItem('room');
    return savedRoom ? JSON.parse(savedRoom) : null;
  });

  const [user, setUser] = useState<UserProps | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [waitingLogin, setWaitingLogin] = useState(false);

  const [isHydrated, setIsHydrated] = useState(false);

  const channel = new BroadcastChannel('channel-scrum-poker');

  const [tabId] = useState(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (room) return localStorage.setItem('room', JSON.stringify(room));

    localStorage.removeItem('room');
  }, [room]);

  useEffect(() => {
    if (user) return localStorage.setItem('user', JSON.stringify(user));

    localStorage.removeItem('user');
  }, [user]);

  useEffect(() => {
    channel.onmessage = (message) => {
      if (message.data.tabId === tabId) return;

      if (message.data.type === 'login-scrum-poker') {
        window.location.replace('/');
      }
      if (message.data.type === 'waiting-login-scrum-poker') {
        window.location.replace(`/room/${message.data?.roomId}`);
        // window.location.replace();
      }
    };

    if (room) {
      channel.onmessage = (message) => {
        if (message.data.tabId === tabId) return;

        if (message.data.type === 'logout-scrum-poker') {
          waitingLogin
            ? window.location.replace(`/room/${room.id}`)
            : window.location.replace('/');
        }
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, room]);

  const createRoom = async ({ roomName, userName, theme }: CreateRoomProps) => {
    const { latitude, longitude } = await getCoordinates();

    try {
      const { data } = await api.post<RoomPropsProtocols>('rooms', {
        name: roomName,
        user_name: userName,
        lat: latitude,
        lng: longitude,
        theme,
      });

      const newRoom = {
        id: data.id,
        access: data.access,
        owner_id: data.owner_id,
      };

      const newUser = {
        id: newRoom.owner_id,
      };

      setRoom(newRoom);
      setUser(newUser);

      channel.postMessage({ type: 'login-scrum-poker', tabId });
    } catch (error) {
      console.error(error);
    }
  };

  const enterRoom = async ({ roomId, userName, access }: EnterRoomProps) => {
    try {
      channel.postMessage({ type: 'waiting-login-scrum-poker', roomId, tabId });
      setWaitingLogin(true);

      const { data } = await api.post<{
        room: RoomProps;
        member: MemberProps;
        user: UserProps;
      }>(`rooms/${roomId}/sign-in`, { user_name: userName, access });

      const newRoom = {
        id: data.room.id,
        access: data.room.access,
        owner_id: data.room.owner_id,
      };

      const newUser = {
        id: data.user.id,
      };

      setRoom(newRoom);
      setUser(newUser);
    } catch (error) {
      console.error(error);
    }
  };

  const acceptUser = async (userId: string) => {
    if (room && user) {
      await api.post(`rooms/${room.id}/sign-in/accept`, {
        owner_id: user.id,
        user_id: userId,
        access: room.access,
      });
    }
  };

  const refuseUser = async (userId: string) => {
    if (room && user) {
      try {
        await api.post(`rooms/${room.id}/sign-out`, {
          user_action_id: user.id,
          user_id: userId,
          room_id: room.id,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const clear = () => {
    setRoom(null);
    setUser(null);
  };

  const logout = async () => {
    if (room && user) {
      await api.post(`rooms/${room.id}/sign-out`, {
        user_action_id: user.id,
        user_id: user.id,
        room_id: room.id,
      });

      setRoom(null);
      setUser(null);
      setWaitingLogin(false);

      channel.postMessage({ type: 'logout-scrum-poker', tabId });
    }
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        user,
        createRoom,
        enterRoom,
        acceptUser,
        refuseUser,
        clear,
        logout,
        isHydrated,
        waitingLogin,
        tabId,
        setWaitingLogin,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
