import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { Table, Button, ButtonGroup, PriceLabel, CoinLabel } from "zignaly-ui";
import { useExchangeAssets } from "lib/hooks/useAPI";
import useUser from "lib/hooks/useUser";
import Loader from "components/common/Loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import { ModalTypesId } from "typings/modal";
import { openModal } from "store/actions/ui";
import { setHiddenColumn } from "store/actions/settings";

const TABLE_NAME = "dashboardCoins";

const DashboardCoins = () => {
  const intl = useIntl();
  const { selectedExchange } = useUser();
  const { data: assets, error } = useExchangeAssets(selectedExchange?.internalId, true);
  const dispatch = useDispatch();
  const hiddenColumns = useSelector(
    (state: any) => state.settings.hiddenColumns && state.settings.hiddenColumns[TABLE_NAME],
  );

  const columns = [
    {
      Header: intl.formatMessage({ id: "col.coin" }),
      accessor: "coin",
    },
    {
      Header: intl.formatMessage({ id: "col.coins.total" }),
      accessor: "totalBalance",
    },
    {
      Header: intl.formatMessage({ id: "col.coins.available" }),
      accessor: "availableBalance",
    },
    {
      Header: intl.formatMessage({ id: "col.coins.locked" }),
      accessor: "lockedBalance",
    },
    {
      Header: intl.formatMessage({ id: "col.totalValueBTC" }),
      accessor: "totalBTC",
    },
    {
      Header: intl.formatMessage({ id: "col.totalValueUSD" }),
      accessor: "totalUSD",
    },
  ];

  const data = assets
    ? Object.entries(assets)
        // todo: remove once sorting fixed
        .sort((a, b) => parseFloat(b[1].balanceTotalUSDT) - parseFloat(a[1].balanceTotalUSDT))
        .map(([coin, coinBalance]) => ({
          coin: <CoinLabel coin={coin} name={coinBalance.name} />,
          totalBalance: <PriceLabel coin={coin} value={coinBalance.balanceTotal} />,
          availableBalance: <PriceLabel coin={coin} value={coinBalance.balanceFree} />,
          lockedBalance: <PriceLabel coin={coin} value={coinBalance.balanceLocked} />,
          totalBTC: <PriceLabel coin="BTC" value={coinBalance.balanceTotalBTC} />,
          totalUSD: <PriceLabel coin="USD" value={coinBalance.balanceTotalUSDT} fiat />,
          action: (
            <ButtonGroup>
              <Button
                variant="secondary"
                caption={intl.formatMessage({ id: "action.deposit" })}
                onClick={() =>
                  dispatch(
                    openModal(ModalTypesId.DEPOSIT_MODAL, {
                      initialCoin: coin,
                    }),
                  )
                }
              />
              <Button
                variant="secondary"
                caption={intl.formatMessage({ id: "action.withdraw" })}
                onClick={() =>
                  dispatch(
                    openModal(ModalTypesId.WITHDRAW_MODAL, {
                      initialCoin: coin,
                    }),
                  )
                }
              />
            </ButtonGroup>
          ),
        }))
    : undefined;

  const handleColumnHidden = (column, isHidden) => {
    dispatch(setHiddenColumn({ column, isHidden, table: TABLE_NAME }));
  };

  return data ? (
    <Table
      columns={columns}
      data={data}
      defaultHiddenColumns={hiddenColumns}
      onColumnHidden={handleColumnHidden}
    />
  ) : (
    <Loader />
  );
};

export default DashboardCoins;
