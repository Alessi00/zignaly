import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { colors } from "../../../services/theme";
import { Box, FormHelperText, Tooltip } from "@material-ui/core";
import { Help } from "@material-ui/icons";

/**
 * @typedef {import("../../../services/tradeApiClient.types").ProfitTarget} ProfitTarget
 */

/**
 * @typedef {Object} HelperLabelProps
 * @property {string} labelId Status label translation text ID.
 * @property {ProfitTarget} profitTarget Position take profit target.
 */

/**
 * Status label with detailed description tooltip.
 *
 * @param {HelperLabelProps} props Component props.
 * @returns {JSX.Element} Helper label with description in tooltip element.
 */
const TargetStatus = (props) => {
  const { profitTarget, labelId } = props;
  const { formatMessage } = useIntl();
  let iconColor = colors.purpleLight;
  let description = formatMessage({ id: "terminal.status.pending" });

  if (profitTarget.done) {
    description = formatMessage({ id: "terminal.status.done" });
    iconColor = colors.green;
  } else if (profitTarget.skipped) {
    description = formatMessage({ id: "terminal.status.failed" });
    iconColor = colors.red;
  }

  return (
    <Box alignItems="center" className="help" display="flex">
      <FormHelperText>
        <FormattedMessage id={labelId} />
      </FormHelperText>
      <Tooltip arrow enterTouchDelay={50} placement="left-end" title={description}>
        <Help style={{ fill: iconColor }} />
      </Tooltip>
    </Box>
  );
};

export default React.memo(TargetStatus);
