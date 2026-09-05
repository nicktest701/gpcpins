import { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllCategory } from "../api/categoryAPI";
import isEmpty from "lodash/isEmpty";
import { getCategoryData } from "../config/getCategoryData";
import { CustomContext } from "../context/providers/CustomProvider";
import { globalAlertType } from "../components/alert/alertType";

export const useCategory = (category) => {
  const { customDispatch } = useContext(CustomContext);

  const {
    data: categories = [],
    isFetching,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["category", category],
    queryFn: () => getAllCategory(category),
    enabled: !!category,
    // 1. Correct data transformation using select
    select: (data) => {
      if (!isEmpty(data)) {
        return getCategoryData(data);
      }
      return [];
    },
    // 2. Global side-effects/errors are handled via meta in v5, or keep it local via useEffect if needed
    meta: {
      errorMessage: "An Unknown error has occurred!",
    },
  });

  // Note: If you don't have a global QueryClient onError handler setting up your customDispatch,
  // you can handle the error side effect using a simple useMemo/useEffect like this:
  const hasError = isError;
  useMemo(() => {
    if (hasError) {
      customDispatch(
        globalAlertType("error", "An Unknown error has occurred!"),
      );
    }
  }, [hasError, customDispatch]);

  return {
    categories,
    loading: isFetching,
    refetch,
  };
};
