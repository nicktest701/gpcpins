import { useState, useEffect } from "react";
import { Box, Container } from "@mui/material";
import _ from "lodash";
import { CreditCardSharp } from "@mui/icons-material";
import ViewCategory from "../../../components/tabs/ViewCategory";

import { Navigate, useParams } from "react-router-dom";

import { PAGES } from "../../../mocks/columns";
import { useQuery } from "@tanstack/react-query";
import { getAllTickets } from "../../../api/categoryAPI";
import { getCategoryData } from "../../../config/getCategoryData";
import PayLoading from "../../../components/PayLoading";
import CustomTitle from "../../../components/custom/CustomTitle";

const Voucher = () => {
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    title: "",
    category: "",
    note: "",
    type: "",
  });
  const { category } = useParams();

  useEffect(() => {
    setLoading(true);
    const currentPageInfo = PAGES.find((page) => page.type === category);

    if (!_.isUndefined(currentPageInfo)) {
      setPageInfo(currentPageInfo);
    }

    setLoading(false);
  }, [category]);

  const categories = useQuery({
    queryKey: ["categories", category],
    queryFn: () => getAllTickets(category),
    enabled: !!category,
    initialData: [],
    select: (categories) => {
      if (_.isEmpty(categories)) {
        return [];
      }
      return getCategoryData(categories);
    },
  });

  if (!category) {
    return <Navigate to="/" />;
  }

  if (categories.isLoading || loading) {
    return <PayLoading />;
  }

  return (
    <Container px={4}>
      <CustomTitle
        title={pageInfo?.title}
        subtitle='Generate Excitement: Create a New Voucher or Ticket Now!'
        icon={
          <CreditCardSharp sx={{ width: 80, height: 80 }} color="primary" />
        }
      />

      <ViewCategory
        categories={categories}
        pageInfo={pageInfo}
        refetch={categories.refetch}
      />
    </Container>
  );
};

Voucher.propTypes = {};

export default Voucher;
