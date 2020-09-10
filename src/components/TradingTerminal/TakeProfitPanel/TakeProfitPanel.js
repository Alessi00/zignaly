import React, { useEffect } from "react";
import { range, size, sum, values } from "lodash";
import { FormattedMessage, useIntl } from "react-intl";
import { useFormContext } from "react-hook-form";
import { Button, Box, OutlinedInput, Typography, Switch } from "@material-ui/core";
import { AddCircle, RemoveCircle } from "@material-ui/icons";
import HelperLabel from "../HelperLabel/HelperLabel";
import ProfitTargetStatus from "../ProfitTargetStatus/ProfitTargetStatus";
import { formatFloat2Dec } from "../../../utils/format";
import { formatPrice } from "../../../utils/formatters";
import useExpandable from "../../../hooks/useExpandable";
import useTargetGroup from "../../../hooks/useTargetGroup";
import usePositionEntry from "../../../hooks/usePositionEntry";
import useValidation from "../../../hooks/useValidation";
import "./TakeProfitPanel.scss";
import useSymbolLimitsValidate from "../../../hooks/useSymbolLimitsValidate";

/**
 * @typedef {import("../../../services/coinRayDataFeed").MarketSymbol} MarketSymbol
 * @typedef {import("../../../services/coinRayDataFeed").CoinRayCandle} CoinRayCandle
 * @typedef {import("../../../services/tradeApiClient.types").PositionEntity} PositionEntity
 */

/**
 * @typedef {Object} TakeProfitPanelProps
 * @property {MarketSymbol} symbolData
 * @property {PositionEntity} [positionEntity] Position entity (optional) for position edit trading view.
 * @property {boolean} [isReadOnly] Flag to disable edition.
 */

/**
 * Manual trading take profit panel component.
 *
 * @param {TakeProfitPanelProps} props Component props.
 * @returns {JSX.Element} Take profit panel element.
 */
