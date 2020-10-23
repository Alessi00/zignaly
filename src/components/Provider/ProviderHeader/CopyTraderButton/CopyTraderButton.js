import React, { useState } from "react";
import "./CopyTraderButton.scss";
import { Box, Typography, Tooltip } from "@material-ui/core";
import CustomButton from "../../../CustomButton";
import { FormattedMessage } from "react-intl";
import Modal from "../../../Modal";
import CopyTraderForm from "../../../Forms/CopyTraderForm";
import useStoreSettingsSelector from "../../../../hooks/useStoreSettingsSelector";
import ExchangeIcon from "../../../ExchangeIcon";
import { useStoreUserExchangeConnections } from "../../../../hooks/useStoreUserSelector";
import ConnectExchange from "../../../Modal/ConnectExchange";
import StopCopyingTraderForm from "../../../Forms/StopCopyingTraderForm";
import tradeApi from "../../../../services/tradeApiClient";
import useStoreSessionSelector from "../../../../hooks/useStoreSessionSelector";
import { useDispatch } from "react-redux";
import { setProvider } from "../../../../store/actions/views";
import { showErrorAlert, showSuccessAlert } from "../../../../store/actions/ui";
import { ConfirmDialog } from "../../../Dialogs";

/**
 * @typedef {Object} DefaultProps
 * @property {import('../../../../services/tradeApiClient.types').DefaultProviderGetObject} provider
 */
/**
 * Provides the navigation bar for the dashboard.
 *
 * @param {DefaultProps} props Default props
 * @returns {JSX.Element} Component JSX.
 */
const CopyTraderButton = ({ provider }) => {
  const { selectedExchange } = useStoreSettingsSelector();
  const storeSession = useStoreSessionSelector();
  const dispatch = useDispatch();
  const exchangeConnections = useStoreUserExchangeConnections();
  const [copyModal, showCopyModal] = useState(false);
  const [connectModal, showConnectModal] = useState(false);
  const [stopCopyingModal, showStopCopyingModal] = useState(false);
  const [cancelDisconnectLoader, showCancelDisconnectLoader] = useState(false);
  const disabled = provider.disable;
  const sameSelectedExchange = provider.exchangeInternalId === selectedExchange.internalId;
  const followingFrom = exchangeConnections.find(
    (e) => e.internalId === provider.exchangeInternalId,
  );
  let disconnectedExchange = provider.exchangeInternalIds.find(
    (item) => item.internalId === selectedExchange.internalId,
  );
  const disconnecting =
    disconnectedExchange && disconnectedExchange.disconnecting
      ? disconnectedExchange.disconnecting
      : false;

  /**
   * @typedef {import("../../../Dialogs/ConfirmDialog/ConfirmDialog").ConfirmDialogConfig} ConfirmDialogConfig
   * @type {ConfirmDialogConfig} initConfirmConfig
   */
  const initConfirmConfig = {
    titleTranslationId: "",
    messageTranslationId: "",
    visible: false,
  };

  const [confirmConfig, setConfirmConfig] = useState(initConfirmConfig);

  const confirmCancel = () => {
    setConfirmConfig({
      titleTranslationId: "copyt.canceldisconnect.title",
      messageTranslationId: "copyt.canceldisconnect.body",
      visible: true,
    });
  };

  const startCopying = () => {
    if (exchangeConnections.length) {
      showCopyModal(true);
    } else {
      showConnectModal(true);
    }
  };

  const handleCopyModalClose = () => {
    showCopyModal(false);
  };

  const handleConnectModalClose = () => {
    showConnectModal(false);
  };

  const handleStopCopyingModalClose = () => {
    showStopCopyingModal(false);
  };

  const cancelDisconnect = () => {
    showCancelDisconnectLoader(true);
    const payload = {
      token: storeSession.tradeApi.accessToken,
      providerId: provider.id,
      internalExchangeId: selectedExchange.internalId,
    };
    tradeApi
      .providerCancelDisconnect(payload)
      .then(() => {
        const providerPayload = {
          token: storeSession.tradeApi.accessToken,
          providerId: provider.id,
          version: 2,
        };
        dispatch(setProvider(providerPayload));
        dispatch(
          showSuccessAlert("srv.canceldisconnect.alert.title", "srv.canceldisconnect.alert.body"),
        );
      })
      .catch((e) => {
        dispatch(showErrorAlert(e));
      })
      .finally(() => {
        showCancelDisconnectLoader(false);
      });
  };

  return (
    <Box
      alignItems="center"
      className="copyTraderButton"
      display="flex"
      flexDirection="row"
      justifyContent="flex-start"
    >
      <ConfirmDialog
        confirmConfig={confirmConfig}
        executeActionCallback={cancelDisconnect}
        setConfirmConfig={setConfirmConfig}
      />
      {disabled && !disconnecting && (
        <CustomButton className="submitButton" onClick={startCopying}>
          <FormattedMessage id="copyt.copythistrader" />
        </CustomButton>
      )}
      {!disabled && !disconnecting && (!followingFrom || sameSelectedExchange) && (
        <CustomButton className="loadMoreButton" onClick={() => showStopCopyingModal(true)}>
          <FormattedMessage id="copyt.stopcopyingtrader" />
        </CustomButton>
      )}
      {!disabled && !disconnecting && !sameSelectedExchange && (
        <Box
          alignItems="center"
          className="actionHelpBox"
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
        >
          <Typography variant="h4">
            <FormattedMessage id="copyt.followingfrom" />
          </Typography>
          <Tooltip placement="top" title={followingFrom ? followingFrom.internalName : ""}>
            <Box>
              <ExchangeIcon
                exchange={followingFrom ? followingFrom.name.toLowerCase() : ""}
                size="mediumLarge"
              />
            </Box>
          </Tooltip>
        </Box>
      )}
      {!disabled && disconnecting && (
        <CustomButton
          className="loadMoreButton"
          loading={cancelDisconnectLoader}
          onClick={confirmCancel}
        >
          <FormattedMessage id="copyt.canceldisconnecting" />
        </CustomButton>
      )}
      <Modal
        onClose={handleStopCopyingModalClose}
        persist={false}
        size="small"
        state={stopCopyingModal}
      >
        <StopCopyingTraderForm onClose={handleStopCopyingModalClose} provider={provider} />
      </Modal>
      <Modal onClose={handleCopyModalClose} persist={false} size="small" state={copyModal}>
        <CopyTraderForm onClose={handleCopyModalClose} provider={provider} />
      </Modal>
      <Modal onClose={handleConnectModalClose} size="small" state={connectModal}>
        <ConnectExchange onClose={handleConnectModalClose} />
      </Modal>
    </Box>
  );
};

export default CopyTraderButton;
