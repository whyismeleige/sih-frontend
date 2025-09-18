import * as React from "react";
import List from "@mui/material/List";
import Link from "next/link";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';
import EmergencyShareIcon from '@mui/icons-material/EmergencyShare';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

const mainListItems = [
  { text: "Home", icon: <HomeRoundedIcon />, href: "/tourist" },
  { text: "Profile", icon: <AccountBoxIcon />, href: "#" },
  { text: "Bookings", icon: <AirplaneTicketIcon />, href: "/tourist/booking" },
  { text: "Emergency", icon: <EmergencyShareIcon />, href: "#" },
  { text: "Safety", icon: <HealthAndSafetyIcon />, href: "#" },
  { text: "Explore", icon: <TravelExploreIcon />, href: "#" },
];

const secondaryListItems = [
  { text: "Current Location",icon: <GpsFixedIcon/>, href: "/tourist/current-location"},
  { text: "Settings", icon: <SettingsRoundedIcon />, href: "#" },
  { text: "About", icon: <InfoRoundedIcon /> , href: "#"},
  { text: "Feedback", icon: <HelpRoundedIcon /> , href: "#"},
];

export default function MenuContent() {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <Link href={item.href}>
            <ListItemButton selected={index === 0}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <Link href={item.href}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
