import React, { useEffect, useState } from "react";
import tradeApi from "../../../services/tradeApiClient";
import useStoreSessionSelector from "../../../hooks/useStoreSessionSelector";
import useStoreSettingsSelector from "../../../hooks/useStoreSettingsSelector";
import { showErrorAlert } from "../../../store/actions/ui";
import { useDispatch } from "react-redux";
import { Box, CircularProgress, Typography } from "@material-ui/core";
import TradingPerformance from "../../Provider/Analytics/TradingPerformance";
import TotalEquityBar from "../../TotalEquityBar";
import EquityPart from "../../TotalEquityBar/EquityPart";
import { formatFloat } from "../../../utils/format";
import { generateStats } from "../../../utils/stats";
import ProfitSharingTable from "./ProfitSharingTable";
import ProfitSharingEquityChart from "./ProfitSharingEquityChart";
import "./ProfitSharingAnalytics.scss";
import dayjs from "dayjs";

/**
 * @typedef {import("../../../services/tradeApiClient.types").ProfitSharingBalanceHistory} ProfitSharingBalanceHistory
 * @typedef {import("../../../services/tradeApiClient.types").ProviderEntity} ProviderEntity
 * @typedef {import("../../../services/tradeApiClient.types").DefaultProviderPerformanceWeeklyStats} DefaultProviderPerformanceWeeklyStats
 * @typedef {import("../../../services/tradeApiClient.types").ProviderPerformanceEntity} ProviderPerformanceEntity
 * @typedef {import("../../../services/tradeApiClient.types").ProfitSharingBalanceEntry} ProfitSharingBalanceEntry
 * @typedef {import("../../Balance/TotalEquity/TotalEquityGraph/TotalEquityGraph").EquityChartData} EquityChartData
 */

/**
 * @typedef {Object} DefaultProps
 * @property {ProviderEntity} provider
 */

/**
 * Render analytics panels for profit sharing providers.
 *
 * @param {DefaultProps} props Component props.
 * @returns {JSX.Element} JSX
 */
