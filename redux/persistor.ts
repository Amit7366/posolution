// redux/persistor.ts

import {persistStore} from "redux-persist";
import { store } from "./store";



export const persistor = persistStore(store);
