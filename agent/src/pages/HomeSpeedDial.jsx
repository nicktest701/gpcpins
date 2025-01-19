import * as React from 'react';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import { MessageRounded } from '@mui/icons-material';
import Whatsapp from '../components/jsx-icons/Whatsapp';
import TextMessage from '../components/jsx-icons/TextMessage';
import PhoneCall from '../components/jsx-icons/PhoneCall';

export default function HomeSpeedDial() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  const actions = [
    {
      icon: <Whatsapp width={24} height={24} />,
      name: 'Whatsapp',
      onClick: () => {
        window.open('https://wa.me/+233244012766');
        handleClose();
      },
    },

    {
      icon: <PhoneCall width={24} height={24} />,
      name: 'Phone Call',
      onClick: () => {
        window.open('tel:+233244012766');
        handleClose();
      },
    },
  ];

  return (
    <SpeedDial
      ariaLabel='SpeedDial tooltip example'
      sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed',
        bottom: '12%',
        left: '2%',
      }}
      icon={<MessageRounded />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          // tooltipOpen
          tooltipPlacement='bottom'
          onClick={action.onClick}
        />
      ))}
    </SpeedDial>
  );
}
