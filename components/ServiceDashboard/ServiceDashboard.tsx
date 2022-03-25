import { Box, Button, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { useIntl } from "react-intl";
// import ServiceContracts from "./ServiceContracts";
// import ServiceOrders from "./ServiceOrders";
import ServicePositions from "./ServicePositions";
// import TabPanel from "@mui/lab/TabPanel";
import styled from "styled-components";
// import { Tab, TabPanel, Tabs } from "zignaly-ui";
import { Avatar } from "zignaly-ui";

const ServiceDashboard = () => {
  const intl = useIntl();
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <>
      <Box>
        <Tabs value={value} onChange={handleChange}>
          <Tab label={intl.formatMessage({ id: "dashboard.openPositions" })} />
          <Tab label={intl.formatMessage({ id: "dashboard.closedPositions" })} />
          <Tab label={intl.formatMessage({ id: "dashboard.exchangeOrders" })} />
          <Tab label={intl.formatMessage({ id: "accounts.contracts" })} />
          <Tab label={intl.formatMessage({ id: "dashboard.positions.log" })} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        {/* <ServicePositions /> */}
        Item One
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
      {/* <ServicePositions />
      <br />
      <ServiceOrders />
      <br />
      <ServiceContracts /> */}
    </>
  );
};

export default ServiceDashboard;
