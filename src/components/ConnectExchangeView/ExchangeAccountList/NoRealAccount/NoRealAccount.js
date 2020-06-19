import React, { useContext } from "react";
import { Box } from "@material-ui/core";
import "./NoRealAccount.scss";
import { FormattedMessage } from "react-intl";
import CustomButton from "../../../CustomButton";
import { Typography } from "@material-ui/core";
import ModalPathContext from "../../ModalPathContext";

/**
 * Displays buttons to connect or create real exchange account.
 * @returns {JSX.Element} Component JSX.
 */
const NoRealAccount = () => {
  const { navigateToPath } = useContext(ModalPathContext);
  return (
    <Box className="noRealAccount">
      <Box alignItems="center" display="flex" flexDirection="column">
        <Typography className="connectHead" variant="h4">
          <FormattedMessage id="accounts.connect" />
        </Typography>
        <Typography className="body1 connectDesc" variant="h4">
          <FormattedMessage id="accounts.connect.first" />
        </Typography>
      </Box>
      <Box
        className="exchangeButtons"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
      >
        <Box alignItems="center" display="flex" flexDirection="column">
          <Typography variant="h4">
            <FormattedMessage id="accounts.connect.noaccount" />
          </Typography>
          <CustomButton
            className="body2 bgPurple exchangeButton"
            onClick={() => navigateToPath("createAccount")}
          >
            <FormattedMessage id="accounts.create.exchange" />
          </CustomButton>
          <Box className="exchangeSubtitle">
            <FormattedMessage id="accounts.powered" />
          </Box>
        </Box>
        <Box alignItems="center" display="flex" flexDirection="column">
          <Typography variant="h4">
            <FormattedMessage id="accounts.connect.haveaccount" />
          </Typography>
          <CustomButton
            className="body2 textPurple borderPurple exchangeButton"
            onClick={() => navigateToPath("connectAccount")}
          >
            <FormattedMessage id="accounts.connect.existing" />
          </CustomButton>
          <Box className="exchangeSubtitle">
            <FormattedMessage id="accounts.exchanges" />
          </Box>
        </Box>
        <Box alignItems="center" display="flex" flexDirection="column">
          <Typography variant="h4">
            <FormattedMessage id="accounts.connect.experiment" />
          </Typography>
          <CustomButton
            className="body2 textPurple exchangeButton"
            onClick={() => navigateToPath("createDemoAccount")}
          >
            <FormattedMessage id="accounts.create.demo" />
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};

export default NoRealAccount;
