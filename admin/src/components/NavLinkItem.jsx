import { useTheme, Stack, Typography, Tooltip, Badge } from '@mui/material';
import { NavLink } from 'react-router-dom';

function NavLinkItem({ to, title, icon, badge = 0 }) {
  const { palette, typography: { button } } = useTheme();

  const linkStyle = ({ isActive }) => ({
    fontFamily: button.fontFamily,
    fontSize: button.fontSize,
    position: 'relative',
    textDecoration: 'none',
    borderBottom: isActive ? `solid 2px ${palette.secondary.main}` : 'none',
    color: isActive ? palette.secondary.main : '#fff',
    fontWeight: isActive ? 'bolder' : 'normal',
  });

  return (
    <Tooltip title={title} placement="right">
      <NavLink to={`${to}?YixHy=a34cdd3543&_pid=423423`} style={linkStyle} end>
        <Stack
          direction="row"
          columnGap={3}
          sx={{
            padding: 1,
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          }}
        >
          {badge > 0 ? (
            <Badge badgeContent={badge} color="error">
              {icon}
            </Badge>
          ) : (
            icon
          )}
          <Typography variant="button" sx={{ fontSize: 12 }}>
            {title}
          </Typography>
        </Stack>
      </NavLink>
    </Tooltip>
  );
}

export default NavLinkItem;

// import { useTheme, Stack, Typography, Tooltip } from "@mui/material";
// import { NavLink } from "react-router-dom";

// function NavLinkItem({ to, title, icon }) {
//   const {
//     palette,
//     typography: { button },
//   } = useTheme();

//   const linkStyle = ({ isActive }) => {
//     return {
//       fontFamily: button.fontFamily,
//       fontSize: button.fontSize,
//       position: "relative",
//       textDecoration: "none",
//       borderBottom: isActive ? `solid 2px ${palette.primary.main} ` : null,
//       color: isActive ? palette.secondary.main : "#fff",
//       fontWeight: isActive ? "bolder" : "normal",
//     };
//   };

//   return (
//     <Tooltip title={title} placement="right">
//       <NavLink
//         to={`${to}?YixHy=a34cdd3543&_pid=423423`}
//         // to={`${to}?YixHy=${generateRandomCode(150)}&_pid=${uuid()}`}
//         style={linkStyle}
//         end
//       >
//         <Stack
//           direction="row"
//           columnGap={3}
//           sx={{
//             padding: 1,
//             cursor: "pointer",
//             "&:hover": {
//               backgroundColor: "rgba(255,255,255,0.1)",
//             },
//           }}
//         >
//           {icon}
//           <Typography
//             variant="button"
//             sx={{
            
//               fontSize: 12,
//             }}
//           >
//             {title}
//           </Typography>
//         </Stack>
//       </NavLink>
//     </Tooltip>
//   );
// }

// export default NavLinkItem;