const TakeProfitPanel = (props) => {
  const { symbolData, positionEntity = null, isReadOnly = false } = props;
  const positionTargetsCardinality = positionEntity ? size(positionEntity.takeProfitTargets) : 0;
  const targetIndexes = range(1, positionTargetsCardinality + 1, 1);
  const { expanded, expandClass, setExpanded } = useExpandable(positionTargetsCardinality > 0);
  const { greaterThan, validPercentage } = useValidation();
  const {
    validateTargetPriceLimits,
    validateCostLimits,
    validateUnitsLimits,
  } = useSymbolLimitsValidate(symbolData);

  const {
    clearErrors,
    errors,
    register,
    setValue,
    watch,
    getValues,
    trigger,
    formState: { dirtyFields },
  } = useFormContext();
  const defaultCardinality = 1;
  const {
    cardinality,
    cardinalityRange,
    composeTargetPropertyName,
    getGroupTargetId,
    getTargetPropertyValue,
    handleTargetAdd,
    handleTargetRemove,
    setTargetPropertyValue,
    simulateInputChangeEvent,
  } = useTargetGroup(
    "takeProfit",
    positionEntity ? Math.max(defaultCardinality, positionTargetsCardinality) : defaultCardinality,
  );

  // Other panels watched variables to react on changes.
  const entryType = positionEntity ? positionEntity.side : watch("entryType");
  const strategyPrice = watch("price");
  const strategyUnits = watch("units");

  const { getEntryPrice, getEntrySize } = usePositionEntry(positionEntity);
  const targetsDone = positionEntity ? positionEntity.takeProfitTargetsCountSuccess : 0;
  const isTargetLocked = positionEntity ? cardinality === targetsDone : false;
  const disableRemoveAction = isReadOnly || isTargetLocked;
  const isClosed = positionEntity ? positionEntity.closed : false;
  const { formatMessage } = useIntl();

  const getFieldsDisabledStatus = () => {
    /**
     * @type {Object<string, boolean>}
     */
    const fieldsDisabled = {};
    targetIndexes.forEach((index) => {
      const target = positionEntity ? positionEntity.takeProfitTargets[index] : { done: false };

      let disabled = false;
      if (target.done) {
        disabled = true;
      } else if (isReadOnly || isClosed) {
        disabled = true;
      }

      fieldsDisabled[composeTargetPropertyName("exitUnitsPercentage", index)] = disabled;
      fieldsDisabled[composeTargetPropertyName("exitUnits", index)] = disabled;
      fieldsDisabled[composeTargetPropertyName("targetPrice", index)] = disabled;
      fieldsDisabled[composeTargetPropertyName("targetPricePercentage", index)] = disabled;
    });

    return fieldsDisabled;
  };

  const fieldsDisabled = getFieldsDisabledStatus();
  const profitTargets = positionEntity ? positionEntity.takeProfitTargets : {};

  /**
   * Calculate price based on percentage change for a given target.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event Input change event.
   * @return {Void} None.
   */
  const targetPricePercentageChange = (event) => {
    const price = getEntryPrice();
    const targetId = getGroupTargetId(event);
    const priceProperty = composeTargetPropertyName("targetPrice", targetId);
    const targetPercentage = getTargetPropertyValue("targetPricePercentage", targetId);
    const pricePercentageProperty = composeTargetPropertyName("targetPricePercentage", targetId);

    if (errors[pricePercentageProperty]) return;

    let targetPrice = price * ((targetPercentage + 100) / 100);
    setValue(priceProperty, formatPrice(targetPrice, "", ""));
    trigger(priceProperty);
  };

  /**
   * Calculate percentage based on price change for a given target.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event Input change event.
   * @return {Void} None.
   */
  const targetPriceChange = (event) => {
    const price = getEntryPrice();
    const targetId = getGroupTargetId(event);
    const pricePercentageProperty = composeTargetPropertyName("targetPricePercentage", targetId);
    const targetPrice = getTargetPropertyValue("targetPrice", targetId);
    const priceProperty = composeTargetPropertyName("targetPrice", targetId);

    if (errors[priceProperty]) return;

    const priceDiff = targetPrice - price;
    const targetPercentage = (priceDiff / price) * 100;
    setValue(pricePercentageProperty, formatFloat2Dec(targetPercentage));

    trigger(pricePercentageProperty);
  };

  /**
   * Validate cumulative targets percentage.
   *
   * @returns {boolean|string} true if validation passed, error message otherwise.
   */
  const validateCumulativePercentage = () => {
    const exitUnitsPercentageFields = cardinalityRange.map((targetId) =>
      composeTargetPropertyName("exitUnitsPercentage", targetId),
    );
    const exitUnitsPercentages = getValues(exitUnitsPercentageFields);
    const cumulativePercentage = sum(values(exitUnitsPercentages).map(Number));
    if (cumulativePercentage > 100) {
      return formatMessage({ id: "terminal.takeprofit.limit.cumulative" });
    }
    return true;
  };

  /**
   * Calculate units based on units percentage change for a given target.
   *
   * @param {string} targetId targetId
   * @return {Void} None.
   */
  const exitUnitsPercentageChange = (targetId) => {
    const units = getEntrySize();
    const unitsProperty = composeTargetPropertyName("exitUnits", targetId);
    const exitUnitsPercentageProperty = composeTargetPropertyName("exitUnitsPercentage", targetId);
    const unitsPercentage = getTargetPropertyValue("exitUnitsPercentage", targetId);

    if (errors[exitUnitsPercentageProperty]) return;

    const targetUnits = units * (unitsPercentage / 100);
    setValue(unitsProperty, formatPrice(targetUnits, "", ""));
    // Trigger validation unless change caused by initialization
    if (dirtyFields[exitUnitsPercentageProperty]) {
      trigger(unitsProperty);
    }
  };

  /**
   * Calculate units percentage based on units change for a given target.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event Input change event.
   * @return {Void} None.
   */
  const exitUnitsChange = (event) => {
    const units = getEntrySize();
    const targetId = getGroupTargetId(event);
    const unitsPercentageProperty = composeTargetPropertyName("exitUnitsPercentage", targetId);
    const exitUnits = getTargetPropertyValue("exitUnits", targetId);
    const exitUnitsProperty = composeTargetPropertyName("exitUnits", targetId);
    if (errors[exitUnitsProperty]) return;

    if (units > 0 && exitUnits > 0) {
      const unitsDiff = units - exitUnits;
      const unitsPercentage = (1 - unitsDiff / units) * 100;
      setValue(unitsPercentageProperty, formatFloat2Dec(unitsPercentage));
    } else {
      setValue(unitsPercentageProperty, "");
    }
  };

  const initValuesFromPositionEntity = () => {
    if (positionEntity) {
      targetIndexes.forEach((index) => {
        const profitTarget = positionEntity.takeProfitTargets[index];
        const priceTargetPercentage = formatFloat2Dec(profitTarget.priceTargetPercentage);
        const amountPercentage = formatFloat2Dec(profitTarget.amountPercentage);
        setTargetPropertyValue("targetPricePercentage", index, priceTargetPercentage);
        setTargetPropertyValue("exitUnitsPercentage", index, amountPercentage);
      });
    }
  };

  const chainedPriceUpdates = () => {
    initValuesFromPositionEntity();

    cardinalityRange.forEach((targetId) => {
      const currentValue = getTargetPropertyValue("targetPricePercentage", targetId);
      const newValue = formatFloat2Dec(Math.abs(currentValue));
      const sign = entryType === "SHORT" ? "-" : "";

      if (isNaN(currentValue)) {
        setTargetPropertyValue("targetPricePercentage", targetId, sign);
      } else {
        setTargetPropertyValue("targetPricePercentage", targetId, `${sign}${newValue}`);
        if (expanded) {
          // Trigger target price calculation
          simulateInputChangeEvent(composeTargetPropertyName("targetPricePercentage", targetId));
        }
      }
    });
  };

  useEffect(chainedPriceUpdates, [expanded, positionEntity, entryType, cardinality, strategyPrice]);

  const chainedUnitsUpdates = () => {
    if (expanded) {
      cardinalityRange.forEach((targetId) => {
        // Trigger units amount calculation
        exitUnitsPercentageChange(targetId);
      });
    }
  };

  useEffect(chainedUnitsUpdates, [expanded, strategyUnits]);

  const emptyFieldsWhenCollapsed = () => {
    if (!expanded) {
      cardinalityRange.forEach((targetId) => {
        clearErrors(composeTargetPropertyName("exitUnitsPercentage", targetId));
        clearErrors(composeTargetPropertyName("exitUnits", targetId));
        clearErrors(composeTargetPropertyName("targetPrice", targetId));
        clearErrors(composeTargetPropertyName("targetPricePercentage", targetId));
        setValue(composeTargetPropertyName("targetPrice", targetId), "");
      });
    }
  };

  useEffect(emptyFieldsWhenCollapsed, [expanded]);

  /**
   * Compose dynamic target property errors.
   *
   * @param {string} propertyName Property base name.
   * @param {string} targetId Target index ID.
   * @returns {JSX.Element|null} Errors JSX element.
   */
  const displayTargetFieldErrors = (propertyName, targetId) => {
    const targetProperty = composeTargetPropertyName(propertyName, targetId);
    if (errors[targetProperty]) {
      return <span className="errorText">{errors[targetProperty].message}</span>;
    }

    return null;
  };

  return (
    <Box className={`panel takeProfitPanel ${expandClass}`}>
      <Box alignItems="center" className="panelHeader" display="flex" flexDirection="row">
        {!isClosed && (
          <Switch checked={expanded} onChange={(e) => setExpanded(e.target.checked)} size="small" />
        )}
        <Box alignItems="center" className="title" display="flex" flexDirection="row">
          <Typography variant="h5">
            <FormattedMessage id="terminal.takeprofit" />
          </Typography>
        </Box>
      </Box>
      {expanded && (
        <Box
          className="panelContent"
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          justifyContent="space-around"
        >
          {cardinalityRange.map((targetId) => (
            <Box className="targetGroup" data-target-id={targetId} key={`target${targetId}`}>
              <Box className="targetPrice" display="flex" flexDirection="row" flexWrap="wrap">
                <HelperLabel descriptionId="terminal.takeprofit.help" labelId="terminal.target" />
                <ProfitTargetStatus
                  labelId="terminal.status"
                  profitTarget={profitTargets[Number(targetId)] || null}
                />
                <Box alignItems="center" display="flex">
                  <OutlinedInput
                    className="outlineInput"
                    disabled={
                      fieldsDisabled[composeTargetPropertyName("targetPricePercentage", targetId)]
                    }
                    error={!!errors[composeTargetPropertyName("targetPricePercentage", targetId)]}
                    inputRef={register({
                      validate: (value) =>
                        greaterThan(
                          value,
                          0,
                          entryType,
                          "terminal.takeprofit.valid.pricepercentage",
                        ),
                    })}
                    name={composeTargetPropertyName("targetPricePercentage", targetId)}
                    onChange={targetPricePercentageChange}
                  />
                  <div className="currencyBox">%</div>
                </Box>
                <Box alignItems="center" display="flex">
                  <OutlinedInput
                    className="outlineInput"
                    disabled={fieldsDisabled[composeTargetPropertyName("targetPrice", targetId)]}
                    error={!!errors[composeTargetPropertyName("targetPrice", targetId)]}
                    inputRef={register({
                      validate: {
                        positive: (value) =>
                          value >= 0 || formatMessage({ id: "terminal.takeprofit.valid.price" }),
                        price: (value) =>
                          validateTargetPriceLimits(value, "terminal.takeprofit.limit"),
                      },
                    })}
                    name={composeTargetPropertyName("targetPrice", targetId)}
                    onChange={targetPriceChange}
                  />
                  <div className="currencyBox">{symbolData.quote}</div>
                </Box>
              </Box>
              {displayTargetFieldErrors("targetPricePercentage", targetId)}
              {displayTargetFieldErrors("targetPrice", targetId)}
              <Box className="targetUnits" display="flex" flexDirection="row" flexWrap="wrap">
                <HelperLabel
                  descriptionId="terminal.unitstoexit.help"
                  labelId="terminal.unitstoexit"
                />
                <Box alignItems="center" display="flex">
                  <OutlinedInput
                    className="outlineInput"
                    disabled={
                      fieldsDisabled[composeTargetPropertyName("exitUnitsPercentage", targetId)]
                    }
                    error={!!errors[composeTargetPropertyName("exitUnitsPercentage", targetId)]}
                    inputRef={register({
                      validate: {
                        percentage: (value) =>
                          validPercentage(value, "terminal.takeprofit.valid.unitspercentage"),
                        sum: validateCumulativePercentage,
                      },
                    })}
                    name={composeTargetPropertyName("exitUnitsPercentage", targetId)}
                    onChange={() => exitUnitsPercentageChange(targetId)}
                  />
                  <div className="currencyBox">%</div>
                </Box>
                <Box alignItems="center" display="flex">
                  <OutlinedInput
                    className="outlineInput"
                    disabled={fieldsDisabled[composeTargetPropertyName("exitUnits", targetId)]}
                    error={!!errors[composeTargetPropertyName("exitUnits", targetId)]}
                    inputRef={register({
                      validate: {
                        positive: (value) =>
                          value >= 0 || formatMessage({ id: "terminal.takeprofit.valid.units" }),
                        limit: (value) => validateUnitsLimits(value, "terminal.takeprofit.limit"),
                        cost: (value) => validateCostLimits(value, "terminal.takeprofit.limit"),
                      },
                    })}
                    name={composeTargetPropertyName("exitUnits", targetId)}
                    onChange={exitUnitsChange}
                  />
                  <div className="currencyBox">{symbolData.base}</div>
                </Box>
                {displayTargetFieldErrors("exitUnitsPercentage", targetId)}
                {displayTargetFieldErrors("exitUnits", targetId)}
              </Box>
            </Box>
          ))}
          <Box className="targetActions" display="flex" flexDirection="row" flexWrap="wrap">
            {!disableRemoveAction && (
              <Button className="removeTarget" onClick={handleTargetRemove}>
                <RemoveCircle />
                <FormattedMessage id="terminal.target.remove" />
              </Button>
            )}
            {!isReadOnly && (
              <Button className="addTarget" onClick={handleTargetAdd}>
                <AddCircle />
                <FormattedMessage id="terminal.target.add" />
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(TakeProfitPanel);
