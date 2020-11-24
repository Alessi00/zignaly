import React, { useState, useEffect, useContext } from "react";
import { Box } from "@material-ui/core";
import CustomSelect from "../../CustomSelect";
import { useFormContext, Controller } from "react-hook-form";
import { useIntl, FormattedMessage } from "react-intl";
import useAvailableBalance from "../../../hooks/useAvailableBalance";
import { OutlinedInput, FormHelperText, FormControl, Switch, Typography } from "@material-ui/core";
import HelperLabel from "../HelperLabel/HelperLabel";
import "./IncreaseStrategyPanel.scss";
import usePositionSizeHandlers from "../../../hooks/usePositionSizeHandlers";
import useOwnCopyTraderProviders from "../../../hooks/useOwnCopyTraderProviders";
import { formatPrice } from "../../../utils/formatters";
import { formatFloat2Dec } from "../../../utils/format";
import { CircularProgress } from "@material-ui/core";
import useEffectSkipFirst from "../../../hooks/useEffectSkipFirst";
import TradingViewContext from "../TradingView/TradingViewContext";
import { useStoreUserExchangeConnections } from "hooks/useStoreUserSelector";
/**
 * @typedef {import("../../../services/coinRayDataFeed").MarketSymbol} MarketSymbol
 * @typedef {import("../../../services/tradeApiClient.types").PositionEntity} PositionEntity
 */

/**
 * @typedef {Object} StrategyPanelProps
 * @property {MarketSymbol} symbolData
 * @property {PositionEntity} positionEntity Position entity.
 */

/**
 * Manual trading increase strategy panel component.
 *
 * @param {StrategyPanelProps} props Component props.
 * @returns {JSX.Element} Strategy panel element.
 */
