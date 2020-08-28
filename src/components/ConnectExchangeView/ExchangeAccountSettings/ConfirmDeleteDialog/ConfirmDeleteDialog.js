import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import useBalance from "../../../../hooks/useBalance";
import ModalPathContext from "../../ModalPathContext";
import tradeApi from "../../../../services/tradeApiClient";
import useStoreSessionSelector from "../../../../hooks/useStoreSessionSelector";
import { showErrorAlert } from "../../../../store/actions/ui";
import { useDispatch } from "react-redux";
import { removeUserExchange } from "../../../../store/actions/user";
import { CircularProgress, Box } from "@material-ui/core";
import useProvidersList from "../../../../hooks/useProvidersList";
import CustomButton from "../../../CustomButton";

/**
 * @typedef {import("../../../../services/tradeApiClient.types").ProvidersCollection} ProvidersCollection
 *
 * @typedef {Object} UserProviderListOptions
 * @property {Boolean} connectedOnly
 * @property {Boolean} copyTradersOnly
 *
 * @typedef {Object} ConfirmDialogProps
 * @property {Function} onClose
 * @property {boolean} open
 */

/**
 * Ask for confirmation prior to deleting account.
 *
 * @param {ConfirmDialogProps} props Component properties.
 * @returns {JSX.Element} Confirm dialog element.
 */
const ConfirmDeleteDialog = ({ onClose, open }) => {
  const {
    pathParams: { selectedAccount, previousPath },
    setPathParams,
  } = useContext(ModalPathContext);
  const storeSession = useStoreSessionSelector();
  const [positions, setPositions] = useState(null);
  const [loading, setLoading] = useState(false);
  const balance = useBalance(selectedAccount.internalId);
  const dispatch = useDispatch();

  /**
   *
   * @param {UserProviderListOptions} options Use Provider List options.
   * @returns {ProvidersCollection} Provders list.
   */
  const useTraders = (options) => {
    const { providers } = useProvidersList(options);
    return providers;
  };

  const traders = useTraders({ connectedOnly: true, copyTradersOnly: true });
  const providers = useTraders({ connectedOnly: true, copyTradersOnly: false });

  const loadOpenPositions = () => {
    const payload = {
      token: storeSession.tradeApi.accessToken,
      internalExchangeId: selectedAccount.internalId,
    };

    tradeApi
      .openPositionsGet(payload)
      .then((response) => {
        setPositions(response);
      })
      .catch((e) => {
        dispatch(showErrorAlert(e));
      });
  };
  useEffect(loadOpenPositions, []);

  const deleteExchange = () => {
    setLoading(true);
    const payload = {
      token: storeSession.tradeApi.accessToken,
      internalId: selectedAccount.internalId,
    };

    setPathParams((state) => ({ ...state, isLoading: true }));

    tradeApi
      .exchangeDelete(payload)
      .then(() => {
        dispatch(removeUserExchange(selectedAccount.internalId));
        setPathParams({
          tempMessage: <FormattedMessage id={"accounts.deleted"} />,
          currentPath: previousPath,
        });
      })
      .catch((e) => {
        dispatch(showErrorAlert(e));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const brokerAccountWithFunds =
    selectedAccount.isBrokerAccount && balance && balance.totalUSDT > 0.01;
  return (
    <Dialog onClose={() => onClose()} open={open}>
      <DialogTitle>
        <FormattedMessage id="confirm.deleteexchange.title" />
      </DialogTitle>
      {!balance || !positions ? (
        <Box display="flex" flexDirection="row" justifyContent="center" width={1}>
          <CircularProgress className="loader" />
        </Box>
      ) : (
        <DialogContent>
          <DialogContentText color="textPrimary">
            {brokerAccountWithFunds ? (
              <FormattedMessage id="confirm.deleteexchange.balance" />
            ) : positions.length ? (
              <FormattedMessage id="confirm.deleteexchange.openpos" />
            ) : (traders && traders.length) || (providers && providers.length) ? (
              <FormattedMessage id="confirm.deleteexchange.traders" />
            ) : (
              <FormattedMessage id="confirm.deleteexchange.message" />
            )}
          </DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button autoFocus onClick={() => onClose()}>
          <FormattedMessage id="confirm.cancel" />
        </Button>
        <CustomButton
          className="textPurple"
          disabled={Boolean(!balance || !positions || brokerAccountWithFunds || positions.length)}
          loading={loading}
          onClick={deleteExchange}
        >
          <FormattedMessage id="confirm.delete" />
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
