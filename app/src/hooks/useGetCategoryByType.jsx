import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCategoryByType } from '../api/categoryAPI';
import isEmpty from 'lodash/isEmpty';
import { getCategoryData } from '../config/getCategoryData';
import { CustomContext } from '../context/providers/CustomProvider';
import { useContext } from 'react';
import { globalAlertType } from '../components/alert/alertType';

export const useGetCategoryByType = (category) => {
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);

  const cat = useQuery({
    queryKey: ['category', category],
    queryFn: () => getCategoryByType(category),
    initialData: queryClient
      .getQueryData(['all-category'])
      ?.filter((voucher) => voucher?.category === category),
    enabled: !!category,
    select: (categories) => {
      if (!isEmpty(categories)) {
        const options = getCategoryData(categories);
        return options;
      } else {
        return [];
      }
    },
    onError: (error) => {
      customDispatch(
        globalAlertType('error', 'An Unknown error has occurred!')
      );
    },
  });

  return {
    categories: cat?.data ?? [],
    loading: cat.isLoading,
    fetching: cat.isFetching,
    refetch: cat.refetch,
    isError: cat.isError,
    error: cat.error,
  };
};