const IncreaseStrategyPanel = (props) => {
  const { symbolData, positionEntity } = props;
  const [expand, setExpand] = useState(false);
  const expandClass = expand ? "expanded" : "collapsed";
  const { control, errors, register, watch, reset, getValues } = useFormContext();
  const { formatMessage } = useIntl();
  const {
    positionSizeChange,
    validateUnits,
    priceChange,
    realInvestmentChange,
    unitsChange,
    validatePositionSize,
    positionSizePercentageChange,
  } = usePositionSizeHandlers(symbolData, positionEntity.leverage);
  const { balance, loading } = useAvailableBalance();
  const exchangeConnections = useStoreUserExchangeConnections();
  const exchange = exchangeConnections.find(
    (item) => item.internalId === positionEntity.internalExchangeId,
  );
  // temp fix: if user logs out then exchange is null
  const internalId = exchange ? exchange.internalId : null;
  const { loading: loadingProviders, ownCopyTraderProviders } = useOwnCopyTraderProviders(
    internalId,
  );
  const baseBalance = (balance && balance[symbolData.base]) || 0;
  const quoteBalance = (balance && balance[symbolData.quote]) || 0;
  const entryStrategy = watch("entryStrategy");
  const { lastPrice, updatedAt, providerService, setProviderService } = useContext(
    TradingViewContext,
  );
  const providerAllocatedBalance = providerService ? providerService.providerPayableBalance : 0;
  const providerConsumedBalance = providerService ? providerService.providerConsumedBalance : 0;
  const providerConsumedBalancePercentage = providerService
    ? providerService.providerConsumedBalancePercentage
    : 0;

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

  const entryStrategyOptions = [
    { label: formatMessage({ id: "terminal.strategy.limit" }), val: "limit" },
    { label: formatMessage({ id: "terminal.strategy.market" }), val: "market" },
    { label: formatMessage({ id: "terminal.strategy.stoplimit" }), val: "stop_limit" },
  ];

  // Close panel on position update
  useEffect(() => {
    if (updatedAt) {
      setExpand(false);
    }
  }, [updatedAt]);

  const emptyFieldsWhenCollapsed = () => {
    if (!expand) {
      reset({
        ...getValues(),
        stopPrice: "",
        price: "",
        realInvestment: "",
        positionSize: "",
        positionSizePercentage: "",
        units: "",
      });
    }
  };
  useEffectSkipFirst(emptyFieldsWhenCollapsed, [expand]);

  useEffect(() => {
    // Update current provider service to context
    if (!ownCopyTraderProviders) return;

    const provider = ownCopyTraderProviders.find((p) => p.providerId === positionEntity.providerId);
    setProviderService(provider);
  }, [ownCopyTraderProviders]);

  const isClosed = positionEntity ? positionEntity.closed : false;
  const isCopy = positionEntity ? positionEntity.isCopyTrading : false;
  const isCopyTrader = positionEntity ? positionEntity.isCopyTrader : false;
  const isUpdating = positionEntity ? positionEntity.updating : false;
  const isOpening = positionEntity ? positionEntity.status === 1 : false;
  const isDisabled = (isCopy && !isCopyTrader) || isClosed;
  const isReadOnly = isUpdating || isOpening;

  // Don't render when not granted to increase position.
  if (isDisabled) {
    return null;
  }

  return (
    <Box className={`panel strategyPanel ${expandClass}`}>
      <Box alignItems="center" className="panelHeader" display="flex" flexDirection="row">
        <Switch checked={expand} onChange={handleToggle} size="small" />
        <Typography variant="h5">
          <FormattedMessage id="terminal.increasestrategy" />
        </Typography>
      </Box>
      {expand && (
        <Box className="panelContent" display="flex" flexDirection="row" flexWrap="wrap">
          <FormControl className="entryType">
            <HelperLabel
              descriptionId="terminal.increasestrategy.help"
              labelId="terminal.entrytype"
            />
            <Controller
              as={<CustomSelect label="" onChange={() => {}} options={entryStrategyOptions} />}
              control={control}
              defaultValue="limit"
              name="entryStrategy"
            />
          </FormControl>
          {entryStrategy === "stop_limit" && (
            <FormControl>
              <HelperLabel descriptionId="terminal.stopprice.help" labelId="terminal.stopprice" />
              <Box alignItems="center" display="flex">
                <OutlinedInput
                  className="outlineInput"
                  disabled={isReadOnly}
                  inputRef={register}
                  name="stopPrice"
                />
                <div className="currencyBox">{symbolData.quote}</div>
              </Box>
            </FormControl>
          )}
          {entryStrategy !== "market" ? (
            <FormControl>
              <HelperLabel descriptionId="terminal.price.help" labelId="terminal.price" />
              <Box alignItems="center" display="flex">
                <OutlinedInput
                  className="outlineInput"
                  defaultValue={lastPrice}
                  disabled={isReadOnly}
                  error={!!errors.price}
                  inputRef={register({
                    validate: (value) => !isNaN(value) && parseFloat(value) > 0,
                  })}
                  name="price"
                  onChange={priceChange}
                />
                <div className="currencyBox">{symbolData.quote}</div>
              </Box>
              {errors.price && <span className="errorText">{errors.price.message}</span>}
            </FormControl>
          ) : (
            <input defaultValue={lastPrice} name="price" ref={register} type="hidden" />
          )}
          {positionEntity.exchangeType === "futures" && !positionEntity.isCopyTrader && (
            <FormControl>
              <HelperLabel descriptionId="terminal.realinvest.help" labelId="terminal.realinvest" />
              <Box alignItems="center" display="flex">
                <OutlinedInput
                  className="outlineInput"
                  disabled={isReadOnly}
                  inputRef={register({
                    validate: (value) => !isNaN(value) && parseFloat(value) >= 0,
                  })}
                  name="realInvestment"
                  onChange={realInvestmentChange}
                  placeholder={"0"}
                />
                <div className="currencyBox">{symbolData.quote}</div>
              </Box>
              <FormHelperText>
                <FormattedMessage id="terminal.available" />{" "}
                {loading ? (
                  <CircularProgress color="primary" size={20} />
                ) : (
                  <span className="balance">{quoteBalance}</span>
                )}
              </FormHelperText>
            </FormControl>
          )}
          {!isCopyTrader && (
            <FormControl>
              <HelperLabel
                descriptionId="terminal.position.size.help"
                labelId="terminal.position.size"
              />
              <Box alignItems="center" display="flex">
                <OutlinedInput
                  className="outlineInput"
                  disabled={isReadOnly}
                  error={!!errors.positionSize}
                  inputRef={register({
                    validate: validatePositionSize,
                  })}
                  name="positionSize"
                  onChange={positionSizeChange}
                  placeholder={"0"}
                />
                <div className="currencyBox">{symbolData.quote}</div>
              </Box>
              <FormHelperText>
                <FormattedMessage id="terminal.available" />{" "}
                {loading ? (
                  <CircularProgress color="primary" size={20} />
                ) : (
                  <span className="balance">{quoteBalance}</span>
                )}
              </FormHelperText>
              {errors.positionSize && (
                <span className="errorText">{errors.positionSize.message}</span>
              )}
            </FormControl>
          )}
          {isCopyTrader && (
            <>
              <HelperLabel
                descriptionId="terminal.position.sizepercentage.help"
                labelId="terminal.position.sizepercentage"
              />
              <Box className="positionSizePercentage" display="flex" flexDirection="row">
                <Box display="flex" flexDirection="row">
                  <OutlinedInput
                    className="outlineInput"
                    disabled={isReadOnly}
                    error={!!errors.positionSizePercentage}
                    inputRef={register({
                      required: formatMessage({ id: "terminal.positionsize.percentage.required" }),
                      validate: (value) =>
                        (value > 0 && value <= 100) ||
                        formatMessage({ id: "terminal.positionsize.valid.percentage" }),
                    })}
                    name="positionSizePercentage"
                    onChange={positionSizePercentageChange}
                    placeholder={"0"}
                  />
                  <div className="currencyBox">%</div>
                </Box>
                <Box display="flex" flexDirection="row">
                  <OutlinedInput
                    className="outlineInput"
                    inputRef={register}
                    name="positionSizeAllocated"
                    placeholder={"0"}
                    readOnly={true}
                  />
                  <div className="currencyBox">{symbolData.unitsInvestment}</div>
                </Box>
              </Box>
              <FormHelperText>
                <FormattedMessage id="terminal.provider.allocated" />{" "}
                {loadingProviders ? (
                  <CircularProgress color="primary" size={20} />
                ) : (
                  <span className="balance">{formatPrice(providerAllocatedBalance)} </span>
                )}
                <FormattedMessage id="terminal.provider.consumed" />{" "}
                {!loadingProviders && (
                  <span className="balance">{formatPrice(providerConsumedBalance)} </span>
                )}
                <FormattedMessage id="terminal.provider.available" />{" "}
                {!loadingProviders && (
                  <span className="balance">
                    {formatFloat2Dec(100 - providerConsumedBalancePercentage)}%
                  </span>
                )}
              </FormHelperText>
              {errors.positionSizePercentage && (
                <span className="errorText">{errors.positionSizePercentage.message}</span>
              )}
            </>
          )}
          {!isCopyTrader && (
            <FormControl>
              <HelperLabel descriptionId="terminal.units.help" labelId="terminal.units" />
              <Box alignItems="center" display="flex">
                <OutlinedInput
                  className="outlineInput"
                  disabled={isReadOnly}
                  error={!!errors.units}
                  inputRef={register({
                    validate: validateUnits,
                  })}
                  name="units"
                  onChange={unitsChange}
                  placeholder={"0"}
                />
                <div className="currencyBox">{symbolData.base}</div>
              </Box>
              <FormHelperText>
                <FormattedMessage id="terminal.available" />{" "}
                {loading ? (
                  <CircularProgress color="primary" size={15} />
                ) : (
                  <span className="balance">{baseBalance}</span>
                )}
              </FormHelperText>
              {errors.units && <span className="errorText">{errors.units.message}</span>}
            </FormControl>
          )}
        </Box>
      )}
    </Box>
  );
};

export default React.memo(IncreaseStrategyPanel);
