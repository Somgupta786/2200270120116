import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../theme/muiTheme';
import Header from '../components/layout/Header';
import { logger, LogLevel, LogEntry } from '../utils/logger';

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [filterContext, setFilterContext] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadLogs();
    logger.info('System logs page loaded', 'PAGE_LOAD');
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filterLevel, filterContext, searchQuery]);

  const loadLogs = () => {
    const allLogs = logger.getAllLogs();
    setLogs(allLogs);
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Filter by level
    if (filterLevel !== 'all') {
      filtered = filtered.filter(log => log.level === filterLevel);
    }

    // Filter by context
    if (filterContext) {
      filtered = filtered.filter(log => 
        log.context?.toLowerCase().includes(filterContext.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.context && log.context.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredLogs(filtered);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      logger.clearLogs();
      loadLogs();
      logger.info('Logs cleared by user', 'SYSTEM');
    }
  };

  const handleExportLogs = () => {
    const logsData = logger.exportLogs();
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `url-shortener-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    logger.info('Logs exported by user', 'SYSTEM');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getLevelColor = (level: LogLevel): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'default';
      case LogLevel.INFO:
        return 'info';
      case LogLevel.WARN:
        return 'warning';
      case LogLevel.ERROR:
        return 'error';
      default:
        return 'default';
    }
  };

  const getUniqueContexts = () => {
    const contexts = logs
      .map(log => log.context)
      .filter((context): context is string => Boolean(context))
      .filter((context, index, array) => array.indexOf(context) === index)
      .sort();
    return contexts;
  };

  const getLogStats = () => {
    const total = logs.length;
    const errors = logs.filter(log => log.level === LogLevel.ERROR).length;
    const warnings = logs.filter(log => log.level === LogLevel.WARN).length;
    const info = logs.filter(log => log.level === LogLevel.INFO).length;
    const debug = logs.filter(log => log.level === LogLevel.DEBUG).length;

    return { total, errors, warnings, info, debug };
  };

  const stats = getLogStats();
  const uniqueContexts = getUniqueContexts();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
            System Logs
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh logs">
              <IconButton onClick={loadLogs}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Export logs">
              <IconButton onClick={handleExportLogs}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Clear all logs">
              <IconButton onClick={handleClearLogs} color="error">
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Log Statistics */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
          gap: 2,
          mb: 4 
        }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Logs
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
                {stats.errors}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Errors
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {stats.warnings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Warnings
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'info.main' }}>
                {stats.info}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Info
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {stats.debug}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Debug
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon />
              Filters
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2 
            }}>
              <FormControl size="small">
                <InputLabel>Log Level</InputLabel>
                <Select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value as LogLevel | 'all')}
                  label="Log Level"
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value={LogLevel.ERROR}>Error</MenuItem>
                  <MenuItem value={LogLevel.WARN}>Warning</MenuItem>
                  <MenuItem value={LogLevel.INFO}>Info</MenuItem>
                  <MenuItem value={LogLevel.DEBUG}>Debug</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small">
                <InputLabel>Context</InputLabel>
                <Select
                  value={filterContext}
                  onChange={(e) => setFilterContext(e.target.value)}
                  label="Context"
                >
                  <MenuItem value="">All Contexts</MenuItem>
                  {uniqueContexts.map(context => (
                    <MenuItem key={context} value={context}>
                      {context}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                size="small"
                label="Search messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in messages..."
              />
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredLogs.length} of {logs.length} logs
              </Typography>
              
              <Button 
                size="small" 
                onClick={() => {
                  setFilterLevel('all');
                  setFilterContext('');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Context</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.map((log, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {formatTimestamp(log.timestamp)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={log.level} 
                          size="small" 
                          color={getLevelColor(log.level)}
                          sx={{ minWidth: 60 }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {log.context || '-'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 400 }}>
                          {log.message}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        {log.data ? (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace', 
                              fontSize: '0.75rem',
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer'
                            }}
                            title={JSON.stringify(log.data, null, 2)}
                          >
                            {JSON.stringify(log.data)}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {filteredLogs.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No logs match your current filters
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default Logs;