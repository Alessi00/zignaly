import React, { useState } from "react";
import { useDispatch } from "react-redux";
import useStoreSessionSelector from "../../../../hooks/useStoreSessionSelector";
import "./Management.scss";
import tradeApi from "../../../../services/tradeApiClient";
import { showErrorAlert } from "../../../../store/actions/ui";
import useInterval from "../../../../hooks/useInterval";
import { Box, CircularProgress } from "@material-ui/core";
import ManagementTable from "./ManagementTable";

/**
 * @typedef {import("../../../../services/tradeApiClient.types").PositionEntity} PositionEntity
 * @typedef {import("../../../../services/tradeApiClient.types").ManagementPositionsEntity} ManagementPositionsEntity
 * @typedef {import("../../../../services/tradeApiClient.types").DefaultProviderGetObject} DefaultProviderGetObject
 * @typedef {Object} DefaultProps
 * @property {DefaultProviderGetObject} provider Balance
 */

/**
 * @param {DefaultProps} props Default props.
 * @returns {JSX.Element} Component JSX.
 */
const Management = ({ provider }) => {
  const storeSession = useStoreSessionSelector();
  const [tablePositions, setTablePositions] = useState([]);
  const [allPositions, setAllPositions] = useState([]);
  const [positionsLoading, setPositionsLoading] = useState(true);
  const dispatch = useDispatch();

  const loadPositions = () => {
    if (provider.id) {
      const payload = {
        token: storeSession.tradeApi.accessToken,
        providerId: provider.id,
      };
      tradeApi
        .providerManagementPositions(payload)
        .then((response) => {
          setPositionsLoading(false);
          setAllPositions(response);
          setTablePositions(prepareTableList(response));
        })
        .catch((e) => {
          dispatch(showErrorAlert(e));
        });
    }
  };

  useInterval(loadPositions, 5000, true);

  /**
   * Function to prepare list of the table.
   *
   * @param {Array<ManagementPositionsEntity>} data default data from backend.
   * @returns {Array<PositionEntity>} Array of position entities.
   */
  const prepareTableList = (data) => {
    /**
     * @type {Array<PositionEntity>}
     */
    let list = [];
    data.forEach((item) => {
      list.push(item.position);
    });
    return list;
  };
  return (
    <>
      {positionsLoading && (
        <Box
          alignItems="center"
          className="loadingBox"
          display="flex"
          flexDirection="row"
          justifyContent="center"
        >
          <CircularProgress color="primary" size={40} />
        </Box>
      )}
      {!positionsLoading && (
        <ManagementTable
          allPositions={allPositions}
          list={tablePositions}
          setLoading={setPositionsLoading}
        />
      )}
    </>
  );
};

export default Management;
