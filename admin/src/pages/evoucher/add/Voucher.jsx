import { useState, useEffect } from "react";
import {  Tab } from "@mui/material";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import _ from "lodash";
import { CreditCardSharp, Report } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import ViewCategory from "../../../components/tabs/ViewCategory";
import LoadVoucher from "../../../components/tabs/LoadVoucher";

import { Navigate, useParams } from "react-router-dom";

import { PAGES } from "../../../mocks/columns";
import { useQuery } from "@tanstack/react-query";
import { getMainCategory } from "../../../api/categoryAPI";
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
  const [tab, setTab] = useState("1");

  useEffect(() => {
    setLoading(true);
    const currentPageInfo = PAGES.find((page) => page.type === category);

    if (!_.isUndefined(currentPageInfo)) {
      setPageInfo(currentPageInfo);
    }

    setLoading(false);
  }, [category]);

  const categories = useQuery({
    queryKey: ["category", category],
    queryFn: () => getMainCategory(category),
    enabled: !!category,
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
    <>
      <CustomTitle
        title={pageInfo?.title}
        subtitle='Generate Excitement: Create a New Voucher or Ticket Now!'
        icon={
          <CreditCardSharp sx={{ width: 50, height: 50 }} color="secondary" />
        }
      />

      <TabContext value={tab}>
        <TabList onChange={(e, value) => setTab(value)} aria-label="Category">
          <Tab
            value="1"
            label={category}
            icon={<CategoryRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="2"
            label=" Pins & Serials"
            icon={<Report />}
            iconPosition="start"
          />
        </TabList>
        <TabPanel value="1" sx={{ px: 0 }}>
          <ViewCategory
            categories={categories}
            pageInfo={pageInfo}
            refetch={categories.refetch}
          />
        </TabPanel>
        <TabPanel value="2" sx={{ px: 0 }}>
          <LoadVoucher category={category} type={pageInfo.type} />
        </TabPanel>
      </TabContext>
    </>
  );
};

Voucher.propTypes = {};

export default Voucher;
