import { useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCategory } from '../api/categoryAPI';
import isEmpty from 'lodash/isEmpty';
import { getCategoryData } from '../config/getCategoryData';
import { CustomContext } from '../context/providers/CustomProvider';
import { globalAlertType } from '../components/alert/alertType';

export const useCategory = (category) => {
  const { customDispatch } = useContext(CustomContext);
  const [categories, setCategories] = useState([]);

  const cat = useQuery({
    queryKey: ['category', category],
    queryFn: () => getAllCategory(category),
    enabled: !!category,
    onSuccess: (categories) => {
      if (!isEmpty(categories)) {
        const options = getCategoryData(categories);
        setCategories([]);
        setCategories(options);
      } else {
        setCategories([]);
      }
    },
    onError: (error) => {
      customDispatch(
        globalAlertType('error', 'An Unknown error has occurred!')
      );
    },
  });

  return { categories, loading: cat.isFetching, refetch: cat.refetch };
};
