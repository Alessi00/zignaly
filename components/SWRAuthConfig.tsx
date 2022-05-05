import React from "react";
import { SWRConfig } from "swr";
import { endTradeApiSession } from "lib/store/actions/session";
import { useDispatch, useSelector } from "react-redux";
import useRedirection from "lib/hooks/useRedirection";

const SWRAuthConfig = ({ children }) => {
  const storeSession = useSelector((state: any) => state.session);
  const token = storeSession.tradeApi.accessToken;
  const dispatch = useDispatch();
  const { redirectLogin } = useRedirection();

  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        fetcher: async (url, customOptions) => {
          const options = {
            method: customOptions?.body ? "POST" : "GET",
            ...customOptions,
            ...(customOptions?.body && { body: JSON.stringify(customOptions.body) }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-API-KEY": process.env.NEXT_PUBLIC_KEY || "",
              ...customOptions?.headers,
            },
          };

          // Remove authorization key when not needed
          if (customOptions?.headers?.Authorization === null) {
            delete options.headers.Authorization;
          }

          let error;
          let json;
          try {
            const res = await fetch(url, options);
            json = await res.json();
            if (!res.ok) {
              error = json;
            }
          } catch (e) {
            error = e.message;
          }

          if (error) {
            if (error.error?.code === 13) {
              // eslint-disable-next-line no-console
              console.log("api session expired, redirecting to login");
              dispatch(endTradeApiSession());
              redirectLogin(true);
            }

            throw error;
          }

          return json;
          // res.ok ? res.json() : Promise.reject(res)
        },
        // onError: (err) => {
        //   console.error(err);
        // },
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRAuthConfig;
