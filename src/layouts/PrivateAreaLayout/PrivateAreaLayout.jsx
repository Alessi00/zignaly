import React, { useEffect } from "react";
import "./PrivateAreaLayout.scss";
import { Box, Hidden, useMediaQuery } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import Header from "../../components/Navigation/Header";
import MobileHeader from "../../components/Navigation/MobileHeader";
import MobileAppbar from "../../components/Navigation/MobileAppbar";
import Sidebar from "../../components/Navigation/Sidebar";
import GlobalModal from "../../components/GlobalModal";
import ConnectExchangeView from "../../components/ConnectExchangeView";
import SettingsView from "../../components/SettingsView";
import WalletView from "../../components/WalletView";
import { useDispatch } from "react-redux";
import { refreshSessionData } from "../../store/actions/session";
import { minToMillisec } from "../../utils/timeConvert";
import { ConfirmDialog } from "../../components/Dialogs";
import useInterval from "../../hooks/useInterval";
import useAppUpdatesCheck from "../../hooks/useAppUpdatesCheck";
import usePrivateAreaContext from "hooks/usePrivateAreaContext";
import PrivateAreaContext from "context/PrivateAreaContext";
import useUpdatedBalance from "hooks/useUpdatedBalance";
import tradeApi from "services/tradeApiClient";
import InviteModal from "components/Navigation/Header/InviteModal";
import VaultsView from "components/WalletView/Vault/VaultView";
import Zigpad from "components/WalletView/Zigpad/Zigpad";
import { Alert, AlertTitle } from "@material-ui/lab";
import { FormattedMessage } from "react-intl";

/**
 * @typedef {Object} PrivateAreaLayoutProps
 * @property {Object} children
 */

/**
 * Default component props.
 *
 * @param {PrivateAreaLayoutProps} props Default component props.
 * @returns {JSX.Element} Component.
 */
const PrivateAreaLayout = (props) => {
  const { children } = props;
  const dispatch = useDispatch();
  const privateAreaContext = usePrivateAreaContext();
  const { setUserProviders, showInviteModal, inviteModal } = privateAreaContext;

  // Load balance in the context to show in the header, and to show the "Add Fund" button
  useUpdatedBalance(privateAreaContext);

  useEffect(() => {
    // Get connected signal provider to know if we need to display "Connected Providers" tab in the dashboard.
    // Also get connected profit sharing to know if we should display "Start with PS" button
    tradeApi.providersUserGet().then((response) => {
      setUserProviders(response);
    });
  }, []);

  const updateSession = () => {
    dispatch(refreshSessionData());
  };

  useInterval(updateSession, minToMillisec(60), true);

  const { confirmConfig, setConfirmConfig, executeRefresh, postponeRefresh } = useAppUpdatesCheck();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const onVaultClose = () => {
    window.history.back();
  };

  return (
    <PrivateAreaContext.Provider value={privateAreaContext}>
      <ConfirmDialog
        confirmConfig={confirmConfig}
        executeActionCallback={executeRefresh}
        executeCancelCallback={postponeRefresh}
        setConfirmConfig={setConfirmConfig}
      />
      <InviteModal isOpen={inviteModal} onClose={() => showInviteModal(false)} />
      <GlobalModal content={ConnectExchangeView} hash="exchangeAccounts" />
      <GlobalModal content={SettingsView} hash="settings" />
      <GlobalModal content={WalletView} hash="wallet" newTheme={true} showCloseIcon={true} />
      <GlobalModal
        onClose={onVaultClose}
        content={VaultsView}
        hash="vault"
        newTheme={true}
        showCloseIcon={true}
      />
      <GlobalModal content={Zigpad} hash="zigpad" newTheme={true} showCloseIcon={true} />
      {/* <GlobalModal content={WalletDepositView} hash="deposit" /> */}
      <Box bgcolor="background.default" className={"app"}>
        <Box m={isMobile ? "5px 28px 2px" : "10px 56px 3px"}>
          <Alert severity="info" style={{ whiteSpace: "pre-line" }}>
            {/* <AlertTitle>Success</AlertTitle> */}
            <FormattedMessage
              id={"discontinued"}
              values={{
                newLink: (
                  <a href="https://app.zignaly.com" target="_blank">
                    app.zignaly.com
                  </a>
                ),
                oldLink: (
                  <a href="https://trading.zignaly.com" target="_blank">
                    trading.zignaly.com
                  </a>
                ),
              }}
            />
          </Alert>
        </Box>
        <Hidden xsDown>
          <Header />
        </Hidden>
        <Hidden smUp>
          <MobileHeader />
          <MobileAppbar />
        </Hidden>
        <Box className={"body"} display="flex" flexDirection="row" flexWrap="nowrap">
          <Hidden xsDown>
            <Box className={"side"}>
              <Sidebar />
            </Box>
          </Hidden>
          <Box className={"appContent"}>{children}</Box>
        </Box>
      </Box>
    </PrivateAreaContext.Provider>
  );
};

export default PrivateAreaLayout;
