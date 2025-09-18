"use client"
import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Chip,
  Stack,
  Avatar,
  Divider,
  FormControlLabel,
  Checkbox,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

// Type definitions
interface TouristType {
  value: string;
  label: string;
}

interface SafetyPackage {
  id: string;
  name: string;
  price: string;
  features: string[];
  color: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  idType: 'passport' | 'aadhaar' | 'license';
  idNumber: string;
  touristType: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  emergencyContact: string;
  emergencyPhone: string;
  specialRequirements: string;
  optInTracking: boolean;
  agreePolicies: boolean;
}

// Constants
const touristTypes: TouristType[] = [
  { value: 'solo', label: 'Solo Traveler' },
  { value: 'family', label: 'Family (2-4 members)' },
  { value: 'group', label: 'Group (5+ members)' },
  { value: 'business', label: 'Business Travel' },
];

const safetyPackages: SafetyPackage[] = [
  {
    id: 'basic',
    name: 'Basic Safety Package',
    price: '₹299',
    features: ['Digital ID Generation', 'Geo-fencing Alerts', 'Emergency Contacts', 'Basic Support'],
    color: 'primary',
  },
  {
    id: 'premium',
    name: 'Premium Safety Package',
    price: '₹599',
    features: ['All Basic Features', 'Real-time Tracking', 'IoT Wearable', 'Priority Support', '24/7 Monitoring'],
    color: 'secondary',
  },
  {
    id: 'family',
    name: 'Family Safety Package',
    price: '₹999',
    features: ['All Premium Features', 'Multiple IDs (up to 6)', 'Family Dashboard', 'Group Tracking', 'Dedicated Officer'],
    color: 'success',
  },
];

const steps: string[] = ['Personal Details', 'Travel Information', 'Safety Package', 'Review & Payment'];

