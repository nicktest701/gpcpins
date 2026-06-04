import { NavLink } from "react-router-dom";
import { DropdownBase } from "./DropdownBase";
import { useTheme } from "@mui/material";

const items = [
  { to: "/airtime?link=6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5", label: "Airtime & Data Bundle" },
  { to: "/airtime?link=c458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a", label: "Bulk Airtime & EVD" },
  { to: "/airtime?link=f5bff298105152dee535d42d497eb8de640200781077c66846b77f000fccdc19", label: "Freelance Agent / Distributor" },
];


const AirtimeDropdown = () => {
const {palette} = useTheme();

     const dropdownItemStyles = ({ isActive }) => {

  return {
    color:  isActive ? palette.secondary.main : "#333",
    fontWeight: isActive ? "700" : "normal",
    fontSize: "0.85rem",
    textDecoration: "none",
    padding: "8px 16px",
    width: "100%",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor:  palette.action.hover,
      color:  palette.secondary.main,
    },
  };
};

  return (
    <DropdownBase>
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} style={dropdownItemStyles}>
          {item.label}
        </NavLink>
      ))}
    </DropdownBase>
  );
};

export default AirtimeDropdown;


// import { Box, Stack, useTheme } from '@mui/material';
// import { NavLink } from 'react-router-dom';


// const AirtimeDropdown = ({ display }) => {
//   const {palette}=useTheme()

//   const styles = ({ isActive }) => {
//     return {
//       color: isActive ? palette.secondary.main: '#333',
//       fontWeight: isActive ? '700' : 'normal',
//       fontSize: 13,
//     };
//   };

//   return (
//     <Box
//       sx={{
//         display: 'block',
//         position: 'absolute',
//         visibility: display ? 'visible' : 'collapse',
//         width: 300,
//         bgcolor: '#fff',
//         top: 41,
//         boxShadow: '3px 3px 1px hsl(207, 97%, 98%)',
//         transform: `translateY(${display ? 0 : 10}px)`,
//         transition: 'all 150ms ease-in-out',
//         opacity: display ? 1 : 0,
//       }}
//     >
//       <Stack justifyContent='flex-start' alignItems='flex-start' padding={0}>
//         <NavLink style={styles} to='/airtime?link=6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5' className='dropdown-item'>
//           Airtime & Data Bundle
//         </NavLink>
//         <NavLink style={styles} to='/airtime?link=c458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a' className='dropdown-item'>
//         Bulk Airtime & EVD
//         </NavLink>
//         <NavLink style={styles} to='/airtime?link=f5bff298105152dee535d42d497eb8de640200781077c66846b77f000fccdc19' className='dropdown-item'>
//       Freelance Agent / Distributor
//         </NavLink>
     
//       </Stack>
//     </Box>
//   );
// };

// export default AirtimeDropdown;
