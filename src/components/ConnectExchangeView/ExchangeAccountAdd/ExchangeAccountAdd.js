import React, { useState, useCallback, useContext, useEffect, useImperativeHandle } from "react";
import {
  Box,
  FormControlLabel,
  OutlinedInput,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import "./ExchangeAccountAdd.scss";
import { useForm, FormContext, Controller, useFormContext } from "react-hook-form";
import CustomSelect from "../../CustomSelect";
import { FormattedMessage, useIntl } from "react-intl";
import useExchangeList from "../../../hooks/useExchangeList";
import useEvent from "../../../hooks/useEvent";
import tradeApi from "../../../services/tradeApiClient";
import useStoreSessionSelector from "../../../hooks/useStoreSessionSelector";
import ModalPathContext from "../ModalPathContext";
import Loader from "../../Loader";
import { useDispatch } from "react-redux";
import { setUserExchanges } from "../../../store/actions/user";
import ExchangeAccountForm, { CustomInput, CustomSwitch } from "../ExchangeAccountForm";

/**
 * @typedef {import("../../../services/tradeApiClient.types").ExchangeListEntity} ExchangeListEntity
 */

/**
 * @typedef {Object} DefaultProps
 * @property {string} internalId Internal Exchange id.
 */

/**
 * @param {DefaultProps} props Default props.
 * @returns {JSX.Element} Component JSX.
 */
const ExchangeAccountAdd = ({ create = false, demo = false, navigateToAction }) => {
  const {
    register,
    handleSubmit,
    errors,
    control,
    getValues,
    setValue,
    watch,
    reset,
  } = useFormContext();
  const intl = useIntl();
  const dispatch = useDispatch();
  const storeSession = useStoreSessionSelector();
  const {
    resetToPath,
    pathParams: { previousPath },
    setTitle,
    formRef,
    setTempMessage,
  } = useContext(ModalPathContext);

  useEffect(() => {
    setTitle(
      <FormattedMessage
        id={
          create ? (demo ? "accounts.create.demo" : "accounts.create.exchange") : "accounts.connect"
        }
      />,
    );
  }, []);

  const exchanges = useExchangeList();

  const exchangeType = watch("exchangeType");
  const zignalyOnly = create && !demo;
  const zignalyIncluded = create;
  const testnet = watch("testnet");

  // Initialize selected exchange
  let exchangeName = zignalyOnly ? "zignaly" : watch("exchangeName") || "binance";

  const selectedExchange = exchanges.find(
    (e) => e.name.toLowerCase() === exchangeName.toLowerCase(),
  );
  console.log(exchangeName, selectedExchange, exchanges);
  console.log(exchangeType);

  // Exchange options
  const exchangesOptions = exchanges
    .filter((e) => e.enabled && (e.name.toLowerCase() !== "zignaly" || zignalyIncluded))
    .map((e) => ({
      val: e.name.toLowerCase(),
      label:
        e.name.toLowerCase() === "zignaly"
          ? `${e.name} (${intl.formatMessage({ id: "accounts.powered" })})`
          : e.name,
    }));

  // Create account types options
  const typeOptions =
    selectedExchange &&
    selectedExchange.type.map((t) => ({
      val: t,
      label: t.charAt(0).toUpperCase() + t.slice(1),
    }));

  // Submit form handle
  useImperativeHandle(
    formRef,
    () => ({
      submitForm,
    }),
    [selectedExchange],
  );

  const submitForm = async (data) => {
    const { internalName, exchangeType, key, secret, password, testNet } = data;
    const payload = {
      token: storeSession.tradeApi.accessToken,
      exchangeId: selectedExchange.id,
      internalName,
      exchangeType,
      ...(!create && {
        key,
        secret,
        ...(password && { password }),
      }),
      mainAccount: false,
      isPaperTrading: demo,
      testNet,
    };

    return tradeApi.exchangeAdd(payload).then(() => {
      // Reload user exchanges
      const authorizationPayload = {
        token: storeSession.tradeApi.accessToken,
      };
      dispatch(setUserExchanges(authorizationPayload));
      setTempMessage(<FormattedMessage id={create ? "accounts.created" : "accounts.deleted"} />);
      return true;
    });
  };

  return (
    <form className="ExchangeAccountAdd">
      {!selectedExchange ? (
        <Box className="loadProgress" display="flex" flexDirection="row" justifyContent="center">
          <CircularProgress disableShrink />
        </Box>
      ) : (
        <ExchangeAccountForm>
          {!create ||
            (demo && (
              <Controller
                as={CustomSelect}
                options={exchangesOptions}
                control={control}
                defaultValue={selectedExchange.name.toLowerCase()}
                name="exchangeName"
                rules={{ required: true }}
                label={intl.formatMessage({ id: "accounts.exchange" })}
                onChange={([e]) => {
                  setValue("exchangeType", typeOptions[0].val);
                  setValue("testnet", false);
                  return e;
                }}
              />
            ))}
          {typeOptions.length > 1 && (
            <Controller
              as={CustomSelect}
              options={typeOptions}
              control={control}
              defaultValue={typeOptions[0].val}
              name="exchangeType"
              label={intl.formatMessage({ id: "accounts.exchange.type" })}
            />
          )}
          {demo && exchangeType === "futures" && (
            <CustomSwitch
              label="menu.testnet"
              tooltip=""
              name="testnet"
              defaultValue={false}
              inputRef={register}
            />
          )}
          <CustomInput
            inputRef={register({
              required: "name empty",
            })}
            name="internalName"
            label="accounts.exchange.name"
            errors={errors}
          />
          {(!create || testnet) &&
            selectedExchange.requiredAuthFields.map((field) => (
              <CustomInput
                inputRef={register({
                  required: "required",
                })}
                name={field}
                label={`accounts.exchange.${field}`}
                key={field}
                autoComplete="new-password"
                type="password"
                errors={errors}
              />
            ))}
        </ExchangeAccountForm>
      )}
    </form>
  );
};

export default ExchangeAccountAdd;
