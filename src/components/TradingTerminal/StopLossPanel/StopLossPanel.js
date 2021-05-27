import React, { useEffect, useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { isNumber } from "lodash";
import { Box, Typography, Switch, FormHelperText } from "@material-ui/core";
import { formatFloat2Dec } from "../../../utils/format";
import { formatPrice } from "../../../utils/formatters";
import { useFormContext, Controller } from "react-hook-form";
import useExpandable from "../../../hooks/useExpandable";
import useValidation from "../../../hooks/useValidation";
import usePositionEntry from "../../../hooks/usePositionEntry";
import "./StopLossPanel.scss";
import CustomSelect from "../../CustomSelect";
import { some } from "lodash";
import PricePercentageControl from "../Controls/PricePercentageControl";
import StopLossStatus from "../StopLossStatus/StopLossStatus";

/**
 * @typedef {import("services/tradeApiClient.types").MarketSymbol} MarketSymbol
 * @typedef {import("../../../services/tradeApiClient.types").PositionEntity} PositionEntity
 */

/**
 * @typedef {Object} StopLossPanel
 * @property {MarketSymbol} symbolData
 * @property {PositionEntity} [positionEntity] Position entity (optional) for position edit trading view.
 * @property {boolean} [isReadOnly] Flag to disable edition.
 */

/**
 * Manual trading stop loss panel component.
 *
 * @param {StopLossPanel} props Component props.
 * @returns {JSX.Element} Take profit panel element.
 */
const StopLossPanel = (props) => {
  const { symbolData, positionEntity, isReadOnly = false } = props;
  const existsStopLoss = positionEntity
    ? isNumber(positionEntity.stopLossPrice) && isNumber(positionEntity.stopLossPercentage)
    : false;
  const { expanded, expandClass, setExpanded } = useExpandable(existsStopLoss);
  const {
    clearErrors,
    errors,
    getValues,
    register,
    setValue,
    watch,
    trigger,
    control,
  } = useFormContext();
  const { lessThan } = useValidation();
  const { getEntryPrice, getEntryPricePercentChange } = usePositionEntry(positionEntity);
  const { formatMessage } = useIntl();
  // Strategy panels inputs to observe for changes.
  const entryType = positionEntity ? positionEntity.side : watch("entryType");
  let type = "fixed";
  if (positionEntity) {
    if (positionEntity.stopLossFollowsTakeProfit) {
      type = "stopLossFollowsTakeProfit";
    } else if (positionEntity.stopLossToBreakEven) {
      type = "stopLossToBreakEven";
    }
  }
  const strategyPrice = watch("price");
  const isClosed = positionEntity ? positionEntity.closed : false;
  const hasReachedTp = positionEntity && some(positionEntity.takeProfitTargets, (tp) => tp.done);

  const stopLossTypeOptions = [
    { label: formatMessage({ id: "terminal.stoploss.type.fixed" }), val: "fixed" },
    {
      label: formatMessage({ id: "terminal.stoploss.type.followtp" }),
      val: "stopLossFollowsTakeProfit",
    },
    {
      label: formatMessage({ id: "terminal.stoploss.type.breakeven" }),
      val: "stopLossToBreakEven",
    },
  ];

  const getFieldsDisabledStatus = () => {
    /**
     * @type {Object<string, boolean>}
     */
    const fieldsDisabled = {};
    let disabled = false;
    if (isReadOnly) {
      disabled = true;
    }

    fieldsDisabled.stopLossPrice = disabled;
    fieldsDisabled.stopLossPercentage = disabled;
    fieldsDisabled.stopLossType = disabled || hasReachedTp;

    return fieldsDisabled;
  };

  const fieldsDisabled = getFieldsDisabledStatus();

  /**
   * Validate target percentage limits.
   *
   * @returns {boolean} true if validation pass, false otherwise.
   */
  function validateStopLossPercentageLimits() {
    const draftPosition = getValues();
    const stopLossPercentage = parseFloat(draftPosition.stopLossPercentage);
    const pricePercentChange = formatFloat2Dec(getEntryPricePercentChange());
    return lessThan(
      stopLossPercentage,
      pricePercentChange,
      entryType,
      "terminal.stoploss.valid.percentage",
      { value: pricePercentChange },
    );
  }

  /**
   * Calculate price based on percentage when value is changed.
   *
   * @return {Void} None.
   */
  const stopLossPercentageChange = useCallback(() => {
    if (errors.stopLossPercentage) return;

    const draftPosition = getValues();
    const price = getEntryPrice();
    const stopLossPercentage = parseFloat(draftPosition.stopLossPercentage);
    const stopLossPrice = (price * (100 + stopLossPercentage)) / 100;

    if (!isNaN(price) && price > 0) {
      setValue("stopLossPrice", formatPrice(stopLossPrice, "", ""));
    } else {
      setValue("stopLossPrice", "");
    }

    trigger("stopLossPrice");
  }, [errors, getEntryPrice, getValues, setValue, trigger]);

  /**
   * Calculate percentage based on price when value is changed.
   *
   * @return {Void} None.
   */
  const stopLossPriceChange = useCallback(() => {
    if (errors.stopLossPrice) return;

    const draftPosition = getValues();
    const price = getEntryPrice();
    const stopLossPrice = parseFloat(draftPosition.stopLossPrice);
    const priceDiff = stopLossPrice - price;

    if (!isNaN(priceDiff) && priceDiff !== 0) {
      const stopLossPercentage = (priceDiff / price) * 100;
      setValue("stopLossPercentage", formatFloat2Dec(stopLossPercentage));
    } else {
      setValue("stopLossPercentage", "");
    }

    trigger("stopLossPercentage");
  }, [errors, getEntryPrice, getValues, setValue, trigger]);

  const initStopLoss = () => {
    if (expanded) {
      if (positionEntity && positionEntity.stopLossPercentage) {
        setValue("stopLossPercentage", formatFloat2Dec(positionEntity.stopLossPercentage));
        setValue("stopLossPriority", positionEntity.stopLossPriority);
        setValue("stopLossPrice", formatPrice(positionEntity.stopLossPrice, "", ""));
      }
      updateStopLoss();
    } else {
      setValue("stopLossPrice", "");
      if (errors.stopLossPercentage) {
        clearErrors("stopLossPercentage");
      }

      if (errors.stopLossPrice) {
        clearErrors("stopLossPrice");
      }
    }
  };
  useEffect(initStopLoss, [expanded]);

  const updateStopLoss = () => {
    const draftPosition = getValues();
    const initialStopLossPercentage = positionEntity ? positionEntity.stopLossPercentage : null;
    const stopLossPercentage =
      parseFloat(draftPosition.stopLossPercentage) || initialStopLossPercentage;
    const sign = entryType === "SHORT" ? "" : "-";

    if (isNaN(stopLossPercentage)) {
      setValue("stopLossPercentage", sign);
    } else {
      // When SL come from backend rely on the existing sign and value.
      // Otherwise use the custom SL value and apply the sign corresponding to entry type.
      const newValue = formatFloat2Dec(initialStopLossPercentage || Math.abs(stopLossPercentage));
      setValue("stopLossPercentage", formatFloat2Dec(newValue));
      // todo: simulateInputChangeEvent
    }
  };

  useEffect(updateStopLoss, [entryType, strategyPrice]);

  return (
    <Box className={`panel stopLossPanel ${expandClass}`}>
      <Box alignItems="center" className="panelHeader" display="flex" flexDirection="row">
        {!isClosed && (
          <Switch checked={expanded} onChange={(e) => setExpanded(e.target.checked)} size="small" />
        )}
        <Box alignItems="center" className="title" display="flex" flexDirection="row">
          <Typography variant="h5">
            <FormattedMessage id="terminal.stoploss" />
          </Typography>
          <input name="unrealizedProfitLossesPercentage" ref={register} type="hidden" />
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
          <Box className="stopLoss">
            <PricePercentageControl
              disabled={isReadOnly}
              labelDescriptionId="terminal.stoploss.help"
              labelId="terminal.stoploss"
              percentage={{
                name: "stopLossPercentage",
                validate: validateStopLossPercentageLimits,
                onChange: stopLossPercentageChange,
              }}
              price={{
                name: "stopLossPrice",
                onChange: stopLossPriceChange,
                error: formatMessage({ id: "terminal.stoploss.limit.zero" }),
              }}
              priorityName="stopLossPriority"
              quote={symbolData.quote}
              status={
                positionEntity &&
                positionEntity.exchangeType === "futures" &&
                positionEntity.stopLossPercentage ? (
                  <StopLossStatus orderId={positionEntity.stopLossOrderId} />
                ) : (
                  <div />
                )
              }
            />
          </Box>
          <Box alignItems="center" className="title" display="flex" flexDirection="row" mt="12px">
            <FormHelperText>
              <FormattedMessage id="terminal.stoploss.type" />
            </FormHelperText>
            <Controller
              as={
                <CustomSelect
                  disabled={fieldsDisabled.stopLossType}
                  label=""
                  onChange={() => {}}
                  options={stopLossTypeOptions}
                />
              }
              control={control}
              defaultValue={type}
              name="stopLossType"
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(StopLossPanel);