const TouristBookingComponent: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [selectedPackage, setSelectedPackage] = React.useState<string>('basic');
  const [formData, setFormData] = React.useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    idType: 'passport',
    idNumber: '',
    touristType: 'solo',
    destination: '',
    checkIn: '',
    checkOut: '',
    emergencyContact: '',
    emergencyPhone: '',
    specialRequirements: '',
    optInTracking: false,
    agreePolicies: false,
  });

  const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleCheckboxChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.checked,
    });
  };

  const handleNext = (): void => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = (): void => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePackageSelect = (packageId: string): void => {
    setSelectedPackage(packageId);
  };

  const renderPersonalDetails = (): React.ReactElement => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon color="primary" />
          Personal Information
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="First Name"
          value={formData.firstName}
          onChange={handleInputChange('firstName')}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Last Name"
          value={formData.lastName}
          onChange={handleInputChange('lastName')}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          required
          InputProps={{
            startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Phone Number"
          value={formData.phone}
          onChange={handleInputChange('phone')}
          required
          InputProps={{
            startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Nationality"
          value={formData.nationality}
          onChange={handleInputChange('nationality')}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }}>
        <TextField
          fullWidth
          select
          label="ID Type"
          value={formData.idType}
          onChange={handleInputChange('idType')}
          required
        >
          <MenuItem value="passport">Passport</MenuItem>
          <MenuItem value="aadhaar">Aadhaar</MenuItem>
          <MenuItem value="license">Driver's License</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }}>
        <TextField
          fullWidth
          label="ID Number"
          value={formData.idNumber}
          onChange={handleInputChange('idNumber')}
          required
        />
      </Grid>
    </Grid>
  );

  const renderTravelInfo = (): React.ReactElement => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon color="primary" />
          Travel Information
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          select
          label="Tourist Type"
          value={formData.touristType}
          onChange={handleInputChange('touristType')}
          required
          InputProps={{
            startAdornment: <GroupIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
        >
          {touristTypes.map((option: TouristType) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Primary Destination"
          value={formData.destination}
          onChange={handleInputChange('destination')}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Check-in Date"
          type="date"
          value={formData.checkIn}
          onChange={handleInputChange('checkIn')}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Check-out Date"
          type="date"
          value={formData.checkOut}
          onChange={handleInputChange('checkOut')}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Emergency Contact Name"
          value={formData.emergencyContact}
          onChange={handleInputChange('emergencyContact')}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Emergency Contact Phone"
          value={formData.emergencyPhone}
          onChange={handleInputChange('emergencyPhone')}
          required
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Special Requirements"
          multiline
          rows={3}
          value={formData.specialRequirements}
          onChange={handleInputChange('specialRequirements')}
          placeholder="Any special needs, medical conditions, or accessibility requirements..."
        />
      </Grid>
    </Grid>
  );

  const renderSafetyPackages = (): React.ReactElement => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <SecurityIcon color="primary" />
        Choose Your Safety Package
      </Typography>
      <Grid container spacing={3}>
        {safetyPackages.map((pkg: SafetyPackage) => (
          <Grid size={{ xs: 12, md: 4 }} key={pkg.id}>
            <Card
              sx={{
                height: '100%',
                border: selectedPackage === pkg.id ? 2 : 1,
                borderColor: selectedPackage === pkg.id ? `${pkg.color}.main` : 'divider',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handlePackageSelect(pkg.id)}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="h3">
                      {pkg.name}
                    </Typography>
                    {selectedPackage === pkg.id && (
                      <CheckCircleIcon color={pkg.color} />
                    )}
                  </Box>
                  <Typography variant="h4" color={`${pkg.color}.main`} fontWeight="bold">
                    {pkg.price}
                  </Typography>
                  <Divider />
                  <Stack spacing={1}>
                    {pkg.features.map((feature: string, index: number) => (
                      <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        {feature}
                      </Typography>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 4 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.optInTracking}
              onChange={handleCheckboxChange('optInTracking')}
            />
          }
          label="I consent to real-time location tracking for enhanced safety (optional)"
        />
      </Box>
    </Box>
  );

  const renderReview = (): React.ReactElement => {
    const selectedPkg: SafetyPackage | undefined = safetyPackages.find((pkg: SafetyPackage) => pkg.id === selectedPackage);
    const selectedTouristType: TouristType | undefined = touristTypes.find((t: TouristType) => t.value === formData.touristType);

    return (
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>
          Review Your Booking
        </Typography>
        
        <Paper elevation={1} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Personal Details</Typography>
              <IconButton size="small" onClick={() => setActiveStep(0)}>
                <EditIcon />
              </IconButton>
            </Box>
            <Typography variant="body2">
              <strong>Name:</strong> {formData.firstName} {formData.lastName}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {formData.email}
            </Typography>
            <Typography variant="body2">
              <strong>Phone:</strong> {formData.phone}
            </Typography>
          </Stack>
        </Paper>

        <Paper elevation={1} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Travel Information</Typography>
              <IconButton size="small" onClick={() => setActiveStep(1)}>
                <EditIcon />
              </IconButton>
            </Box>
            <Typography variant="body2">
              <strong>Destination:</strong> {formData.destination}
            </Typography>
            <Typography variant="body2">
              <strong>Duration:</strong> {formData.checkIn} to {formData.checkOut}
            </Typography>
            <Typography variant="body2">
              <strong>Tourist Type:</strong> {selectedTouristType?.label}
            </Typography>
          </Stack>
        </Paper>

        <Paper elevation={1} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Safety Package</Typography>
              <IconButton size="small" onClick={() => setActiveStep(2)}>
                <EditIcon />
              </IconButton>
            </Box>
            <Typography variant="body2">
              <strong>Package:</strong> {selectedPkg?.name}
            </Typography>
            <Typography variant="h5" color="primary.main" fontWeight="bold">
              Total: {selectedPkg?.price}
            </Typography>
          </Stack>
        </Paper>

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.agreePolicies}
              onChange={handleCheckboxChange('agreePolicies')}
              required
            />
          }
          label="I agree to the Terms of Service and Privacy Policy"
        />
      </Stack>
    );
  };

  const getStepContent = (step: number): React.ReactElement | string => {
    switch (step) {
      case 0:
        return renderPersonalDetails();
      case 1:
        return renderTravelInfo();
      case 2:
        return renderSafetyPackages();
      case 3:
        return renderReview();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', p: 3 }}>
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary.main">
            Tourist Safety Registration
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Register for your Digital Tourist ID and choose a safety package for secure travel
          </Typography>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label: string) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Registration Complete!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your Digital Tourist ID will be generated and sent to your email within 24 hours.
              </Typography>
              <Alert severity="success" sx={{ mt: 2 }}>
                <strong>Booking ID:</strong> TSM-{Date.now().toString().slice(-6)}
              </Alert>
            </Box>
          ) : (
            <Box>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={activeStep === steps.length - 1 ? handleNext : handleNext}
                  disabled={activeStep === steps.length - 1 && !formData.agreePolicies}
                >
                  {activeStep === steps.length - 1 ? 'Complete Registration' : 'Next'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TouristBookingComponent;