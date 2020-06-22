import React, { useEffect, useState } from "react";
import "./GraphLabels.scss";
import { Box } from "@material-ui/core";
/**
 *
 * @typedef {import("../../../../services/tradeApiClient.types").UserEquityEntity} UserEquityEntity
 */

/**
 *
 * @typedef {Object} DefaultProps
 * @property {Array<UserEquityEntity>} list
 */

/**
 *
 * @param {DefaultProps} props Default props.
 */

const EquityGraphLabels = ({ list }) => {
  const [labels, setLabels] = useState([]);

  const monthNames = [
    "January",
    "Feb",
    "Mar",
    "April",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    const prepareLabels = () => {
      /**
       * @type {Array<String>} data
       */
      let data = [];
      [...list].forEach((item) => {
        let date = new Date(item.date);
        if (!data.includes(monthNames[date.getMonth()])) {
          data.push(monthNames[date.getMonth()]);
        }
      });
      setLabels(data);
    };

    prepareLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  return (
    <Box
      alignItems="center"
      className="equityGraphLabels"
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
    >
      {labels.map((item, index) => (
        <span className="month" key={index}>
          {item}
        </span>
      ))}
    </Box>
  );
};

export default EquityGraphLabels;
