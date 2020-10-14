import React from "react";
import "./positions.scss";
import { Box } from "@material-ui/core";
import withDashboardLayout from "../../../layouts/dashboardLayout";
import { Helmet } from "react-helmet";
import { PositionsTabs } from "../../../components/Dashboard/PositionsTabs";
import { useIntl } from "react-intl";
import PositionsContext from "../../../components/Dashboard/PositionsContext";
import usePositionsContext from "../../../hooks/usePositionsContext";

const Positions = () => {
  const intl = useIntl();
  const data = usePositionsContext();

  return (
    <>
      <Helmet>
        <title>
          {`${intl.formatMessage({
            id: "dashboard",
          })} - ${intl.formatMessage({
            id: "dashboard.positions",
          })} | ${intl.formatMessage({ id: "product" })}`}
        </title>
      </Helmet>
      <Box className="positionsPage" display="flex" flexDirection="row" justifyContent="center">
        <PositionsContext.Provider value={data}>
          <PositionsTabs />
        </PositionsContext.Provider>
      </Box>
    </>
  );
};

export default withDashboardLayout(Positions);
