import React from "react";
import "./UserFilters.scss";
import CustomSelect from "../../../CustomSelect";
import { Box } from "@material-ui/core";
import { useIntl } from "react-intl";

/**
 * @typedef {import("../../../CustomSelect/CustomSelect").OptionType} OptionType
 * @typedef {Object} FilterObject
 * @property {String} connected
 * @property {String} active
 * @property {String} suspended
 * @property {String} connectedExchange
 */

/**
 * @typedef {Object} ProvidersFiltersPropTypes
 * @property {function} setFilters Callback that delegate filters update to caller.
 * @property {FilterObject} filters Current filters.
 * @property {Array<OptionType>} connectedOptions Exchanges options.
 * @property {Array<OptionType>} activeOptions Exchange types options.
 * @property {Array<OptionType>} suspendedOptions Quotes options.
 * @property {Array<OptionType>} exchangeOptions Options array for user owned services select.
 */

/**
 * Provides filters for filtering providers.
 *
 * @param {ProvidersFiltersPropTypes} props Component properties.
 * @returns {JSX.Element} Component JSX.
 */
const UserFilters = ({
  connectedOptions,
  activeOptions,
  suspendedOptions,
  exchangeOptions,
  filters,
  setFilters,
}) => {
  const intl = useIntl();
  return (
    <Box
      alignItems="center"
      className="userFilters"
      display="flex"
      flexDirection="row"
      justifyContent="flex-start"
    >
      <CustomSelect
        label={intl.formatMessage({ id: "fil.connected" })}
        onChange={(/** @type {OptionType} */ val) => setFilters({ ...filters, connected: val })}
        options={connectedOptions}
        // @ts-ignore
        value={filters.connected}
      />
      <CustomSelect
        label={intl.formatMessage({ id: "fil.active" })}
        onChange={(/** @type {string} */ val) => setFilters({ ...filters, active: val })}
        options={activeOptions}
        // @ts-ignore
        value={filters.active}
      />
      <CustomSelect
        label={intl.formatMessage({ id: "fil.suspended" })}
        onChange={(/** @type {string} */ val) => setFilters({ ...filters, suspended: val })}
        options={suspendedOptions}
        // @ts-ignore
        value={filters.suspended}
      />
      <CustomSelect
        label={intl.formatMessage({ id: "fil.realexchange.label" })}
        onChange={(/** @type {string} */ val) => setFilters({ ...filters, connectedExchange: val })}
        options={exchangeOptions}
        // @ts-ignore
        value={filters.connectedExchange}
      />
    </Box>
  );
};

export default UserFilters;
