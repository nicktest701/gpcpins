import {  useState } from "react";
import _ from "lodash";
import Slide from "@mui/material/Slide";
import Input from "@mui/material/Input";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { Card, ListItemButton, useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import ClickAwayListener from "@mui/material/ClickAwayListener";

import { bgBlur } from "../../theme/css";
import { Search } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import {  List, ListItemText, Typography } from "@mui/material";
import { getAllTickets } from "../../api/categoryAPI";
import { useNavigate } from "react-router-dom";
import { getAssignedTicketByVerifier } from "../../api/ticketAPI";
import {  useAuth } from "../../context/providers/AuthProvider";

// ----------------------------------------------------------------------

const HEADER_MOBILE = 64;
const HEADER_DESKTOP = 92;

const StyledSearchbar = styled("div")(({ theme }) => ({
  ...bgBlur({
    color: theme.palette.background.default,
  }),
  top: 0,
  left: 0,
  zIndex: 99,
  width: "100%",
  display: "flex",
  position: "absolute",
  alignItems: "center",
  height: HEADER_MOBILE,
  padding: theme.spacing(0, 3),
  boxShadow: theme.customShadows.z8,
  [theme.breakpoints.up("md")]: {
    height: HEADER_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

export default function Searchbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredTickets, setFilteredTickets] = useState([]);

  const allTickets = useQuery({
    queryKey: ["categories"],
    queryFn: user?.isAdmin
      ? () => getAllTickets("")
      : () => getAssignedTicketByVerifier(user?.id),
    enabled: true,
    initialData: [],
  });

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setFilteredTickets([]);
    setOpen(false);
  };

  const handleSearch = () => {
    if (searchValue?.trim() === "") return;

    if (_.isEmpty(allTickets?.data)) {
      return [];
    }
    // const tickets = getCategoryData(categories);
    const filteredtickets = allTickets?.data?.filter((ticket) =>
      ticket.voucherType.toLowerCase().includes(searchValue.toLowerCase())
    );

    setFilteredTickets(filteredtickets);
  };

  const handleOpenViewCategory = ({ _id, category, categoryId }) => {
    if (user?.isAdmin) {
      navigate(`/evoucher/${category}/${_id}`);
    } else {
      navigate(`/verifiers/${categoryId}/ticket-details/${_id}`);
    }
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div>
        {!open && (
          <IconButton onClick={handleOpen}>
            <Search />
          </IconButton>
        )}

        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
          {/* <div> */}
          <StyledSearchbar>
            <Input
              autoFocus
              fullWidth
              disableUnderline
              placeholder="Search for ticket…"
              startAdornment={
                <InputAdornment position="start">
                  <Search
                    sx={{ color: "text.disabled", width: 20, height: 20 }}
                  />
                </InputAdornment>
              }
              sx={{ mr: 1, fontWeight: "fontWeightBold" }}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
          </StyledSearchbar>

          {/* </div> */}
        </Slide>
        {filteredTickets?.length > 0 && (
          <Card
            sx={{
              width: "100%",
              position: "absolute",
              // top: 100,
              // ...bgBlur({
              //   // color: "background.paper",
              //   color: theme.palette.background.default,
              // }),
              bgcolor: "#fff",
              padding: 4,
              left: 0,
              top: HEADER_MOBILE + 10,
              [theme.breakpoints.up("md")]: {
                top: HEADER_DESKTOP+2,
              },
            }}
          >
            <Typography color="secondary">Search Results</Typography>
            {filteredTickets?.map((ticket) => {
              return (
                <List key={ticket?._id}>
                  <ListItemButton
                    onClick={() => handleOpenViewCategory(ticket)}
                  >
                    <ListItemText primary={ticket?.voucherType} />
                  </ListItemButton>
                </List>
              );
            })}
          </Card>
        )}
      </div>
    </ClickAwayListener>
  );
}
