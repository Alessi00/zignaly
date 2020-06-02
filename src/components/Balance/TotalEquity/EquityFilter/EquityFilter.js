import React, { useState } from "react";
import "./EquityFilter.scss";
import { Box } from "@material-ui/core";
import CustomSelect from "../../../CustomSelect";
import { useIntl } from "react-intl";
/**
 *
 * @typedef {import("../../../../services/tradeApiClient.types").UserEquityEntity} UserEquityEntity
 */

/**
 *
 * @typedef {Object} DefaultProps
 * @property {Array<UserEquityEntity>} list
 * @property {Function} onChange
 */

/**
 *
 * @param {DefaultProps} props Default props.
 */

const EquityFilter = (props) => {
  const { list, onChange } = props;
  const [selected, setSelected] = useState(0);
  const intl = useIntl();

  const timeframes = [
    { label: "7D", val: 7 },
    { label: "14D", val: 14 },
    { label: "30D", val: 30 },
    { label: "3M", val: 90 },
    { label: "6M", val: 180 },
    { label: "1Y", val: 365 },
    { label: "Total", val: 0 },
  ];

  /**
   * Select change handler.
   *
   * @param {Number} value Change event.
   *
   * @returns {Void} No return.
   */
  const handleChange = (value) => {
    setSelected(value);
    const data = filterData(value);
    onChange(data);
  };

  /**
   * Filter Daily balance data
   *
   * @param {Number} value
   * @returns {Array<UserEquityEntity>}
   */

  const filterData = (value) => {
    if (value === 0) {
      return list;
    }
    let date = new Date();
    date.setDate(date.getDate() - value);
    let newList = [...list].filter((item) => {
      return parseFloat(item.date) > new Date(date).getTime();
    });
    return newList;
  };

  return (
    <Box alignItems="center" className="equityFilter" display="flex" flexDirection="row">
      <CustomSelect
        label={intl.formatMessage({ id: "dashboard.balance.show" })}
        onChange={handleChange}
        options={timeframes}
        value={selected}
      />
    </Box>
  );
};

export default EquityFilter;
