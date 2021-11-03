import React, { useCallback, useEffect, useMemo, useState } from "react";
import tradeApi from "services/tradeApiClient";
import { AlignCenter } from "styles/styles";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Grid,
  Typography,
} from "@material-ui/core";
import { FormattedMessage, useIntl } from "react-intl";
import ZIGIcon from "images/wallet/zignaly-coin.svg";
import Table, { TableLayout } from "./Table";
import styled from "styled-components";
import dayjs from "dayjs";
import NumberFormat from "react-number-format";
import { getChainIcon } from "utils/chain";
import { ChevronDown, ChevronUp } from "react-feather";
import { ArrowRightAlt } from "@material-ui/icons";

const TypographyRow = styled(Typography)`
  font-weight: 600;
`;

const TypographyTime = styled(Typography)`
  font-weight: 600;
  color: ${({ theme }) => theme.newTheme.secondaryText};
`;

const TypographyTx = styled(Typography)`
  font-size: 12px;
  color: ${({ theme }) => theme.newTheme.secondaryText};
  margin-top: 10px;
  line-height: 16px;
  width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 58px;
`;

const TypographyView = styled(Typography)`
  color: ${({ theme }) => theme.newTheme.linkText};
  font-size: 13px;
  margin-top: 10px;
  line-height: 16px;
`;

const TypographyToken = styled(Typography)`
  font-weight: 600;
  margin-left: 8px;
`;

const TypographyLabel = styled(Typography)`
  font-weight: 600;
  font-size: 13px;
`;

const TypographyAddress = styled(Typography)`
  font-size: 12px;
  margin-left: 16px;
`;

const StyledTransferPanel = styled.div`
  background-color: ${({ theme }) => theme.newTheme.backgroundAltColor};
  border: 1px dashed ${({ theme }) => (theme.palette.type === "dark" ? "#5A51F5" : "#a586e0")};
  margin: 0 16px;
  padding: 28px 20px;
`;

const StyledTransferImg = styled.img`
  margin-left: 16px;
`;

const getStatusColor = (status, theme) => {
  switch (status) {
    case "SUCCESS":
      return theme.newTheme.green;
    case "IN_PROGRESS":
      return theme.newTheme.yellow;
    case "FAILED":
      return theme.newTheme.red;
    default:
      return null;
  }
};

const getStatusTextId = (status) => {
  switch (status) {
    case "SUCCESS":
      return "wallet.status.completed";
    case "IN_PROGRESS":
      return "wallet.status.progress";
    case "FAILED":
      return "wallet.status.failed";
    default:
      return null;
  }
};

interface TypographyStatusProps {
  status: string;
}
const TypographyStatus = styled(Typography)`
  font-weight: 600;
  color: ${(props: TypographyStatusProps) => getStatusColor(props.status, props.theme)};
`;

const TransferChainLabel = (transaction) => (
  <StyledTransferImg width={24} height={24} src={getChainIcon(transaction.network)} />
);

const TransferZigLabel = () => (
  <>
    <StyledTransferImg width={24} height={24} src={ZIGIcon} style={{ marginRight: "8px" }} />
    <TypographyLabel>
      <FormattedMessage id="wallet.zig" />
    </TypographyLabel>
  </>
);

const WalletTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionsHistory[]>();
  const intl = useIntl();

  const columns = [
    {
      Header: intl.formatMessage({ id: "col.date" }),
      accessor: "date",
    },
    {
      Header: intl.formatMessage({ id: "accounts.exchange.type" }),
      accessor: "type",
    },
    {
      Header: intl.formatMessage({ id: "col.amount" }),
      accessor: "amount",
    },
    {
      Header: intl.formatMessage({ id: "col.token" }),
      accessor: "coin",
    },
    {
      Header: intl.formatMessage({ id: "col.network" }),
      accessor: "network",
    },
    {
      Header: intl.formatMessage({ id: "col.stat" }),
      accessor: "status",
    },
    {
      Header: "",
      id: "action",
      // accessor: "action",
      Cell: ({ row }) => (
        <span {...row.getToggleRowExpandedProps({})}>
          {row.isExpanded ? <ChevronUp /> : <ChevronDown />}
        </span>
      ),
    },
    { Header: "", accessor: "transactionId" },
  ];

  const data =
    transactions &&
    transactions.map((t) => ({
      date: (
        <Box display="flex" justifyContent="center">
          <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
            <TypographyRow>{dayjs(t.createdAt).format("MMM DD")}</TypographyRow>
            <TypographyTx>{t.transactionId}</TypographyTx>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center" ml={2}>
            <TypographyTime>{dayjs(t.createdAt).format("hh:mm A")}</TypographyTime>
            {t.txUrl && (
              <a href={t.txUrl} target="_blank" rel="noreferrer">
                <TypographyView>
                  <FormattedMessage id="action.view" />
                </TypographyView>
              </a>
            )}
          </Box>
        </Box>
      ),
      type: (
        <AlignCenter>
          <TypographyRow>
            <FormattedMessage id={`wallet.type.${t.type.toLowerCase()}`} />
          </TypographyRow>
        </AlignCenter>
      ),
      amount: (
        <AlignCenter direction={"column"}>
          <Typography style={{ fontWeight: 600 }}>
            <NumberFormat
              value={t.formattedAmount}
              displayType="text"
              thousandSeparator={true}
              prefix={parseFloat(t.formattedAmount) > 0 && "+"}
            />
          </Typography>
        </AlignCenter>
      ),
      coin: (
        <AlignCenter>
          <img width={24} height={24} src={ZIGIcon} />
          <TypographyToken>{t.currency}</TypographyToken>
        </AlignCenter>
      ),
      network: (
        <AlignCenter>
          <img width={24} height={24} src={getChainIcon(t.network)} />
          <TypographyToken>{t.network}</TypographyToken>
        </AlignCenter>
      ),
      status: (
        <AlignCenter>
          <TypographyStatus status={t.status}>
            <FormattedMessage id={getStatusTextId(t.status)} />
          </TypographyStatus>
        </AlignCenter>
      ),
      transactionId: t.transactionId,
      // action: (
      //   <Accordion>
      //     <AccordionSummary
      //       expandIcon={<ChevronDown />}
      //       aria-controls="panel-content"
      //     ></AccordionSummary>
      //     <AccordionDetails>

      //     </AccordionDetails>
      //   </Accordion>
      // ),
    }));

  const renderRowSubComponent = useCallback(
    ({ row }) => {
      const { transactionId } = row.values;
      const transaction = transactions.find((t) => t.transactionId === transactionId);
      const isWithdrawal = transaction.amount.startsWith("-");

      return (
        <StyledTransferPanel>
          {transaction.type !== "internal" && (
            <Box display="flex" alignItems="center">
              <TypographyLabel>
                <FormattedMessage id="wallet.from" />
              </TypographyLabel>
              {isWithdrawal ? (
                <TransferZigLabel />
              ) : (
                <TransferChainLabel transaction={transaction} />
              )}
              <TypographyAddress>{transaction.fromAddress}</TypographyAddress>
              <ArrowRightAlt style={{ margin: "0 21px" }} />
              <TypographyLabel>
                <FormattedMessage id="wallet.to" />
              </TypographyLabel>
              {isWithdrawal ? (
                <TransferChainLabel transaction={transaction} />
              ) : (
                <TransferZigLabel />
              )}
              <TypographyAddress>{transaction.toAddress}</TypographyAddress>
            </Box>
          )}
          <Box display="flex" alignItems="center" mt="18px">
            <TypographyLabel>
              <FormattedMessage id="wallet.tx" />
            </TypographyLabel>
            <TypographyAddress>{transactionId}</TypographyAddress>
          </Box>
        </StyledTransferPanel>
      );
    },
    [transactions],
  );

  useEffect(() => {
    tradeApi.getWalletTransactionsHistory().then((response) => {
      setTransactions(response);
      // console.log(response);
    });
  }, []);

  if (!transactions) {
    return (
      <Box alignItems="center" display="flex" justifyContent="center">
        <CircularProgress color="primary" size={40} />
      </Box>
    );
  }

  const tableState = {
    hiddenColumns: ["transactionId"],
  };

  return (
    <TableLayout>
      <Table
        data={data}
        columns={columns}
        renderRowSubComponent={renderRowSubComponent}
        initialState={tableState}
      />
    </TableLayout>
  );
};

export default WalletTransactions;
