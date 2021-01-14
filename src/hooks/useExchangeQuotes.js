import { useState, useEffect, useContext } from "react";
import useStoreSessionSelector from "./useStoreSessionSelector";
import tradeApi from "../services/tradeApiClient";
import { useDispatch } from "react-redux";
import { showErrorAlert } from "../store/actions/ui";
import PrivateAreaContext from "context/PrivateAreaContext";
import { useStoreUserData } from "./useStoreUserSelector";

/**
 * @typedef {import("../services/tradeApiClient.types").QuoteAssetsDict} QuoteAssetsDict
 * @typedef {Object} ExchangeData
 * @property {string} exchangeId
 * @property {string} exchangeType
 */

/**
 * @typedef {Object} ExchangeQuotesHookData
 * @property {QuoteAssetsDict} quoteAssets
 * @property {Boolean} quotesLoading
 */

/**
 * Provides quotes assets.
 * @param {ExchangeData} exchangeData Exchange internal id.
 * @param {boolean} [shouldExecute] Flag to indicate if we should execute the request.
 * @returns {ExchangeQuotesHookData} Quote Assets.
 */
const useExchangeQuotes = (exchangeData, shouldExecute = true) => {
  const [quoteAssets, setQuotes] = useState({});
  const storeUserData = useStoreUserData();
  const [quotesLoading, setLoading] = useState(false);
  const { quotesMap, setQuotesMapData } = useContext(PrivateAreaContext);
  const mapKey = `${exchangeData.exchangeId}-${exchangeData.exchangeType}`;

  const storeSession = useStoreSessionSelector();
  const dispatch = useDispatch();

  const loadData = () => {
    if (
      storeUserData.binanceConnected &&
      shouldExecute &&
      storeSession.tradeApi.accessToken &&
      exchangeData.exchangeId &&
      exchangeData.exchangeType
    ) {
      if (quotesMap[mapKey]) {
        setQuotes(quotesMap[mapKey]);
        return;
      }
      setLoading(true);
      let payload = {
        token: storeSession.tradeApi.accessToken,
        ro: true,
        version: 2,
        exchangeId: exchangeData.exchangeId,
        exchangeType: exchangeData.exchangeType,
      };

      tradeApi
        .quotesAssetsGet(payload)
        .then((data) => {
          setQuotes(data);
          const map = { ...quotesMap };
          map[mapKey] = data;
          setQuotesMapData(map);
        })
        .catch((e) => {
          dispatch(showErrorAlert(e));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(loadData, [
    storeSession.tradeApi.accessToken,
    exchangeData.exchangeId,
    exchangeData.exchangeType,
    shouldExecute,
    storeUserData.binanceConnected,
  ]);

  return {
    quoteAssets: quoteAssets,
    quotesLoading: quotesLoading,
  };
};

export default useExchangeQuotes;
