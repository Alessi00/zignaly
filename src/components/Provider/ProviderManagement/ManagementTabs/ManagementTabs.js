import React, { useState } from "react";
import { Box } from "@material-ui/core";
import TabsMenu from "../../../TabsMenu";
import "./ManagementTabs.scss";
import Orders from "../Orders/Orders";
import { FormattedMessage } from "react-intl";
import Contracts from "../Contracts";
import Management from "../Management/Management";

/**
 * @typedef {import("../../../../services/tradeApiClient.types").DefaultProviderGetObject} DefaultProviderGetObject
 * @typedef {Object} DefaultProps
 * @property {DefaultProviderGetObject} provider Balance
 */

/**
 * @param {DefaultProps} props Default props.
 * @returns {JSX.Element} Component JSX.
 */
const ManagementTabs = ({ provider }) => {
  const [tabValue, setTabValue] = useState(0);

  const tabsList = [
    {
      display: true,
      label: <FormattedMessage id="management.positions" />,
    },
    {
      display: true,
      label: <FormattedMessage id="management.orders" />,
    },
    {
      display: true,
      label: <FormattedMessage id="management.contracts" />,
    },
  ];

  /**
   * Event handler to change tab value.
   *
   * @param {React.ChangeEvent<{checked: boolean}>} event Tab index to set active.
   * @param {Number} val Tab index to set active.
   * @returns {void}
   */
  const changeTab = (event, val) => {
    setTabValue(val);
  };

  return (
    <Box bgcolor="grid.content" className="managementTabs">
      <Box
        alignItems="flex-start"
        className="tabsBox"
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
      >
        <TabsMenu changeTab={changeTab} tabValue={tabValue} tabs={tabsList} />
        {tabValue === 0 && (
          <Box className="tabPanel">
            <Management provider={provider} />
          </Box>
        )}
        {tabValue === 1 && (
          <Box className="tabPanel">
            <Contracts provider={provider} />
          </Box>
        )}
        {tabValue === 2 && (
          <Box className="tabPanel">
            <Orders provider={provider} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ManagementTabs;
