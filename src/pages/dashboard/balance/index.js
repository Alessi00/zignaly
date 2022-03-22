import React from "react";
import "./balance.scss";
import { Box, CircularProgress } from "@mui/material";
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
import useSelectedExchange from "hooks/useSelectedExchange";
import { useIntl } from "react-intl";
import BalanceTabs from "../../../components/Balance/BalanceTabs";
import ProfitLossAnalysis from "../../../components/Balance/ProfitLossAnalysis";

const Balance = () => {
  const dailyBalance = useStoreUserDailyBalance();
  const selectedExchange = useSelectedExchange();
  const { balance, balanceLoading, refreshBalance } = useBalance(selectedExchange.internalId);
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
          <TotalEquity
            dailyBalance={dailyBalance}
            modal={false}
            selectedExchange={selectedExchange}
          />
        </Box>
        <Box className="cryptoBox">
          {selectedExchange.exchangeType === "futures" ? (
            <ProfitLossAnalysis dailyBalance={dailyBalance} />
          ) : (
            <CryptoComposition dailyBalance={dailyBalance} />
          )}
        </Box>
        <Box
          alignItems="center"
          className="balanceBox"
          display="flex"
          flexDirection="row"
          justifyContent="center"
        >
          {balanceLoading ? (
            <CircularProgress color="primary" size={40} />
          ) : selectedExchange.exchangeType === "futures" ? (
            <FuturesAvailableBalance balance={balance} selectedExchange={selectedExchange} />
          ) : (
            <SpotAvailableBalance balance={balance} selectedExchange={selectedExchange} />
          )}
        </Box>
        <Box className="historyBox">
          <BalanceTabs
            dailyBalance={dailyBalance}
            refreshBalance={refreshBalance}
            selectedExchange={selectedExchange}
          />
        </Box>
      </Box>
    </>
  );
};

export default withDashboardLayout(Balance);
