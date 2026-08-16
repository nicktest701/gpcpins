import { useState, useRef, useEffect } from "react";
import {
  Stack,
  TextField,
  IconButton,
  Popover,
  Paper,
  Button,
  Box,
  alpha,
  useTheme,
  Fade,
} from "@mui/material";
import { RefreshRounded, CalendarToday, Close } from "@mui/icons-material";
import { DateRangePicker as ReactDateRangePicker } from "react-date-range";
import moment from "moment";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const DateRangePicker = ({
  date,
  setDate,
  onApply,
  onReset,
  disabled = false,
  placeholder = "Select date range",
  dateFormat = "ll", // moment format
  maxDate = new Date(),
  minDate = new Date("2024-01-01"),
  months = 2,
  direction = "horizontal",
  showDateDisplay = false,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [localDate, setLocalDate] = useState(date);
  const inputRef = useRef(null);

  // Sync local date when prop changes
  useEffect(() => {
    setLocalDate(date);
  }, [date]);

  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
    // Set local date to current selection when opening
    setLocalDate(date);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleReset = () => {
    const defaultRange = [
      {
        startDate: minDate,
        endDate: maxDate,
        key: "selection",
      },
    ];
    setLocalDate(defaultRange);
    setDate(defaultRange);
    if (onReset) onReset();
    if (onApply) onApply(); // auto‑apply reset
    handleClose();
  };

  const handleApply = () => {
    setDate(localDate);
    if (onApply) onApply();
    handleClose();
  };

  const handleClear = () => {
    const cleared = [
      {
        startDate: null,
        endDate: null,
        key: "selection",
      },
    ];
    setLocalDate(cleared);
    setDate(cleared);
    if (onApply) onApply();
    handleClose();
  };

  // Format display value
  const getDisplayValue = () => {
    if (!date || !date[0]) return "";
    const { startDate, endDate } = date[0];
    if (!startDate || !endDate) return "";
    return `${moment(startDate).format(dateFormat)} - ${moment(endDate).format(dateFormat)}`;
  };

  const isDateSelected = date && date[0]?.startDate && date[0]?.endDate;

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {/* Input Field */}
      <TextField
        ref={inputRef}
        size="small"
        label='Select Date Range'
        placeholder={placeholder}
        value={getDisplayValue()}
        onClick={handleOpen}
        disabled={disabled}
        sx={{
          width: { xs: "100%", sm: 290 ,},
          cursor: "pointer",
          "& .MuiInputBase-root": {
            borderRadius: 1,
            py:0.2,
            bgcolor: "background.paper",
            transition: "all 0.2s",
            "&:hover": {
              borderColor: theme.palette.primary.main,
            },
          },
          "& .MuiInputBase-input": {
            cursor: "pointer",
          },
        }}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <CalendarToday
              fontSize="small"
              sx={{ color: "secondary.main", mr: 0.5 }}
            />
          ),
          endAdornment: isDateSelected && (
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              sx={{ mr: -0.5 }}
            >
              <Close fontSize="small" />
            </IconButton>
          ),
        }}
      />

      {/* Reset Button */}
      <IconButton
        size="small"
        onClick={handleReset}
        disabled={disabled}
        sx={{
          color: "text.secondary",
          transition: "transform 0.2s",
          "&:hover": {
            transform: "rotate(180deg)",
            color: theme.palette.secondary.main,
          },
        }}
      >
        <RefreshRounded fontSize="small" />
      </IconButton>

      {/* Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 200 }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 1.2,
              boxShadow: theme.shadows[8],
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              overflow: "hidden",
              mt: 0.5,
            },
          },
        }}
      >
        <Paper elevation={0} sx={{ p: 2 }}>
          <ReactDateRangePicker
            ranges={localDate}
            onChange={(item) => setLocalDate([item.selection])}
            moveRangeOnFirstSelection={false}
            months={months}
            direction={direction}
            showDateDisplay={showDateDisplay}
            maxDate={maxDate}
            minDate={minDate}
            rangeColors={[theme.palette.primary.main]}
            monthDisplayFormat="MMMM yyyy"
            weekStartsOn={1}
            showMonthArrow
            showMonthAndYearPickers
          />

          {/* Actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 2,
              pt: 1.5,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            }}
          >
            <Button
              size="small"
              variant="text"
              color="inherit"
              onClick={handleClose}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={handleClear}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              Clear
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleApply}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            >
              Apply
            </Button>
          </Box>
        </Paper>
      </Popover>
    </Stack>
  );
};

export default DateRangePicker;

