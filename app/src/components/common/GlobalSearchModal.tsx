import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  InputAdornment,
  Card,
  CardContent,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  RecordVoiceOver as VisitIcon,
  Description as DocumentIcon,
  Psychology as AIIcon,
  TrendingUp as TrendingIcon,
  AccessTime as RecentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { mockVisits, Visit } from '@/data/mockData';

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'patient' | 'visit' | 'document' | 'analysis';
  icon: React.ReactNode;
  route: string;
  metadata?: string;
  score?: number;
}

const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ open, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  // Popular searches/suggestions
  const popularSearches = [
    'chest pain patients',
    'pending AI analyses',
    'recent visits',
    'emergency department',
    'cardiology department',
    'active patients',
    'completed transcripts',
  ];

  // Search function
  const performSearch = useCallback((term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerTerm = term.toLowerCase();

         // Search through visits (which contain patient data)
     mockVisits.forEach((visit) => {
       const patientName = visit.patientName.toLowerCase();
       const patientId = visit.patientId.toLowerCase();
       const chiefComplaint = visit.chiefComplaint?.toLowerCase() || '';
       const department = visit.department.toLowerCase();
       const provider = visit.attendingProvider.toLowerCase();

      // Patient search
      if (patientName.includes(lowerTerm) || patientId.includes(lowerTerm)) {
        searchResults.push({
          id: `patient-${visit.patientId}`,
          title: visit.patientName,
          subtitle: `${visit.patientAge}y ${visit.patientGender} • ${visit.patientId}`,
          type: 'patient',
          icon: <PeopleIcon />,
          route: `${ROUTES.PATIENTS}?search=${visit.patientId}`,
          metadata: visit.department,
          score: patientName.includes(lowerTerm) ? 10 : 8,
        });
      }

             // Visit search
       if ((visit.chiefComplaint && chiefComplaint.includes(lowerTerm)) || department.includes(lowerTerm) || provider.includes(lowerTerm)) {
         searchResults.push({
           id: `visit-${visit.id}`,
           title: `${visit.chiefComplaint || 'Visit'} - ${visit.patientName}`,
           subtitle: `${visit.department} • ${visit.type}`,
           type: 'visit',
           icon: <VisitIcon />,
           route: `${ROUTES.VISIT_DETAIL.replace(':id', visit.id)}`,
           metadata: visit.scheduledDateTime.toLocaleDateString(),
           score: (visit.chiefComplaint && chiefComplaint.includes(lowerTerm)) ? 9 : 6,
         });
       }

      // Document search
      if (visit.hasTranscript && (lowerTerm.includes('transcript') || lowerTerm.includes('document'))) {
        searchResults.push({
          id: `transcript-${visit.id}`,
          title: `Transcript - ${visit.patientName}`,
          subtitle: `Visit transcript for ${visit.chiefComplaint}`,
          type: 'document',
          icon: <DocumentIcon />,
          route: `${ROUTES.TRANSCRIPT_UPLOAD.replace(':id', visit.id)}`,
          metadata: 'Transcript',
          score: 7,
        });
      }

      // AI Analysis search
      if (visit.hasAiAnalysis && (lowerTerm.includes('ai') || lowerTerm.includes('analysis') || lowerTerm.includes('diagnosis'))) {
        searchResults.push({
          id: `analysis-${visit.id}`,
          title: `AI Analysis - ${visit.patientName}`,
          subtitle: `AI analysis for ${visit.chiefComplaint}`,
          type: 'analysis',
          icon: <AIIcon />,
          route: `${ROUTES.AI_ANALYSIS.replace(':id', visit.id)}`,
          metadata: 'AI Analysis',
          score: 8,
        });
      }
    });

    // Remove duplicates and sort by score
    const uniqueResults = searchResults
      .filter((result, index, self) => 
        index === self.findIndex((r) => r.id === result.id)
      )
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 8); // Limit to top 8 results

    setResults(uniqueResults);
    setSelectedIndex(0);
  }, []);

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          event.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex, onClose]);

  // Handle result selection
  const handleResultClick = (result: SearchResult) => {
    // Add to recent searches
    const newRecentSearches = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    
    // Navigate to result
    navigate(result.route);
    
    // Close modal
    onClose();
  };

  // Handle popular search click
  const handlePopularSearchClick = (search: string) => {
    setSearchTerm(search);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setSelectedIndex(0);
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'patient':
        return 'primary';
      case 'visit':
        return 'secondary';
      case 'document':
        return 'info';
      case 'analysis':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh',
          position: 'relative',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Global Search</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <TextField
          fullWidth
          placeholder="Search patients, visits, documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} size="small">
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
          autoFocus
        />

        {/* Search Results */}
        {results.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Search Results
            </Typography>
            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
              {results.map((result, index) => (
                <ListItem key={result.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleResultClick(result)}
                    selected={index === selectedIndex}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {result.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {result.title}
                          </Typography>
                          <Chip
                            label={result.type}
                            size="small"
                            color={getTypeColor(result.type) as any}
                            sx={{ height: 16, fontSize: '0.6rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {result.subtitle}
                          </Typography>
                          {result.metadata && (
                            <Typography variant="caption" color="text.secondary">
                              • {result.metadata}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && !searchTerm && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <RecentIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Recent Searches
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {recentSearches.map((search, index) => (
                <Chip
                  key={index}
                  label={search}
                  size="small"
                  variant="outlined"
                  onClick={() => handlePopularSearchClick(search)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Popular Searches */}
        {!searchTerm && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <TrendingIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Popular Searches
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {popularSearches.map((search, index) => (
                <Chip
                  key={index}
                  label={search}
                  size="small"
                  variant="outlined"
                  onClick={() => handlePopularSearchClick(search)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* No Results */}
        {searchTerm && results.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No results found for "{searchTerm}"
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try searching for patients, visits, or documents
            </Typography>
          </Box>
        )}

        {/* Keyboard shortcuts help */}
        <Box sx={{ mt: 2, p: 1, backgroundColor: 'background.default', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Use ↑↓ arrows to navigate, Enter to select, Esc to close
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}; 