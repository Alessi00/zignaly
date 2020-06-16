import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useFormContext } from "react-hook-form";
import HelperLabel from "../HelperLabel/HelperLabel";
import { OutlinedInput } from "@material-ui/core";
import { FormControl } from "@material-ui/core";
import { Button, Box, Switch, Typography } from "@material-ui/core";
import { AddCircle, RemoveCircle } from "@material-ui/icons";
import { range } from "lodash";
import "./TakeProfitPanel.scss";

const TakeProfitPanel = (props) => {
  const { symbolData, lastPriceCandle } = props;
  const defaultExpand = true;
  const [expand, setExpand] = useState(defaultExpand);
  const expandClass = expand ? "expanded" : "collapsed";
  const { errors, getValues, register, clearError, setError, setValue } = useFormContext();
  const [cardinality, setCardinality] = useState(1);
  const cardinalityRange = range(1, cardinality + 1, 1);

  /**
   * Handle toggle switch action.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event Click event.
   * @returns {Void} None.
   */
  const handleToggle = (event) => {
    const targetElement = event.currentTarget;
    setExpand(targetElement.checked);
  };

  const handleTargetAdd = () => {
    setCardinality(cardinality + 1);
  };

  const handleTargetRemove = () => {
    if (cardinality > 0) {
      setCardinality(cardinality - 1);
    }
  };

  /**
   * Get target group ID for changed input element event.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event Input change event.
   * @return {string} Target group ID (cardinality);
   */
  const getGroupTargetId = (event) => {
    const targetElement = event.currentTarget;
    const targetGroup = targetElement.closest(".targetGroup");
    const targetId = targetGroup.getAttribute("data-target-id");

    return targetId;
  };

  /**
   * Calculate price based on percentage change for a given target.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event Input change event.
   * @return {Void} None.
   */
  const targetPricePercentageChange = (event) => {
    const draftPosition = getValues();
    const price = parseFloat(draftPosition.price) || parseFloat(lastPriceCandle[1]);
    const targetId = getGroupTargetId(event);
    const pricePercentageProperty = `targetPricePercentage${targetId}`;
    const priceProperty = `targetPrice${targetId}`;
    const targetPercentage = parseFloat(draftPosition[pricePercentageProperty]) || 100;
    const targetPrice = price * ((targetPercentage + 100) / 100);

    setValue(priceProperty, targetPrice);
  };

  /**
   * Calculate percentage based on price change for a given target.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event Input change event.
   * @return {Void} None.
   */
  const targetPriceChange = (event) => {
    const draftPosition = getValues();
    const price = parseFloat(draftPosition.price) || parseFloat(lastPriceCandle[1]);
    const targetId = getGroupTargetId(event);
    const pricePercentageProperty = `targetPricePercentage${targetId}`;
    const priceProperty = `targetPrice${targetId}`;
    const priceDiff = parseFloat(draftPosition[priceProperty]) - price;
    const targetPercentage = (priceDiff / price) * 100;

    setValue(pricePercentageProperty, targetPercentage || 0);
  };

  const exitUnitsPercentageChange = () => {};

  const exitUnitsChange = () => {};

  useEffect(() => {
    const currentValues = getValues();
    console.log("Values: ", currentValues);
  }, [cardinality]);

  return (
    <Box className={`strategyPanel takeProfitPanel ${expandClass}`}>
      <Box alignItems="center" className="panelHeader" display="flex" flexDirection="row">
        <Switch onChange={handleToggle} size="small" />
        <Box alignItems="center" className="title" display="flex" flexDirection="row">
          <Typography variant="h5">
            <FormattedMessage id="terminal.takeprofit" />
          </Typography>
        </Box>
      </Box>
      {expand && (
        <Box
          className="panelContent"
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          justifyContent="space-around"
        >
          {cardinalityRange.map((index) => (
            <FormControl className="targetGroup" data-target-id={index} key={`target${index}`}>
              <Box className="targetPrice" display="flex" flexDirection="row" flexWrap="wrap">
                <HelperLabel descriptionId="terminal.takeprofit.help" labelId="terminal.target" />
                <Box alignItems="center" display="flex">
                  <OutlinedInput
                    className="outlineInput"
                    inputRef={register}
                    name={`targetPricePercentage${index}`}
                    onChange={targetPricePercentageChange}
                  />
                  <div className="currencyBox">%</div>
                </Box>
                <Box alignItems="center" display="flex">
                  <OutlinedInput
                    className="outlineInput"
                    inputRef={register}
                    name={`targetPrice${index}`}
                    onChange={targetPriceChange}
                  />
                  <div className="currencyBox">{symbolData.quote}</div>
                </Box>
              </Box>
              <Box className="targetPrice" display="flex" flexDirection="row" flexWrap="wrap">
                <HelperLabel
                  descriptionId="terminal.unitstoexit.help"
                  labelId="terminal.unitstoexit"
                />
                <Box alignItems="center" display="flex">
                  <OutlinedInput
                    className="outlineInput"
                    inputRef={register}
                    name={`exitUnitsPercentage${index}`}
                  />
                  <div className="currencyBox">%</div>
                </Box>
                <Box alignItems="center" display="flex">
                  <OutlinedInput
                    className="outlineInput"
                    inputRef={register}
                    name={`exitUnits${index}`}
                  />
                  <div className="currencyBox">{symbolData.quote}</div>
                </Box>
              </Box>
            </FormControl>
          ))}
          <Box className="targetActions" display="flex" flexDirection="row" flexWrap="wrap">
            <Button className="removeTarget" onClick={handleTargetRemove}>
              <RemoveCircle />
              <FormattedMessage id="terminal.target.remove" />
            </Button>
            <Button className="addTarget" onClick={handleTargetAdd}>
              <AddCircle />
              <FormattedMessage id="terminal.target.add" />
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TakeProfitPanel;
