import React from "react";
import "./WeeklyData.scss";
import { Box, Typography } from "@material-ui/core";
import moment from "moment";

/**
 *
 * @typedef {import("../../../../../services/tradeApiClient.types").DefaultProviderPerformanceWeeklyStats} DefaultProviderPerformanceWeeklyStats
 * @typedef {import('chart.js').ChartTooltipItem} ChartTooltipItem
 */

/**
 *
 * @typedef {Object} DefaultQuarter
 * @property {Array<DefaultProviderPerformanceWeeklyStats>} weeklyStats
 * @property {Number} total
 * @property {Number} id
 * @property {String} label
 */

/**
 *
 * @typedef {Object} DefaultProps
 * @property {Array<DefaultQuarter>} list
 * @property {DefaultQuarter} selected
 * @property {Function} onChange
 */

/**
 * Trading performance chart component.
 *
 * @param {DefaultProps} props Default props.
 * @return {JSX.Element} JSX component.
 */

const WeeklyData = ({ list, selected, onChange }) => {
  /**
   * Function to select a quarter.
   *
   * @param {Number} id id of the quarter on which user clicks.
   * @returns {void} None.
   */
  const handleChange = (id) => {
    let found = list.find((item) => item.id === id);
    if (found) {
      onChange(found);
    }
  };

  return (
    <Box
      alignItems="flex-start"
      className="weeklyData"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
    >
      <Box
        alignItems="center"
        className="weekLabels"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
      >
        <Typography className="quaterLabel" variant="h3" />
        {selected.weeklyStats.map((item, index) => (
          <Typography key={index} variant="h5">
            {item.day ? moment(new Date(item.day)).format("DD MMM") : "--"}
          </Typography>
        ))}
        <Typography className="total" variant="h5">
          Total
        </Typography>
      </Box>

      <Box className="weekData" display="flex" flexDirection="column">
        {list.map((item, index) => (
          <Box
            alignItems="center"
            className={"quarterBox " + (selected.id === item.id ? "selected" : "")}
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            key={index}
            onClick={() => handleChange(item.id)}
          >
            <Typography className="quaterLabel" variant="h3">
              {item.label}
            </Typography>
            {item.weeklyStats.map((item2, index2) => (
              <Typography className={item2.return >= 0 ? "green" : "red"} key={index2} variant="h5">
                {item2.return ? `${item2.return.toFixed(2)}%` : "--"}
              </Typography>
            ))}
            <Typography className={"total " + (item.total >= 0 ? "green" : "red")} variant="h5">
              {item.total ? `${item.total.toFixed(2)}%` : "--"}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default WeeklyData;
