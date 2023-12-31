import React, { useState } from "react";
import "./Sidebar.scss";
import { Box, Typography } from "@material-ui/core";
import Link from "../../LocalizedLink";
import SignalWhite from "../../../images/sidebar/signalWhite.svg";
import SignalBlack from "../../../images/sidebar/signalBlack.svg";
import TerminalWhite from "../../../images/sidebar/terminalWhite.svg";
import TerminlBlack from "../../../images/sidebar/terminalBlack.svg";
import CopyWhite from "../../../images/sidebar/copyWhite.svg";
import CopyBlack from "../../../images/sidebar/copyBlack.svg";
import DashboardWhite from "../../../images/sidebar/dashboardWhite.svg";
import DashboardBlack from "../../../images/sidebar/dashboardBlack.svg";
import ProfitBlack from "../../../images/sidebar/profitBlack.svg";
import ProfitWhite from "../../../images/sidebar/profitWhite.svg";
import { FormattedMessage } from "react-intl";
import useStoreSettingsSelector from "../../../hooks/useStoreSettingsSelector";
import ThemeSwitcher from "../../ThemeSwitcher";

/**
 * @typedef {import('../../../store/initialState').DefaultState} DefaultState
 */

const Sidebar = () => {
  const storeSettings = useStoreSettingsSelector();
  const [hover, setHover] = useState(false);

  const showFullMenu = () => {
    setHover(true);
  };

  const showSmallMenu = () => {
    setHover(false);
  };

  /**
   *
   * @param {string} link String to test in the url.
   * @returns {Boolean} Flag if the link is active or not.
   */
  const active = (link) => {
    let url = "";
    if (typeof window !== "undefined") {
      url = window.location.href;
    }
    if (url.includes(link)) {
      return true;
    }
    return false;
  };

  /**
   *
   * @param {string} link Name of the link to get icon.
   * @returns {*} JSx component or nothing.
   */
  const getIcon = (link) => {
    let url = "";
    if (typeof window !== "undefined") {
      url = window.location.href;
    }
    switch (link) {
      case "dashboard":
        if (storeSettings.darkStyle) {
          return DashboardWhite;
        }
        if (url.includes(link)) {
          return DashboardWhite;
        }
        return DashboardBlack;

      case "tradingTerminal":
        if (storeSettings.darkStyle) {
          return TerminalWhite;
        }
        if (url.includes(link)) {
          return TerminalWhite;
        }
        return TerminlBlack;
      case "profitSharing":
        if (storeSettings.darkStyle) {
          return ProfitWhite;
        }
        if (url.includes(link)) {
          return ProfitWhite;
        }
        return ProfitBlack;

      default:
        return "";
    }
  };

  return (
    <Box
      alignItems="flex-start"
      bgcolor="grid.main"
      className={"sidebar " + (hover ? "full" : "")}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      onMouseEnter={showFullMenu}
      onMouseLeave={showSmallMenu}
      onMouseOver={showFullMenu}
    >
      <Link
        className={"sideBarLink " + (active("dashboard") ? "active" : "")}
        partiallyActive={true}
        to={"/dashboard"}
      >
        <img alt="zignaly" className={"icon"} src={getIcon("dashboard")} />
        <Typography variant="h6">
          <FormattedMessage id="menu.dashboard" />
        </Typography>
      </Link>
      <ThemeSwitcher full={hover} />
    </Box>
  );
};

export default Sidebar;
