import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";
// import reducer from "../reducer";
import { configureStore, getDefaultMiddleware, combineReducers } from "@reduxjs/toolkit";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import auth from "../reducer/auth";
import azureCommunicationData from "../reducer/chatDataSlice";
import homePageDetails from "../reducer/homePageSlice";
import publicDataDetails from "../reducer/publicDataSlice";

const persistConfig = {
  key: "persist-key",
  version: 1,
  storage: storage,
};

const reducer = combineReducers({
  authData: auth,
  chatDetails: azureCommunicationData,
  homePageDetails: homePageDetails,
  publicData: publicDataDetails,
})

const persistedReducer = persistReducer(persistConfig, reducer);

const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: [thunk],
});

export default store;
