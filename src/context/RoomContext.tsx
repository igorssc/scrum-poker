import {
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
import { usePathname } from 'next/navigation';
import { AxiosResponse } from 'axios';

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

type GetRoomsByLocationProps = {
  lat: number;
  lng: number;
  distance: number;
};

type RoomProps = {
  id: string;
  owner_id: string;
  access: string;
};

type UserProps = {
  id: string;
};

type LogoutProps = { redirect?: string };

type RoomContextProps = {
  room: RoomProps | null;
  user: UserProps | null;
  waitingLogin: boolean;
  setWaitingLogin: Dispatch<SetStateAction<boolean>>;
  createRoom: (props: CreateRoomProps) => Promise<void>;
  enterRoom: (props: EnterRoomProps) => Promise<void>;
  acceptUser: (userId: string) => Promise<void>;
  refuseUser: (userId: string) => Promise<void>;
  getRoomsByLocation: ({
    distance,
    lat,
    lng,
  }: GetRoomsByLocationProps) => Promise<AxiosResponse<any, any>>;
  clear: () => void;
  logout: (props?: LogoutProps) => Promise<void>;
  isHydrated: boolean;
  tabId: string;
};

export const RoomContext = createContext<RoomContextProps>(
  {} as RoomContextProps,
);

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [room, setRoom] = useState<RoomProps | null>(null);
  const [user, setUser] = useState<UserProps | null>(null);

  const [waitingLogin, setWaitingLogin] = useState(false);

  const [isHydrated, setIsHydrated] = useState(false);

  const pathname = usePathname();

  const channel = new BroadcastChannel('channel-scrum-poker');

  const [tabId] = useState(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    const savedRoom = localStorage.getItem('room');
    const savedUser = localStorage.getItem('user');
    const savedWaitingLogin = localStorage.getItem('waitingLogin');

    if (savedRoom) {
      setRoom(JSON.parse(savedRoom));
    }

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    if (savedWaitingLogin) {
      setWaitingLogin(JSON.parse(savedWaitingLogin));
    }

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
    if (waitingLogin)
      return localStorage.setItem('waitingLogin', JSON.stringify(waitingLogin));

    localStorage.removeItem('waitingLogin');
  }, [waitingLogin]);

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

      if (message.data.type === 'logout-scrum-poker') {
        clear();
        setWaitingLogin(false);

        window.location.replace(message.data.redirect);
      }
    };

    if (room && pathname === '') {
      channel.postMessage({ type: 'login-scrum-poker', tabId });
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

  const getRoomsByLocation = async ({
    distance,
    lat,
    lng,
  }: GetRoomsByLocationProps) => {
    const rooms = await api.get(
      `rooms/location?lat=${lat}&lng=${lng}&max_distance=${distance}`,
    );

    return rooms;
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
        await api.post(`rooms/${room.id}/sign-in/refuse`, {
          owner_id: user.id,
          user_id: userId,
          access: room.access,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const clear = () => {
    setRoom(null);
    setUser(null);
    setWaitingLogin(false);
  };

  const logout = async ({ redirect = '/' } = {}) => {
    if (room && user) {
      await api.post(`rooms/${room.id}/sign-out`, {
        user_action_id: user.id,
        user_id: user.id,
        room_id: room.id,
      });
    }

    setRoom(null);
    setUser(null);
    setWaitingLogin(false);

    channel.postMessage({ type: 'logout-scrum-poker', redirect, tabId });
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
        getRoomsByLocation,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
