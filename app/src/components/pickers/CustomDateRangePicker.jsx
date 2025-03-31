import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import '../../styles/date-range-picker.css'; // main style file
import { DateRangePicker } from 'react-date-range';

function CustomDateRangePicker({ open, setOpen, date, setDate, refetchData }) {
  const handleRefetch = () => {
    refetchData();
    setOpen(false);
  };
  return (
    <Dialog open={open} fullWidth hideBackdrop>
      <DialogContent>
        <DateRangePicker
          onChange={(item) => setDate([item.selection])}
          showSelectionPreview={true}
          moveRangeOnFirstSelection={false}
          months={2}
          ranges={date}
          // direction='horizontal'
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Close</Button>
        <Button onClick={handleRefetch}>Apply</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomDateRangePicker;
