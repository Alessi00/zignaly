import React, { useState } from "react";
import "./StopCopyingTraderForm.scss";
import { Box, Typography } from "@material-ui/core";
import { FormattedMessage } from "react-intl";
import CustomButton from "../../CustomButton";
import tradeApi from "../../../services/tradeApiClient";
import useStoreSessionSelector from "../../../hooks/useStoreSessionSelector";
import { useDispatch } from "react-redux";
import { setProvider } from "../../../store/actions/views";
import { showErrorAlert, showSuccessAlert } from "../../../store/actions/ui";
import useStoreSettingsSelector from "../../../hooks/useStoreSettingsSelector";

/**
 * @typedef {import('../../../services/tradeApiClient.types').DefaultProviderGetObject} DefaultProviderGetObject
 * @typedef {Object} DefaultProps
 * @property {Function} onClose
 * @property {DefaultProviderGetObject} provider
 */

/**
 *
 * @param {DefaultProps} props Default props.
 * @returns {JSX.Element} JSx component.
 */
const StopCopyingTraderForm = ({ onClose, provider }) => {
  const storeSession = useStoreSessionSelector();
  const { selectedExchange } = useStoreSettingsSelector();
  const [disconnectionType, setDisconnectType] = useState("soft");
  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch();

  const stopCopying = () => {
    setLoader(true);
    const getProviderPayload = {
      token: storeSession.tradeApi.accessToken,
      providerId: provider.id,
      version: 2,
    };

    if (!provider.profitSharing) {
      const disablePayload = {
        disable: true,
        token: storeSession.tradeApi.accessToken,
        providerId: provider.id,
        type: "connected",
      };
      tradeApi
        .providerDisable(disablePayload)
        .then(() => {
          dispatch(setProvider(getProviderPayload));
          dispatch(showSuccessAlert("copyt.unfollow.alert.title", "copyt.unfollow.alert.body"));
        })
        .catch((e) => {
          dispatch(showErrorAlert(e));
        })
        .finally(() => {
          setLoader(false);
          handleClose();
        });
    } else {
      const disconnectPayload = {
        token: storeSession.tradeApi.accessToken,
        providerId: provider.id,
        internalExchangeId: selectedExchange.internalId,
        disconnectionType: disconnectionType,
      };
      tradeApi
        .providerDisconnect(disconnectPayload)
        .then(() => {
          dispatch(setProvider(getProviderPayload));
          dispatch(showSuccessAlert("copyt.unfollow.alert.title", "copyt.unfollow.alert.body"));
        })
        .catch((e) => {
          dispatch(showErrorAlert(e));
        })
        .finally(() => {
          setLoader(false);
          handleClose();
        });
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Box
      alignItems="flex-start"
      className="stopCopyingForm"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      {provider.profitSharing && (
        <Typography variant="h3">
          <FormattedMessage id="confirm.copyt.unfollow.title2" />
        </Typography>
      )}
      {!provider.profitSharing && (
        <>
          <Typography variant="h3">
            <FormattedMessage id="confirm.copyt.unfollow.title" />
          </Typography>

          <Typography variant="body1">
            <FormattedMessage id="confirm.copyt.unfollow.message" />
          </Typography>
        </>
      )}

      {provider.profitSharing && (
        <Box className="labeledInputsBox" display="flex" flexDirection="column">
          <Box display="flex" flexDirection="row" justifyContent="space-between">
            <span
              className={"button " + (disconnectionType === "soft" ? "checked" : "")}
              onClick={() => setDisconnectType("soft")}
            >
              <FormattedMessage id="trader.softdisconnect" />
            </span>
            {/* <span
              className={"button " + (disconnectType === "hard" ? "checked" : "")}
              onClick={() => setDisconnectType("hard")}
            >
              <FormattedMessage id="trader.harddisconnect" />
            </span> */}
          </Box>
          {disconnectionType === "soft" && (
            <span className="info">
              <FormattedMessage id="trader.softdisconnect.tooltip" />
            </span>
          )}
          {disconnectionType === "hard" && (
            <span className="info">
              <FormattedMessage id="trader.harddisconnect.tooltip" />
            </span>
          )}
        </Box>
      )}

      <Box className="formAction" display="flex" flexDirection="row" justifyContent="flex-end">
        <CustomButton className="textPurple" onClick={handleClose}>
          <FormattedMessage id="confirm.cancel" />
        </CustomButton>

        <CustomButton className="textPurple" loading={loader} onClick={stopCopying}>
          <FormattedMessage id="confirm.accept" />
        </CustomButton>
      </Box>
    </Box>
  );
};

export default StopCopyingTraderForm;
