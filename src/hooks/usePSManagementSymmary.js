import { useState } from "react";
import useStoreSessionSelector from "./useStoreSessionSelector";
import tradeApi from "../services/tradeApiClient";
import { useDispatch } from "react-redux";
import { showErrorAlert } from "../store/actions/ui";
import { creatProviderBalanceEntity } from "../services/tradeApiClient.types";
import useInterval from "./useInterval";

/**
 * @typedef {import("../services/tradeApiClient.types").ProviderDataPointsEntity} ProviderDataPointsEntity
 * @typedef {Object} HookData
 * @property {ProviderDataPointsEntity} summary
 * @property {Boolean} summaryLoading
 */

/**
 * Provides balance summary for exchange.
 *
 * @param {string} providerId ID of the exchange.
 * @returns {HookData} Balance.
 */
const usePSManagementSymmary = (providerId) => {
  const emptyObject = creatProviderBalanceEntity(null);
  const [summary, setSummary] = useState(emptyObject);
  const [loading, setLoading] = useState(true);

  const storeSession = useStoreSessionSelector();
  const dispatch = useDispatch();

  const loadSummary = () => {
    if (providerId) {
      const payload = {
        token: storeSession.tradeApi.accessToken,
        providerId: providerId,
      };
      tradeApi
        .providerBalanceGet(payload)
        .then((response) => {
          setSummary(response);
        })
        .catch((e) => {
          dispatch(showErrorAlert(e));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useInterval(loadSummary, 5000, true);

  return {
    summaryLoading: loading,
    summary: summary,
  };
};

export default usePSManagementSymmary;
