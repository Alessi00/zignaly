import React, { useState } from "react";
import "./MobileAppbar.scss";
import { Box, Slide } from "@material-ui/core";
import Link from "../../LocalizedLink";
// import { useDispatch } from "react-redux";
import SignalWhite from "../../../images/sidebar/signalWhite.svg";
import SignalBlack from "../../../images/sidebar/signalBlack.svg";
import TerminalWhite from "../../../images/sidebar/terminalWhite.svg";
import TerminlBlack from "../../../images/sidebar/terminalBlack.svg";
import CopyWhite from "../../../images/sidebar/copyWhite.svg";
import CopyBlack from "../../../images/sidebar/copyBlack.svg";
// import FillWhite from "../../../images/sidebar/fillWhite.svg";
// import OutlineWhite from "../../../images/sidebar/outlineWhite.svg";
import DashboardWhite from "../../../images/sidebar/dashboardWhite.svg";
import DashboardBlack from "../../../images/sidebar/dashboardBlack.svg";
import PersonBlack from "../../../images/sidebar/personBlack.svg";
import PersonWhite from "../../../images/sidebar/personWhite.svg";
import CloseBlack from "../../../images/sidebar/closeBlack.svg";
import CloseWhite from "../../../images/sidebar/closeWhite.svg";
import ProfitBlack from "../../../images/sidebar/profitBlack.svg";
import ProfitWhite from "../../../images/sidebar/profitWhite.svg";
// import { selectDarkTheme } from "../../../store/actions/settings";
import UserMenu from "../Header/UserMenu";
import useStoreSettingsSelector from "../../../hooks/useStoreSettingsSelector";

const MobileAppbar = () => {
  const [menu, showMenu] = useState(false);
  const storeSettings = useStoreSettingsSelector();
  // const dispatch = useDispatch();

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
   * @returns {*} JS component or nothing.
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
    <>
      <Box
        alignItems="center"
        bgcolor="grid.main"
        className="mobileAppbar"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
      >
        <Link
          className={"sideBarLink " + (active("dashboard") ? "active" : "")}
          partiallyActive={true}
          to="/dashboard"
        >
          <img alt="zignaly" className={"icon"} src={getIcon("dashboard")} />
        </Link>
        <Box
          className="sideBarLink"
          display="flex"
          flexDirection="row"
          justifyContent="center"
          onClick={() => showMenu(!menu)}
        >
          {!menu && (
            <img
              alt="zignaly"
              className="icon"
              src={storeSettings.darkStyle ? PersonWhite : PersonBlack}
            />
          )}
          {menu && (
            <img
              alt="zignaly"
              className="icon"
              src={storeSettings.darkStyle ? CloseWhite : CloseBlack}
            />
          )}
        </Box>
        {/* <Box
          className={storeSettings.darkStyle ? "checkedDarkBox" : "checkedLightBox"}
          display="flex"
          flexDirection="row"
          justifyContent="center"
        >
          <img
            alt="zignaly"
            className="icon"
            onClick={() => dispatch(selectDarkTheme(!storeSettings.darkStyle))}
            src={storeSettings.darkStyle ? OutlineWhite : FillWhite}
          />
        </Box> */}
      </Box>
      <Slide direction="up" in={menu}>
        <Box bgcolor="grid.content" className="userMenuDrawer">
          <UserMenu onClose={() => showMenu(false)} />
        </Box>
      </Slide>
    </>
  );
};

export default MobileAppbar;
