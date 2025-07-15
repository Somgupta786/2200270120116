import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Mouse as ClickIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../theme/muiTheme';
import Header from '../components/layout/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { urlShortenerService, ShortenedUrl } from '../utils/urlShortener';
import { logger } from '../utils/logger';

const Analytics: React.FC = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
    logger.info('Analytics page loaded', 'PAGE_LOAD');
  }, []);

  const loadAnalyticsData = () => {
    try {
      setIsLoading(true);
      const allUrls = urlShortenerService.getAllUrls();
      setUrls(allUrls);
      
      // If there's a URL parameter, select it
      const urlParams = new URLSearchParams(window.location.search);
      const urlParam = urlParams.get('url');
      if (urlParam && allUrls.find(url => url.shortCode === urlParam)) {
        setSelectedUrl(urlParam);
      }
      
      logger.info(`Loaded analytics for ${allUrls.length} URLs`, 'ANALYTICS_LOAD');
    } catch (error) {
      setError('Failed to load analytics data');
      logger.error('Analytics data loading failed', 'ANALYTICS_LOAD', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  const getFilteredUrls = () => {
    if (selectedUrl === 'all') return urls;
    return urls.filter(url => url.shortCode === selectedUrl);
  };

  const getTotalStats = () => {
    const filteredUrls = getFilteredUrls();
    const totalClicks = filteredUrls.reduce((sum, url) => sum + url.clicks.length, 0);
    const totalUrls = filteredUrls.length;
    const activeUrls = filteredUrls.filter(url => !url.isExpired).length;
    const clicksToday = filteredUrls.reduce((sum, url) => {
      const today = new Date().toDateString();
      return sum + url.clicks.filter(click => 
        new Date(click.timestamp).toDateString() === today
      ).length;
    }, 0);

    return { totalClicks, totalUrls, activeUrls, clicksToday };
  };

  const getTopSources = () => {
    const allClicks = getFilteredUrls().flatMap(url => url.clicks);
    const sourceCounts = allClicks.reduce((acc, click) => {
      acc[click.source] = (acc[click.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getTopLocations = () => {
    const allClicks = getFilteredUrls().flatMap(url => url.clicks);
    const locationCounts = allClicks.reduce((acc, click) => {
      acc[click.location] = (acc[click.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getRecentClicks = () => {
    const allClicks = getFilteredUrls().flatMap(url => 
      url.clicks.map(click => ({
        ...click,
        shortCode: url.shortCode,
        originalUrl: url.originalUrl
      }))
    );

    return allClicks
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const stats = getTotalStats();
  const topSources = getTopSources();
  const topLocations = getTopLocations();
  const recentClicks = getRecentClicks();

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <LoadingSpinner message="Loading analytics data..." size={50} />
        </Container>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <ErrorDisplay
            title="Analytics Error"
            message={error}
            onRetry={handleRefresh}
          />
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
            Analytics Dashboard
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by URL</InputLabel>
              <Select
                value={selectedUrl}
                onChange={(e) => setSelectedUrl(e.target.value)}
                label="Filter by URL"
              >
                <MenuItem value="all">All URLs</MenuItem>
                {urls.map(url => (
                  <MenuItem key={url.shortCode} value={url.shortCode}>
                    {url.shortCode} ({url.clicks.length} clicks)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats Overview */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4 
        }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                {stats.totalClicks}
              </Typography>
              <Typography color="text.secondary">
                Total Clicks
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ClickIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                {stats.clicksToday}
              </Typography>
              <Typography color="text.secondary">
                Clicks Today
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LaunchIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                {stats.activeUrls}
              </Typography>
              <Typography color="text.secondary">
                Active URLs
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                {stats.totalUrls}
              </Typography>
              <Typography color="text.secondary">
                Total URLs
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          mb: 3
        }}>
          {/* Top Sources */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Top Traffic Sources
              </Typography>
              {topSources.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {topSources.map((source, index) => (
                    <Box key={source.source} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {source.source}
                      </Typography>
                      <Chip 
                        label={source.count} 
                        size="small" 
                        color={index === 0 ? 'primary' : 'default'} 
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No click data available</Typography>
              )}
            </CardContent>
          </Card>

          {/* Top Locations */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Top Locations
              </Typography>
              {topLocations.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {topLocations.map((location, index) => (
                    <Box key={location.location} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        <LocationIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {location.location}
                      </Typography>
                      <Chip 
                        label={location.count} 
                        size="small" 
                        color={index === 0 ? 'secondary' : 'default'} 
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No location data available</Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Recent Clicks */}
        <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Recent Click Activity
                </Typography>
                {recentClicks.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>Short Code</TableCell>
                          <TableCell>Original URL</TableCell>
                          <TableCell>Source</TableCell>
                          <TableCell>Location</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentClicks.map((click, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(click.timestamp)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={click.shortCode} 
                                size="small" 
                                color="primary"
                                sx={{ fontFamily: 'monospace' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  maxWidth: 300, 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {click.originalUrl}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {click.source}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {click.location}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">No recent clicks to display</Typography>
                )}
              </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default Analytics;