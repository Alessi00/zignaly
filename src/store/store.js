import { createStore, applyMiddleware } from "redux";
import { cloneDeep } from "lodash";
import { persistStore, persistReducer, createMigrate } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";
import rootReducer from "../reducers/rootReducer";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import { composeWithDevTools } from "redux-devtools-extension";
import initialState from "./initialState";

/**
 * @typedef {import("redux").Action} Action
 * @typedef {import("redux-thunk").ThunkAction<void, Function, unknown, Action>} AppThunk
 * @typedef {import("redux-persist").PersistedState} PersistedState
 * @typedef {import("./initialState").DefaultState} DefaultState
 */

/**
 * @typedef {PersistedState & DefaultState} PersistedDefaultState
 */

const migrations = {
  2: (/** @type {PersistedDefaultState} */ state) => {
    return {
      ...state,
      ...cloneDeep(initialState),
    };
  },
  11: (/** @type {PersistedDefaultState} */ state) => {
    return {
      ...state,
      settings: {
        ...cloneDeep(initialState.settings),
      },
    };
  },
  13: (/** @type {PersistedDefaultState} */ state) => {
    return {
      ...state,
      settings: {
        ...state.settings,
        sort: { ...state.settings.sort, signalp: "" },
      },
    };
  },
  17: (/** @type {PersistedDefaultState} */ state) => {
    return {
      ...state,
      settings: {
        ...state.settings,
        displayColumns: {
          ...state.settings.displayColumns,
          futuresDailyBalance: [...initialState.settings.displayColumns.futuresDailyBalance],
          providerContracts: [...initialState.settings.displayColumns.providerContracts],
          providerOrders: [...initialState.settings.displayColumns.providerOrders],
        },
      },
    };
  },
};

const persistConfig = {
  key: "zignaly-webapp2",
  storage,
  stateReconciler: autoMergeLevel2,
  version: 17,
  migrate: createMigrate(migrations, { debug: false }),
  blacklist: ["ui", "views"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = createStore(persistedReducer, composeWithDevTools(applyMiddleware(thunk)));
export const persistor = persistStore(store);
