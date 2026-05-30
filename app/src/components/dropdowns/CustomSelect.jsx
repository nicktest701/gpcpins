import Select from "react-select";
import { styled } from "@mui/material/styles";

// Styled wrapper for react-select
const CustomSelect = styled(Select)(({ theme }) => ({
  // Container
  ".select__control": {
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.divider,
    borderRadius: theme.shape.borderRadius,
    minHeight: 40,
    // width:'300px',
    // zIndex:9999,
    boxShadow: "none",
    "&:hover": {
      borderColor: theme.palette.text.primary,
    },
    "&--is-focused": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
    },
    "&--menu-is-open": {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
  },
  // Value container
  ".select__value-container": {
    padding: "2px 8px",
  },
  // Multi-value container
  ".select__multi-value": {
    backgroundColor: theme.palette.grey[300],
    borderRadius: 10,
    padding: "2px 4px",
    margin: "2px",
  },
  ".select__multi-value__label": {
    color: theme.palette.grey[600],
    fontSize: "0.875rem",
    padding: 2,
  },
  ".select__multi-value__remove": {
    color: theme.palette.common.black,
    "&:hover": {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.error.contrastText,
    },
  },
  // Placeholder
  ".select__placeholder": {
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
  },
  // Dropdown indicator
  ".select__dropdown-indicator": {
    color: theme.palette.text.secondary,
    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
  // Clear indicator
  ".select__clear-indicator": {
    color: theme.palette.text.secondary,
    "&:hover": {
      color: theme.palette.error.main,
    },
  },
  // Menu (dropdown list)
  ".select__menu": {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: "hidden",
  },
  ".select__menu-list": {
    padding: 0,
  },
  ".select__option": {
    padding: "10px 12px",
    fontSize: "0.875rem",
    "&--is-focused": {
      backgroundColor: theme.palette.action.hover,
    },
    "&--is-selected": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  },
  // No options message
  ".select__no-options-message": {
    padding: "10px 12px",
    color: theme.palette.text.secondary,
  },
}));

export default CustomSelect;
