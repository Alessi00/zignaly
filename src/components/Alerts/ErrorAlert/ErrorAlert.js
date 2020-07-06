import React from "react";
import "./ErrorAlert.scss";
import { Snackbar, Slide } from "@material-ui/core";
import useStoreUIAlertsSelector from "../../../hooks/useStoreUIAlertsSelector";
import { useDispatch } from "react-redux";
import { hideErrorAlert } from "../../../store/actions/ui";
import { FormattedMessage } from "react-intl";
import { Alert, AlertTitle } from "@material-ui/lab";

const ErrorAlert = () => {
  const storeAlerts = useStoreUIAlertsSelector();
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(hideErrorAlert());
  };

  return (
    <Snackbar
      TransitionComponent={Slide}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      autoHideDuration={5000}
      className="errorAlert"
      onClose={handleClose}
      open={storeAlerts.error.open}
    >
      <Alert onClose={handleClose} severity="error">
        {storeAlerts.error.title && (
          <AlertTitle>
            <FormattedMessage id={storeAlerts.error.title} />
          </AlertTitle>
        )}
        {storeAlerts.error.body && <FormattedMessage id={storeAlerts.error.body} />}
      </Alert>
    </Snackbar>
  );
};

export default ErrorAlert;
