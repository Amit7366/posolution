import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SessionState {
  startTime: number | null;
}

const initialState: SessionState = {
  startTime: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSessionStart: (state, action: PayloadAction<number>) => {
      state.startTime = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("sessionBeginning", action.payload.toString());
      }
    },
    loadSessionFromStorage: (state) => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("sessionBeginning");
        if (stored) state.startTime = Number(stored);
      }
    },
  },
});

export const { setSessionStart, loadSessionFromStorage } = sessionSlice.actions;
export default sessionSlice.reducer;
