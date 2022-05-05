import { useSelector } from "react-redux";
import useSWR from "swr";
import { keys, cache, setItemCache } from "lib/cacheAPI";

export const AVATARS_COUNT = 7;

const useUser = () => {
  const options = {
    headers: {
      "Accept-version": 2,
    },
  };
  const initialData = cache.get(keys.user);
  const {
    data: user,
    mutate,
    error,
  } = useSWR<User>(keys.user, {
    // Don't fetch updated data right away if the data has just been loaded in login (_validated)
    revalidateOnMount: initialData?._validated !== true,
    // Manually set initialData since with custom header our caching key is not the same as swr
    fallbackData: initialData,
    // revalidateIfStale: false,
    onSuccess(newUser) {
      setItemCache(keys.user, newUser);
    },
  });
  // const loading = !user && !error ? true : false;
  const selectedExchangeId = useSelector((state: any) => state.settings.selectedExchangeId);
  const accountIndex = user?.exchanges.findIndex((e) => e.internalId === selectedExchangeId);
  const avatar = `/images/avatars/avatar-${accountIndex % AVATARS_COUNT}.svg`;
  const selectedExchange = user?.exchanges[accountIndex];

  return {
    selectedExchange,
    user,
    mutate,
    avatar,
  };
};

export default useUser;
