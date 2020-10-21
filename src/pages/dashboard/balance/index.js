import React from "react";
import "./balance.scss";
import { Box } from "@material-ui/core";
import withDashboardLayout from "../../../layouts/dashboardLayout";
import { Helmet } from "react-helmet";
import TotalEquity from "../../../components/Balance/TotalEquity";
import CryptoComposition from "../../../components/Balance/CryptoComposition";
import {
  SpotAvailableBalance,
  FuturesAvailableBalance,
} from "../../../components/Balance/AvailableBalance";
import { useStoreUserDailyBalance } from "../../../hooks/useStoreUserSelector";
import useBalance from "../../../hooks/useBalance";
import useStoreSettingsSelector from "../../../hooks/useStoreSettingsSelector";
import { useIntl } from "react-intl";
import BalanceTabs from "../../../components/Balance/BalanceTabs";
import ProfitLossAnalysis from "../../../components/Balance/ProfitLossAnalysis";

const Balance = () => {
  const dailyBalance = useStoreUserDailyBalance();
  const { selectedExchange } = useStoreSettingsSelector();
  const balance = useBalance(selectedExchange.internalId);
  const intl = useIntl();

  return (
    <>
      <Helmet>
        <title>
          {`${intl.formatMessage({
            id: "dashboard",
          })} - ${intl.formatMessage({
            id: "dashboard.balance",
          })} | ${intl.formatMessage({ id: "product" })}`}
        </title>
      </Helmet>
      <Box
        className="balancePage"
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        justifyContent="center"
      >
        <Box className="equityBox">
          <TotalEquity dailyBalance={dailyBalance} modal={false} />
        </Box>
        <Box className="cryptoBox">
          {selectedExchange.exchangeType === "futures" ? (
            <ProfitLossAnalysis dailyBalance={dailyBalance} />
          ) : (
            <CryptoComposition dailyBalance={dailyBalance} />
          )}
        </Box>
        <Box className="balanceBox">
          {selectedExchange.exchangeType === "futures" ? (
            <FuturesAvailableBalance balance={balance} selectedExchange={selectedExchange} />
          ) : (
            <SpotAvailableBalance balance={balance} selectedExchange={selectedExchange} />
          )}
        </Box>
        <Box className="historyBox">
          <BalanceTabs dailyBalance={dailyBalance} selectedExchange={selectedExchange} />
        </Box>
      </Box>
    </>
  );
};

export default withDashboardLayout(Balance);
