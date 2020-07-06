import React, { useState } from "react";
import { Box, Typography } from "@material-ui/core";
import { FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import Passwords from "../../../Passwords";
import CustomButton from "../../../CustomButton";
import EditIcon from "../../../../images/ct/edit.svg";
import PasswordInput from "../../../Passwords/PasswordInput";
import tradeApi from "../../../../services/tradeApiClient";
import { showErrorAlert, showSuccessAlert } from "../../../../store/actions/ui";
import useStoreSessionSelector from "../../../../hooks/useStoreSessionSelector";
import "./UpdatePassword.scss";

/**
 * Provides a component to update password.
 *
 * @returns {JSX.Element} Component JSX.
 */
const UpdatePassword = () => {
  const dispatch = useDispatch();
  const storeSession = useStoreSessionSelector();
  const formMethods = useForm({ mode: "onBlur" });
  const { errors, handleSubmit, register, setError } = formMethods;
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * @typedef {Object} FormData
   * @property {string} currentPassword
   * @property {string} password
   * @property {string} repeatPassword
   */

  /**
   * Function to submit form.
   *
   * @param {FormData} data Form data.
   * @returns {void}
   */
  const submitPassword = (data) => {
    const { currentPassword: password, password: newPassword, repeatPassword } = data;
    const payload = {
      token: storeSession.tradeApi.accessToken,
      password,
      newPassword,
      repeatPassword,
    };

    setLoading(true);

    tradeApi
      .updatePassword(payload)
      .then(() => {
        dispatch(showSuccessAlert("Success", "Changed Password Successfully"));
        setEditing(false);
      })
      .catch((e) => {
        if (e.code === 7) {
          setError("currentPassword", "notMatch", "Wrong credentials.");
        } else {
          dispatch(showErrorAlert(e));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <form className="updatePassword" onSubmit={handleSubmit(submitPassword)}>
      <Box className="inputBox" display="flex" flexDirection="column" width={1}>
        <Box className="passwordBox" display="flex" width={1}>
          <PasswordInput
            disabled={!editing}
            error={!!errors.currentPassword}
            inputRef={register({ required: true })}
            label={<FormattedMessage id={"security.password.current"} />}
            name="currentPassword"
            placeholder={!editing ? "•••••••••" : ""}
          />

          {!editing && (
            <img
              aria-describedby="Edit password"
              onClick={() => setEditing(true)}
              src={EditIcon}
              title="Edit"
            />
          )}
        </Box>
        {errors && errors.currentPassword && (
          <span className="errorText">{errors.currentPassword.message}</span>
        )}
        {!editing && (
          <Box pt="17px">
            <Typography className="bold" variant="subtitle2">
              <FormattedMessage id="security.note" />
            </Typography>
            <Typography className="callout1">
              <FormattedMessage id="security.passwordnote" />
            </Typography>
          </Box>
        )}
      </Box>
      {editing && (
        <>
          <Passwords edit={true} formMethods={formMethods} />
          <CustomButton className="bgPurple bold" loading={loading} type="submit">
            <FormattedMessage id="security.submit" />
          </CustomButton>
        </>
      )}
    </form>
  );
};

export default UpdatePassword;
