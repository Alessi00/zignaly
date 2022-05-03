import React, { useState } from "react";
import Head from "next/head";
import MainLayout from "components/MainLayout";
import { useIntl } from "react-intl";
import { PRODUCT_NAME } from "../lib/constants";
import DashboardCoins from "components/dashboard/DashboardCoins/DashboardCoins";
import { Tabs, Tab, TabPanel } from "zignaly-ui";
import AccountSelector from "components/dashboard/AccountSelector/AccountSelector";

const Dashboard = () => {
  const intl = useIntl();
  const [value, setValue] = useState(0);
  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  return (
    <MainLayout>
      <Head>
        <title>{`${intl.formatMessage({ id: "dashboard" })} | ${intl.formatMessage({
          id: "dashboard.positions",
        })} | ${PRODUCT_NAME}`}</title>
      </Head>
      <AccountSelector />
      <Tabs value={value} onChange={handleChange}>
        <Tab label={intl.formatMessage({ id: "dashboard.myCoins" })} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <DashboardCoins />
      </TabPanel>
    </MainLayout>
  );
};

export default Dashboard;