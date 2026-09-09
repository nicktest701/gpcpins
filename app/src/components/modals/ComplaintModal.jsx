import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Fab,
  Tooltip,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ComplaintForm from '../forms/ComplaintForm';


const ComplaintModal = ({ buttonVariant = 'fab', buttonText = 'Submit Complaint',showLarge=false }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSuccess = () => {
    // Close the modal after successful submission
    setOpen(false);
  };

  return (
    <>
    

   {showLarge ? (
       <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          my: 3,
          cursor: 'pointer',
        }}
        onClick={handleOpen} 
      >
        <Box
          component="img"
          src="https://placehold.co/600x300?text=Submit+a+Complaint"
          alt="Submit a complaint"
          sx={{ width: '100%', maxWidth: 600, borderRadius: 2 }}
        />
        <Button variant="contained" size="large" onClick={handleOpen} endIcon={<SupportAgentIcon />}>
             Fill Complaint Form
        </Button>
      </Box>
   ):(<>
     {/* Trigger Button */}
      {buttonVariant === 'fab' ? (
        <Tooltip title="Submit a Complaint">
          <Fab
            color="primary"
            aria-label="complaint"
            onClick={handleOpen}
            sx={{ position: 'fixed', bottom: "40%", left: 24 }}
          >
            <SupportAgentIcon />
          </Fab>
        </Tooltip>
      ) : (
        <Button variant="link" sx={
          {
            textDecoration:'underline'
          }
        }  endIcon={<SupportAgentIcon />} onClick={handleOpen}>
          {buttonText}
        </Button>
      )}
   </>)}

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
        <DialogContent dividers sx={{p:1}}>
          <ComplaintForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComplaintModal;