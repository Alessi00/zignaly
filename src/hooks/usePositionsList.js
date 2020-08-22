import { useState, useEffect, useRef } from "react";
import useStoreSessionSelector from "./useStoreSessionSelector";
import tradeApi from "../services/tradeApiClient";
import useInterval from "./useInterval";
import { assign, cloneDeep, filter, isEmpty, isFunction, omitBy, partial } from "lodash";
import useStoreSettingsSelector from "./useStoreSettingsSelector";
import { useDispatch } from "react-redux";
import { showErrorAlert } from "../store/actions/ui";
import { setFilters as setFiltersAction } from "../store/actions/settings";
import useStoreViewsSelector from "./useStoreViewsSelector";
import { useMediaQuery } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import useFilters from "./useFilters";

/**
 * @typedef {import("../services/tradeApiClient.types").UserPositionsCollection} UserPositionsCollection
 * @typedef {import("../services/tradeApiClient.types").PositionEntity} PositionEntity
 * @typedef {"open" | "closed" | "log" | "profileOpen" | "profileClosed"} PositionsCollectionType
 * @typedef {import('../components/CustomSelect/CustomSelect').OptionType} OptionType
 */

/**
 * @typedef {Object} HookPositionsListData
 * @property {UserPositionsCollection} positionsAll
 * @property {UserPositionsCollection} positionsFiltered
 * @property {Function} setFilters
 * @property {PositionsFiltersState} filtersState
 * @property {Boolean} loading
 * @property {Function} flagPositionUpdating
 * @property {Boolean} filtersVisibility
 * @property {Function} setFiltersVisibility
 */

/**
 * @typedef {Object} PositionsState
 * @property {UserPositionsCollection} open
 * @property {UserPositionsCollection} closed
 * @property {UserPositionsCollection} log
 * @property {UserPositionsCollection} profileOpen
 * @property {UserPositionsCollection} profileClosed
 */

/**
 * @typedef {Object} PositionsFiltersState
 * @property {string} providerId
 * @property {string} pair
 * @property {string} side
 * @property {string} type
 * @property {string} status
 */

/**
 * Provides positions data load by collection type.
 *
 * Encapsulates the data fetch from Trade API and local state handling.
 *
 * @param {PositionsCollectionType} type Collection type to fetch.
 * @param {PositionEntity|null} [positionEntity] Position entity (optional) to narrow data to single position.
 * @param {function} [notifyPositionsUpdate] Callback to notify the updated positions list.
 * @param {"dashboardPositions"} [persistKey] Key to persist filters to store.
 * @returns {HookPositionsListData} Positions collection.
 */
