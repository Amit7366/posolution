// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import authReducer from "./slices/authSlice";
import sessionReducer from "./slices/sessionSlice"; // ✅ new
import storage from "./storage";
import { baseApi } from "./api/baseApi"; // ✅ RTK Query API

const rootReducer = combineReducers({
  auth: authReducer,
   session: sessionReducer,
  [baseApi.reducerPath]: baseApi.reducer, // ✅ RTK Query reducer
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth","session"], // Persist only auth slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware), // ✅ Add API middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