const ProfitSharingAnalytics = ({ provider }) => {
  const storeSession = useStoreSessionSelector();
  const [balanceHistory, setBalanceHistory] = useState(
    /** @type {ProfitSharingBalanceHistory} */ (null),
  );
  const [balanceHistoryLoading, setBalanceHistoryLoading] = useState(false);

  /**
   * @typedef {Object} Stats
   * @property {Array<ProfitSharingBalanceEntry>} accounting
   * @property {Array<EquityChartData>} balance
   * @property {ProviderPerformanceEntity} performance
   */
  const [stats, setStats] = useState(
    /** @type {Stats} */ ({
      accounting: [],
      balance: [],
      performance: null,
    }),
  );
  const storeSettings = useStoreSettingsSelector();
  const dispatch = useDispatch();

  /**
   * Parse balance entries to prepare stats
   * @param {Array<ProfitSharingBalanceEntry>} entries Balance entries
   * @returns {void}
   */
  const parseEntries = (entries) => {
    /** @type {Array<EquityChartData>} */
    const balanceStats = [];
    // Prepare balance daily stats
    generateStats(entries, {}, (date, data) => {
      const lastData = balanceStats.length ? balanceStats[balanceStats.length - 1] : null;
      const amount = data ? data.amount : 0;

      if (lastData && date.isSame(lastData.date, "d")) {
        // Multiple data for same day, update last stats
        balanceStats[balanceStats.length - 1].totalUSDT += amount;
        // Todo: Refactor TotalEquityGraph to not require totalWalletUSDT
        balanceStats[balanceStats.length - 1].totalWalletUSDT += amount;
      } else {
        const lastAmount = lastData ? lastData.totalUSDT : 0;
        // Add new daily stats
        balanceStats.push({
          date: date.format("YYYY/MM/DD"),
          totalUSDT: lastAmount + amount,
          totalWalletUSDT: lastAmount + amount,
        });
      }
    });

    /** @type {Array<DefaultProviderPerformanceWeeklyStats>} */
    let weekStats = [];
    /** @type {Array<ProfitSharingBalanceEntry>} */
    let accountingStats = [];

    // Prepare weekly profit stats and accounting stats
    entries.forEach((entry) => {
      const dayDate = dayjs(entry.date).startOf("d");
      console.log(entry.type);
      if (["pnl", "successFee"].includes(entry.type)) {
        // Calculate total PnL by week for weekly profit stats
        const week = dayDate.week();
        const statsPnLWeek = weekStats.length && weekStats[weekStats.length - 1];
        if (statsPnLWeek && dayjs(statsPnLWeek.day).isSame(dayDate, "w")) {
          statsPnLWeek.return += entry.amount;
        } else {
          weekStats.push({
            week: `${dayDate.year()}-${week}`,
            return: entry.amount,
            day: dayDate.format(),
            positions: 1,
          });
        }
      }

      const existingStats = accountingStats.find(
        (s) => dayjs(s.date).isSame(entry.date, "d") && s.type === entry.type,
      );

      // Prepare accounting data, grouped by day and type
      if (existingStats) {
        existingStats.amount += entry.amount;
      } else {
        accountingStats.push({
          date: dayDate.toDate(),
          amount: entry.amount,
          type: entry.type,
        });
      }
    });

    setStats({
      performance: {
        weeklyStats: weekStats,
        closePositions: 0,
        openPositions: 0,
        totalBalance: 0,
        totalTradingVolume: 0,
      },
      accounting: accountingStats,
      balance: balanceStats,
    });
  };

  const getProfitSharingBalanceHistory = () => {
    const payload = {
      token: storeSession.tradeApi.accessToken,
      providerId: provider.id,
      exchangeInternalId: provider.exchangeInternalId,
    };
    setBalanceHistoryLoading(true);

    tradeApi
      .getProfitSharingBalanceHistory(payload)
      .then((response) => {
        parseEntries(response.entries);
        setBalanceHistory(response);
      })
      .catch((e) => {
        dispatch(showErrorAlert(e));
      })
      .finally(() => {
        setBalanceHistoryLoading(false);
      });
  };
  useEffect(getProfitSharingBalanceHistory, [provider]);

  return (
    <Box
      alignItems="center"
      className="profitSharingAnalytics"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      {balanceHistoryLoading ? (
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          mt="50px"
        >
          <CircularProgress color="primary" size={50} />
        </Box>
      ) : (
        balanceHistory && (
          <>
            <TradingPerformance performance={stats.performance} unit=" USDT" />
            <TotalEquityBar>
              <>
                <EquityPart
                  name="profitsharing.initAllocated"
                  value={
                    <>
                      {balanceHistory.quote} {formatFloat(balanceHistory.initBalance)}
                    </>
                  }
                />
                <span className="operator">|</span>
                <EquityPart
                  name="profitsharing.currentAllocated"
                  //   info={<>= USDT {formatFloat(10.1)}</>}
                  value={
                    <>
                      {/* <Typography className={`number1`}> */}
                      {balanceHistory.quote} {formatFloat(balanceHistory.currentBalance)}
                      {/* </Typography> */}
                      {/* <Typography className={`number1 pnlPercent ${color}`}>10%</Typography> */}
                    </>
                  }
                />
                <span className="operator">|</span>
                <EquityPart
                  name="profitsharing.retain"
                  value={
                    <>
                      <Typography className="number1">
                        {balanceHistory.quote} {formatFloat(balanceHistory.retain)}
                      </Typography>
                    </>
                  }
                />
                <span className="operator">|</span>
                <EquityPart
                  name="profitsharing.watermark"
                  value={
                    <>
                      {balanceHistory.quote} {formatFloat(balanceHistory.watermark)}
                    </>
                  }
                />
              </>
            </TotalEquityBar>

            <Box className="chartTableBox" display="flex" width={1}>
              <ProfitSharingEquityChart
                currentBalance={balanceHistory.currentBalance}
                data={stats.balance}
                selectedExchange={storeSettings.selectedExchange}
              />
              <ProfitSharingTable data={stats.accounting} />
            </Box>
          </>
        )
      )}
    </Box>
  );
};

export default ProfitSharingAnalytics;
