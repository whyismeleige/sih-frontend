import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";

const items = [
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: "Swift response system",
    description:
      "Handle travel-related incidents with speed and accuracy, minimizing disruption and ensuring safety.",
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: "Robust reliability",
    description:
      "Rely on a system designed to perform under pressure, offering dependable protection during unexpected events.",
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: "Traveler-focused design",
    description:
      "Enjoy a streamlined experience built with travelers in mind, simplifying reporting and assistance at every step.",
  },
  {
    icon: <AutoFixHighRoundedIcon />,
    title: "Innovative safety features",
    description:
      "Benefit from advanced monitoring, real-time alerts, and predictive tools that set new standards in travel security.",
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: "Dedicated support network",
    description:
      "Access 24/7 assistance and guidance, ensuring help is always within reach, no matter where you are.",
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: "Precision-driven coordination",
    description:
      "Experience a system where every detail from alerts to resolution, is fine-tuned for maximum impact and efficiency.",
  },
];

export default function Highlights(props: {
  setRef: (key: string, node: HTMLDivElement | null) => void;
}) {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: "white",
        bgcolor: "grey.900",
      }}
      ref={(node: HTMLDivElement | null) => props.setRef("Highlights", node)}
    >
      <Container
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: "100%", md: "60%" },
            textAlign: { sm: "left", md: "center" },
          }}
        >
          <Typography component="h2" variant="h4" gutterBottom>
            Highlights
          </Typography>
          <Typography variant="body1" sx={{ color: "grey.400" }}>
            Discover how Sentinel Travel ensures safety, reliability, and
            seamless support for every traveler. Built on trust, speed, and
            precision, it delivers peace of mind wherever your journey takes
            you.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: "inherit",
                  p: 3,
                  height: "100%",
                  borderColor: "hsla(220, 25%, 25%, 0.3)",
                  backgroundColor: "grey.800",
                }}
              >
                <Box sx={{ opacity: "50%" }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: "medium" }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "grey.400" }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
