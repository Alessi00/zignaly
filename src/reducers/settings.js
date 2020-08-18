import initialState from "../store/initialState";
import {
  SELECT_LANGUAGE,
  SET_SELECTED_EXCHANGE,
  SET_DISPLAY_COLUMN,
  SET_SORT_COLUMN,
  SELECT_THEME,
  UNSET_SELECTED_EXCHANGE,
  TOGGLE_BALANCE_BOX,
  SET_ROWS_PER_PAGE,
  SET_TIMEFRAME,
  SET_SORT,
  SET_FILTERS,
  SET_RESPONSIVE_TABLE,
  SET_TERMINAL_PAIR,
  SET_TERMINAL_PROVIDER,
} from "../store/actions/settings";
import { createReducer } from "@reduxjs/toolkit";

/**
 * @typedef {import("../store/initialState").DefaultStateSettings} StateSettingsType
 * @typedef {import("../store/initialState").DisplayColumns} DisplayColumns
 * @typedef {import("../store/actions/settings").SetTimeFrameAction} SetTimeFrameAction
 * @typedef {import("../store/actions/settings").SetSortAction} SetSortAction
 * @typedef {import("../store/actions/settings").SetFiltersAction} SetFiltersAction
 * @typedef {import("../store/actions/settings").SetSortColumnAction} SetSortColumnAction
 * @typedef {import("../store/actions/settings").SetResponsiveTableAction} SetResponsiveTableAction
 * @typedef {import("../store/actions/settings").SetTerminalPairAction} SetTerminalPairAction
 * @typedef {import("../store/actions/settings").SetTerminalProviderAction} SetTerminalProviderAction
 */

/**
 * @typedef {Object} ActionObject
 * @property {String} type
 * @property {*} payload
 */

/**
 * @returns {StateSettingsType} New settings state.
 */
const settings = createReducer(initialState.settings, {
  [SELECT_LANGUAGE]: (state, action) => {
    state.languageCode = action.payload;
  },

  [SELECT_THEME]: (state, action) => {
    state.darkStyle = action.payload;
  },

  [TOGGLE_BALANCE_BOX]: (state, action) => {
    state.balanceBox = action.payload;
  },

  [SET_SELECTED_EXCHANGE]: (state, action) => {
    state.selectedExchange = action.payload;
  },

  [UNSET_SELECTED_EXCHANGE]: (state) => {
    state.selectedExchange = initialState.settings.selectedExchange;
  },

  [SET_DISPLAY_COLUMN]: (state, action) => {
    /**
     * @type {keyof DisplayColumns} table
     */
    const table = action.payload.table;
    const { changedColumn, action: userAction } = action.payload;

    if (userAction === "add") {
      // Add column to displayed list
      state.displayColumns[table].push(changedColumn);
    } else {
      // Remove column to displayed list
      state.displayColumns[table] = state.displayColumns[table].filter((c) => c !== changedColumn);
    }
  },

  [SET_SORT_COLUMN]: (state, /** @type {SetSortColumnAction} */ action) => {
    const { table, name, direction } = action.payload;
    state.sortColumns[table] = { name, direction };
  },

  [SET_RESPONSIVE_TABLE]: (state, /** @type {SetResponsiveTableAction} */ action) => {
    const { table, responsive } = action.payload;
    state.responsiveTables[table] = responsive;
  },

  [SET_ROWS_PER_PAGE]: (state, action) => {
    const { table, numberOfRows } = action.payload;
    state.rowsPerPage = { ...state.rowsPerPage, [table]: numberOfRows };
  },

  [SET_SORT]: (state, /** @type {SetSortAction} */ action) => {
    const { page, sort } = action.payload;
    state.sort[page] = sort;
  },

  [SET_FILTERS]: (state, /** @type {SetFiltersAction} */ action) => {
    const { page, filters } = action.payload;
    // @ts-ignore
    state.filters[page] = {
      ...state.filters[page],
      ...filters,
    };
  },

  [SET_TIMEFRAME]: (state, /** @type {SetTimeFrameAction} */ action) => {
    const { page, timeFrame } = action.payload;
    // @ts-ignore Analytics timeframes use string instead of numbers
    state.timeFrame[page] = timeFrame;
  },

  [SET_TERMINAL_PAIR]: (state, /** @type {SetTerminalPairAction} */ action) => {
    const { exchangeId, pair } = action.payload;
    state.tradingTerminal.pair[exchangeId] = pair;
  },

  [SET_TERMINAL_PROVIDER]: (state, /** @type {SetTerminalProviderAction} */ action) => {
    state.tradingTerminal.provider = action.payload;
  },
});

export default settings;