const usePositionsList = (
  type,
  positionEntity = null,
  notifyPositionsUpdate = null,
  persistKey,
  // eslint-disable-next-line max-params
) => {
  const typeRef = useRef(null);
  const storeSettings = useStoreSettingsSelector();
  const { selectedExchange } = storeSettings;
  const storeViews = useStoreViewsSelector();
  const exchangeRef = useRef(selectedExchange.exchangeId);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /**
   * @type {PositionsState}
   */
  const defaultPositionsState = {
    open: null,
    closed: null,
    log: null,
    profileOpen: null,
    profileClosed: null,
  };

  const storeFilters = storeSettings.filters[persistKey];
  const defaultFilters = {
    providerId: "all",
    pair: "all",
    side: "all",
    type: "all",
    status: "",
  };

  const { filters, setFilters, clearFilters, modifiedFilters } = useFilters(
    defaultFilters,
    storeFilters,
    persistKey,
  );

  const [positions, setPositions] = useState(cloneDeep(defaultPositionsState));
  const storeSession = useStoreSessionSelector();
  const statusRef = useRef(filters.status);
  const [filtersVisibility, setFiltersVisibility] = useState(!isMobile);

  /**
   * Resolve a Trade API fetch method to fetch positions of a given category.
   *
   * @returns {Promise<UserPositionsCollection>} Promise method when category mapping is resolved, empty promise otherwise.
   */
  const routeFetchMethod = () => {
    const payload = {
      token: storeSession.tradeApi.accessToken,
      internalExchangeId: storeSettings.selectedExchange.internalId,
    };

    const providerPayload = {
      token: storeSession.tradeApi.accessToken,
      providerId: storeViews.provider.id,
    };

    // Skip request if required parameters is empty.
    if (!isEmpty(payload.internalExchangeId) || !isEmpty(providerPayload.providerId)) {
      if (positionEntity) {
        // On fist load rely on position entity passed by parent to avoid extra rquest.
        return new Promise((resolve) => {
          resolve([positionEntity]);
        });
      } else if (type === "closed") {
        return tradeApi.closedPositionsGet(payload);
      } else if (type === "log") {
        if (filters.status === "all") {
          return tradeApi.logPositionsGet({ ...payload, extendedStatuses: true });
        }

        return tradeApi.logPositionsGet(payload);
      } else if (type === "open") {
        return tradeApi.openPositionsGet(payload);
      } else if (type === "profileOpen") {
        return tradeApi.providerOpenPositions(providerPayload);
      } else if (type === "profileClosed") {
        return tradeApi.providerSoldPositions(providerPayload);
      }
    }

    // Fallback to null promise when method not resolved.
    return new Promise((resolve) => {
      resolve(null);
    });
  };

  /**
   * Filter positions list by filters criteria.
   *
   * @param {UserPositionsCollection} filterPositions Positions collection.
   * @returns {UserPositionsCollection} Filtered positions collection.
   */
  const filterData = (filterPositions) => {
    /**
     * Checks if value equals to "all".
     *
     * @param {string|OptionType} value Value to check.
     * @returns {boolean} TRUE when equals, FALSE otherwise.
     */
    const isAll = (value) => {
      if (typeof value === "object") {
        return value.val === "all";
      }
      return value === "all" || value === "";
    };
    let filterValues = omitBy(filters, isAll);

    // Only use the type filter on log positions table.
    if (type !== "log") {
      delete filterValues.type;
    }
    const matches = filter(filterPositions, filterValues);

    return /** @type {UserPositionsCollection} */ (matches);
  };

  /**
   * Prepare new positions state, clearing any previous state when needed.
   *
   * @param {string} initiatorExchangeInternalId Exchange that was selected at the moment when fetch was triggered.
   * @returns {PositionsState} Positions state.
   */
  const prepareNewPositionsState = (initiatorExchangeInternalId) => {
    let newPositions = { ...positions };
    // Reset new positions state on exchange change.
    if (exchangeRef.current !== initiatorExchangeInternalId) {
      newPositions = cloneDeep(defaultPositionsState);
      exchangeRef.current = selectedExchange.internalId;
    }

    // Only show loader at initial load to avoid loader experience disruption on updates.
    if (newPositions[type] === null) {
      setLoading(true);
    }

    if (statusRef.current !== filters.status) {
      setLoading(true);
      statusRef.current = filters.status;
    }

    return newPositions;
  };

  /**
   * Get all statuses log positions.
   *
   * Fallback request when reduced statuses requests don't retrieved positions.
   *
   * @returns {Promise<UserPositionsCollection|null>} All statuses log positions.
   */
  const fallbackLogPositionsAllStatuses = async () => {
    let requestData = null;
    const payload = {
      token: storeSession.tradeApi.accessToken,
      internalExchangeId: storeSettings.selectedExchange.internalId,
    };

    try {
      requestData = await tradeApi.logPositionsGet({ ...payload, extendedStatuses: true });
      // If got results, activate all statuses checkbox.
      if (!isEmpty(requestData)) {
        setFilters({
          ...filters,
          status: "all",
        });
      }
    } catch (e) {
      dispatch(showErrorAlert(e));
    }

    return requestData;
  };

  /**
   * Load user positions for a given exchange.
   *
   * @param {string} initiatorExchangeInternalId Exchange that was selected at the moment when fetch was triggered.
   * @returns {React.EffectCallback} Effect clean callback.
   */
  const loadPositions = (initiatorExchangeInternalId) => {
    let cancel = false;
    const fetchMethod = routeFetchMethod();
    const newPositions = prepareNewPositionsState(initiatorExchangeInternalId);
    // Check to prevent other tabs / exchanages leftover requests race condition
    // that override current tab data.
    const isOriginalInitiator = () => {
      return (
        !cancel &&
        (!typeRef.current || typeRef.current === type) &&
        (!exchangeRef.current || exchangeRef.current === initiatorExchangeInternalId)
      );
    };

    if (fetchMethod) {
      fetchMethod
        .then(async (fetchData) => {
          if (isOriginalInitiator()) {
            newPositions[type] = fetchData;
            if (type === "log" && filters.status === "" && isEmpty(fetchData)) {
              newPositions[type] = (await fallbackLogPositionsAllStatuses()) || [];
            }

            setPositions(newPositions);
            if (isFunction(notifyPositionsUpdate)) {
              notifyPositionsUpdate(newPositions[type]);
            }
          }
        })
        .catch((e) => {
          if (isOriginalInitiator()) {
            if (e.code === 18 || e.code === 12) {
              newPositions[type] = [];
              setPositions(newPositions);
            } else {
              dispatch(showErrorAlert(e));
            }
          }
        })
        .finally(() => {
          if (isOriginalInitiator()) {
            setLoading(false);
          }
        });
    }

    return () => {
      cancel = true;
    };
  };

  const loadPositionsForExchange = partial(loadPositions, selectedExchange.internalId);
  useEffect(loadPositionsForExchange, [
    type,
    filters.status,
    storeSession.tradeApi.accessToken,
    selectedExchange.internalId,
  ]);

  /**
   * Load a specific position by ID.
   *
   * @param {string} initiatorExchangeInternalId Exchange that was selected at the moment when fetch was triggered.
   * @returns {boolean} false in case that required parameter was missing, true otherwise.
   */
  const loadPosition = (initiatorExchangeInternalId) => {
    const payload = {
      token: storeSession.tradeApi.accessToken,
      positionId: positionEntity.positionId,
      internalExchangeId: selectedExchange.internalId,
    };

    // Skip request if required parameters are empty.
    if (isEmpty(payload.internalExchangeId) || isEmpty(positionEntity.positionId)) {
      return false;
    }

    const newPositions = prepareNewPositionsState(initiatorExchangeInternalId);
    tradeApi
      .positionGet(payload)
      .then((data) => {
        newPositions[type] = [data];
        setPositions(newPositions);

        if (isFunction(notifyPositionsUpdate)) {
          notifyPositionsUpdate(newPositions[type]);
        }
      })
      .catch((e) => {
        dispatch(showErrorAlert(e));
      })
      .finally(() => {
        setLoading(false);
      });

    return true;
  };

  const loadPositionForExchange = partial(loadPosition, selectedExchange.internalId);
  const updateData = () => {
    // Only open positions needs continuos updates.
    if (type === "open" || type === "profileOpen") {
      // Single position update.
      if (positionEntity) {
        loadPositionForExchange();
      } else {
        // Multiples position update.
        loadPositionsForExchange();
      }
    }
  };
  useInterval(updateData, 3000, true);

  const handlePositionTypeChange = () => {
    typeRef.current = type;
  };
  useEffect(handlePositionTypeChange, [type]);

  /**
   * Flag a given position as updating.
   *
   * @param {string} positionId Position ID to flag.
   * @returns {Void} None.
   */
  const flagPositionUpdating = (positionId) => {
    if (positions[type]) {
      const newPositions = positions[type].map((position) => {
        if (position.positionId === positionId) {
          return { ...position, updating: true };
        }

        return position;
      });

      setPositions({ ...positions, [type]: newPositions });
    }
  };

  return {
    positionsAll: positions[type] || [],
    positionsFiltered: filterData(positions[type] || []),
    setFilters,
    filters,
    clearFilters,
    modifiedFilters,
    loading: loading,
    flagPositionUpdating,
    filtersVisibility,
    setFiltersVisibility,
  };
};

export default usePositionsList;
