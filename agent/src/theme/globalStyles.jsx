// @mui
import { GlobalStyles as MUIGlobalStyles } from '@mui/material';

// ----------------------------------------------------------------------

export default function GlobalStyles() {
  const inputGlobalStyles = (
    <MUIGlobalStyles
      // styles={{
      //   '*': {
      //     boxSizing: 'border-box',
      //   },
      //   html: {
      //     margin: 0,
      //     padding: 0,
      //     WebkitOverflowScrolling: 'touch',
      //     fontFamily: '"DM Sans",system-ui, sans-serif',
      //     height:'100%'
      //   },
      //   body: {
      //     margin: 0,
      //     padding: 0,
      //     backgroundColor: '#fff',
      //     height:'100svh'
      //   },
      //   '#root': {
      //     width: '100%',
      //     height: '100%',
      //   },
      //   input: {
      //     '&[type=number]': {
      //       MozAppearance: 'textfield',
      //       '&::-webkit-outer-spin-button': {
      //         margin: 0,
      //         WebkitAppearance: 'none',
      //       },
      //       '&::-webkit-inner-spin-button': {
      //         margin: 0,
      //         WebkitAppearance: 'none',
      //       },
      //     },
      //   },
      //   img: {
      //     display: 'block',
      //     maxWidth: '100%',
      //   },
      //   ul: {
      //     margin: 0,
      //     padding: 0,
      //   },
      
      // }}
    />
  );

  return inputGlobalStyles;
}
