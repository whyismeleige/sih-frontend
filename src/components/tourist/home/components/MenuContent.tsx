import * as React from "react";
import List from "@mui/material/List";
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
  { text: "Home", icon: <HomeRoundedIcon /> },
  { text: "Profile", icon: <AccountBoxIcon /> },
  { text: "Bookings", icon: <AirplaneTicketIcon /> },
  { text: "Emergency", icon: <EmergencyShareIcon /> },
  { text: "Safety", icon: <HealthAndSafetyIcon /> },
  { text: "Explore", icon: <TravelExploreIcon /> },
];

const secondaryListItems = [
  { text: "Current Location",icon: <GpsFixedIcon/>},
  { text: "Settings", icon: <SettingsRoundedIcon /> },
  { text: "About", icon: <InfoRoundedIcon /> },
  { text: "Feedback", icon: <HelpRoundedIcon /> },
];

export default function MenuContent() {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton selected={index === 0}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
