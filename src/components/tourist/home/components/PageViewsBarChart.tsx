import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

export default function TouristSafetyBarChart() {
  const theme = useTheme();
  const colorPalette = [
    (theme.vars || theme).palette.primary.dark,
    (theme.vars || theme).palette.primary.main,
    (theme.vars || theme).palette.primary.light,
  ];

  // Dummy data for Smart Tourist Safety Monitoring System
  const touristSafetyData = {
    totalRegistrations: '2.4M',
    safetyImprovement: '+12%',
    description: 'Digital tourist registrations and safety incidents for Northeast India - Last 7 months'
  };

  const monthlyData = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'
  ];

  const registrationsData = [
    180000, 220000, 340000, 380000, 450000, 520000, 480000
  ];

  const incidentsReportedData = [
    45, 38, 52, 41, 67, 73, 58
  ];

  const incidentsResolvedData = [
    42, 36, 49, 39, 63, 69, 55
  ];

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Tourist Safety Monitoring & Digital Registrations
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {touristSafetyData.totalRegistrations}
            </Typography>
            <Chip size="small" color="success" label={touristSafetyData.safetyImprovement} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {touristSafetyData.description}
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'band',
              categoryGapRatio: 0.5,
              data: monthlyData,
              height: 24,
            },
          ]}
          yAxis={[{ width: 50 }]}
          series={[
            {
              id: 'digital-registrations',
              label: 'Digital Tourist Registrations',
              data: registrationsData,
              stack: 'A',
            },
            {
              id: 'incidents-reported',
              label: 'Safety Incidents Reported',
              data: incidentsReportedData,
              stack: 'B',
            },
            {
              id: 'incidents-resolved',
              label: 'Incidents Resolved',
              data: incidentsResolvedData,
              stack: 'B',
            },
          ]}
          height={250}
          margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          hideLegend
        />
      </CardContent>
    </Card>
  );
}