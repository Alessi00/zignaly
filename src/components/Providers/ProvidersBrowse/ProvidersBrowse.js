import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import ProvidersFilters from "../ProvidersFilters";
import ProvidersSort from "../ProvidersSort";
import ProvidersList from "../ProvidersList";
import TimeFrameSelectRow from "../TimeFrameSelectRow";
import useProvidersList from "../../../hooks/useProvidersList";
import { Box } from "@material-ui/core";

/**
 * @typedef {Object} ProvidersBrowsePropTypes
 * @property {boolean} [showFilters] Flag to indicate if filters should be rendered.
 * @property {boolean} [showSort] Flag to indicate if sort options should be rendered.
 * @property {function} [toggleFilters] Callback that delegate filters toggle state to caller.
 * @property {function} [toggleSort] Callback that delegate sort toggle state to caller.
 * @property {function} [setModifiedFiltersCount] Callback that delegate modifiedFiltersCount to caller.
 * @property {'copyt'|'signalp'} type Type of providers to show.
 * @property {boolean} connectedOnly Only display connected providers.
 */

/**
 * Provides filters for filtering providers.
 *
 * @param {ProvidersBrowsePropTypes} props Component properties.
 * @returns {JSX.Element} Component JSX.
 */
const ProvidersBrowse = ({
  toggleSort,
  toggleFilters,
  showFilters,
  showSort,
  type,
  connectedOnly,
  setModifiedFiltersCount,
}) => {
  const copyTradersOnly = type === "copyt";
  const providersOptions = { copyTradersOnly, connectedOnly };
  const {
    providers,
    quotes,
    exchanges,
    exchangeTypes,
    sort,
    setSort,
    clearFilters,
    clearSort,
    filters,
    setFilters,
    modifiedFilters,
    timeFrame,
    setTimeFrame,
  } = useProvidersList(providersOptions);
  const intl = useIntl();

  useEffect(() => {
    if (setModifiedFiltersCount) {
      setModifiedFiltersCount(modifiedFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modifiedFilters]);

  return (
    <Box className="providersBrowse">
      {toggleFilters && (
        <ProvidersFilters
          clearFilters={clearFilters}
          copyTradersOnly={copyTradersOnly}
          exchangeTypes={exchangeTypes}
          exchanges={exchanges}
          filters={filters}
          onClose={toggleFilters}
          open={showFilters}
          quotes={quotes}
          setFilters={setFilters}
        />
      )}
      {toggleSort && (
        <ProvidersSort
          clearFilters={clearSort}
          isCopyTrading={copyTradersOnly}
          onChange={setSort}
          onClose={toggleSort}
          open={showSort}
          sort={sort}
        />
      )}
      {copyTradersOnly && (
        <TimeFrameSelectRow
          isCopyTrading={copyTradersOnly}
          onChange={setTimeFrame}
          title={`${providers ? providers.length : 0} ${intl.formatMessage({
            id: connectedOnly
              ? copyTradersOnly
                ? "dashboard.traders.copying"
                : "dashboard.providers.following"
              : copyTradersOnly
              ? "copyt.traders"
              : "menu.signalproviders",
          })}`}
          value={timeFrame}
        />
      )}
      <ProvidersList providers={providers} showSummary={connectedOnly} timeFrame={timeFrame} />
    </Box>
  );
};

export default ProvidersBrowse;
