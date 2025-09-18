import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Link from "next/link";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

const mainListItems = [
  { text: "Home", icon: <HomeRoundedIcon />, href: "/authority" },
  { text: "Analytics", icon: <AnalyticsRoundedIcon />, href: "#" },
  { text: "Alerts", icon: <AddAlertIcon />, href: "#" },
  { text: "Monitoring", icon: <MonitorHeartIcon />, href: "#" },
  { text: "Reports", icon: <SummarizeIcon />, href: "#" },
  { text: "Tourists", icon: <PersonSearchIcon />, href: "/authority/tourists" },
];

const secondaryListItems = [
  { text: "Settings", icon: <SettingsRoundedIcon />, href: "#" },
  { text: "About", icon: <InfoRoundedIcon />, href: "#" },
  { text: "Feedback", icon: <HelpRoundedIcon />, href: "#" },
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
