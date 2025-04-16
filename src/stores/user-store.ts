import { create } from "zustand";


interface UserState {
  loading: boolean;
  data: any;
  error: string | null;
  setData: (data: any) => void;
}

const userStore = create<UserState>((set) => ({
  loading: false,
  data: null,
  error: null,
  setData(data) {
    set({ data });
  },
}));

export default userStore;
