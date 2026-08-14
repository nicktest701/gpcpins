import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Fab,
  Tooltip,
} from '@mui/material';
import { Close, HelpOutline } from '@mui/icons-material';
import ComplaintForm from '../forms/ComplaintForm';


const ComplaintModal = ({ buttonVariant = 'fab', buttonText = 'Submit Complaint' }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSuccess = () => {
    // Close the modal after successful submission
    setOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      {buttonVariant === 'fab' ? (
        <Tooltip title="Submit a Complaint">
          <Fab
            color="primary"
            aria-label="complaint"
            onClick={handleOpen}
            sx={{ position: 'fixed', bottom: 24, right: 24 }}
          >
            <HelpOutline />
          </Fab>
        </Tooltip>
      ) : (
        <Button variant="link" sx={
          {
            textDecoration:'underline'
          }
        }  startIcon={<HelpOutline />} onClick={handleOpen}>
          {buttonText}
        </Button>
      )}

      {/* Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Submit a Complaint
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <ComplaintForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComplaintModal;