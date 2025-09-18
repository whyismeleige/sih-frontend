import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import ChartUserByCountry from './ChartUserByCountry';
import CustomizedTreeView from './CustomizedTreeView';
import CustomizedDataGrid from './CustomizedDataGrid';
import HighlightedCard from './HighlightedCard';
import PageViewsBarChart from './PageViewsBarChart';
import SessionsChart from './SessionsChart';
import StatCard, { StatCardProps } from './StatCard';

const data: StatCardProps[] = [
  {
    title: 'Active Digital Tourist IDs',
    value: '8.2k',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      150, 180, 220, 280, 340, 380, 420, 460, 520, 580, 640, 720, 780, 840, 920, 1080,
      1200, 1350, 1480, 1620, 1780, 1940, 2100, 2280, 2460, 2640, 2820, 3000, 3180, 3350,
    ],
  },
  {
    title: 'Safety Alerts Resolved',
    value: '247',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      45, 52, 38, 64, 71, 58, 49, 67, 73, 81, 69, 76, 84, 91, 88, 95,
      102, 89, 97, 104, 111, 98, 105, 112, 119, 106, 113, 120, 127, 134,
    ],
  },
  {
    title: 'Geo-fence Violations',
    value: '89',
    interval: 'Last 30 days',
    trend: 'down',
    data: [
      180, 165, 142, 158, 134, 121, 108, 95, 112, 98, 85, 102, 88, 75, 91, 78,
      94, 81, 87, 74, 90, 77, 83, 70, 86, 73, 79, 66, 82, 69,
    ],
  },
];

export default function MainGrid() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Tourist Safety Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <HighlightedCard />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SessionsChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PageViewsBarChart />
        </Grid>
      </Grid>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 9 }}>
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
          </Stack>
        </Grid>
      </Grid>
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}