import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
  category: 'navigation' | 'patient' | 'analysis' | 'general';
  context?: 'global' | 'patient-list' | 'analysis' | 'transcript';
  preventDefault?: boolean;
}

export interface ShortcutHelp {
  key: string;
  description: string;
  category: string;
}

const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);

  // Core navigation shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts - using Shift+letters for intuitive access
    {
      key: 'd',
      shiftKey: true,
      description: 'Go to Dashboard',
      action: () => navigate(ROUTES.DASHBOARD),
      category: 'navigation',
      context: 'global',
      preventDefault: true
    },
    {
      key: 'p',
      shiftKey: true,
      description: 'Go to Patients',
      action: () => navigate(ROUTES.PATIENTS),
      category: 'navigation',
      context: 'global',
      preventDefault: true
    },
    {
      key: 'v',
      shiftKey: true,
      description: 'Go to Visits',
      action: () => navigate(ROUTES.VISITS),
      category: 'navigation',
      context: 'global',
      preventDefault: true
    },
    {
      key: 't',
      shiftKey: true,
      description: 'Go to Transcripts',
      action: () => navigate(ROUTES.TRANSCRIPTS),
      category: 'navigation',
      context: 'global',
      preventDefault: true
    },
    {
      key: 'a',
      shiftKey: true,
      description: 'Go to AI Analysis',
      action: () => navigate(ROUTES.AI_AGENT),
      category: 'navigation',
      context: 'global',
      preventDefault: true
    },
    // Quick actions
    {
      key: 'u',
      ctrlKey: true,
      description: 'Upload Transcript',
      action: () => {
        // Navigate to upload or trigger upload modal
        navigate(ROUTES.VISITS);
        // TODO: Trigger upload modal
      },
      category: 'general',
      context: 'global',
      preventDefault: true
    },
    {
      key: 'i',
      ctrlKey: true,
      shiftKey: true,
      description: 'Start AI Analysis',
      action: () => navigate(ROUTES.AI_AGENT),
      category: 'analysis',
      context: 'global',
      preventDefault: true
    },
    {
      key: 'f',
      ctrlKey: true,
      description: 'Search Patients',
      action: () => {
        navigate(ROUTES.PATIENTS);
        // TODO: Focus search input
      },
      category: 'patient',
      context: 'global',
      preventDefault: true
    },
    {
      key: 'k',
      ctrlKey: true,
      description: 'Global Search',
      action: () => {
        setShowGlobalSearch(true);
      },
      category: 'general',
      context: 'global',
      preventDefault: true
    },
    // Help
    {
      key: '?',
      description: 'Show Keyboard Shortcuts',
      action: () => setShowHelpModal(true),
      category: 'general',
      context: 'global',
      preventDefault: true
    },
    {
      key: 'Escape',
      description: 'Close Modals/Cancel',
      action: () => {
        setShowHelpModal(false);
        setShowGlobalSearch(false);
        // TODO: Close other modals
      },
      category: 'general',
      context: 'global'
    }
  ];

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const activeShortcuts = shortcuts.length > 0 ? shortcuts : defaultShortcuts;
    
    // Debug logging to help test shortcuts
    if (event.key !== 'Tab' && event.key !== 'Meta' && event.key !== 'Control' && event.key !== 'Shift' && event.key !== 'Alt') {
      console.log('🎹 [Shortcuts Debug] Key pressed:', {
        key: event.key,
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        isMac: isMac
      });
    }
    
    for (const shortcut of activeShortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      
      // Only check modifiers that are explicitly defined in the shortcut
      const ctrlMatches = shortcut.ctrlKey === undefined || 
                         (!!shortcut.ctrlKey === (isMac ? event.metaKey : event.ctrlKey));
      const metaMatches = shortcut.metaKey === undefined || 
                         (!!shortcut.metaKey === event.metaKey);
      const shiftMatches = shortcut.shiftKey === undefined || 
                          (!!shortcut.shiftKey === event.shiftKey);
      const altMatches = shortcut.altKey === undefined || 
                        (!!shortcut.altKey === event.altKey);

      if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
        if (shortcut.preventDefault) {
          event.preventDefault();
        }
        
        // Check if we're in an input field and should skip certain shortcuts
        const target = event.target as HTMLElement;
        const isInputField = target.tagName === 'INPUT' || 
                           target.tagName === 'TEXTAREA' || 
                           target.contentEditable === 'true';
        
        // Skip shortcuts when typing in input fields (except for specific ones like Escape, Help)
        if (isInputField && !['Escape', '?', 'k'].includes(shortcut.key)) {
          console.log('🎹 [Shortcuts Debug] Skipping shortcut in input field:', shortcut.description);
          continue;
        }
        
        try {
          console.log('🎹 [Shortcuts Debug] Executing shortcut:', shortcut.description);
          shortcut.action();
        } catch (error) {
          console.error('Error executing keyboard shortcut:', error);
        }
        break;
      }
    }
  }, [shortcuts, navigate, defaultShortcuts]);

  // Register shortcuts
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => [...prev.filter(s => 
      !(s.key === shortcut.key && 
        s.ctrlKey === shortcut.ctrlKey && 
        s.metaKey === shortcut.metaKey &&
        s.shiftKey === shortcut.shiftKey &&
        s.altKey === shortcut.altKey)
    ), shortcut]);
  }, []);

  // Unregister shortcuts
  const unregisterShortcut = useCallback((key: string, modifiers?: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
  }) => {
    setShortcuts(prev => prev.filter(s => 
      !(s.key === key && 
        s.ctrlKey === modifiers?.ctrlKey && 
        s.metaKey === modifiers?.metaKey &&
        s.shiftKey === modifiers?.shiftKey &&
        s.altKey === modifiers?.altKey)
    ));
  }, []);

  // Get shortcut help data
  const getShortcutHelp = useCallback((): ShortcutHelp[] => {
    const activeShortcuts = shortcuts.length > 0 ? shortcuts : defaultShortcuts;
    
    return activeShortcuts.map(shortcut => {
      let keyDisplay = shortcut.key;
      const modifiers = [];
      
      if (shortcut.ctrlKey) modifiers.push(isMac ? '⌘' : 'Ctrl');
      if (shortcut.metaKey) modifiers.push('⌘');
      if (shortcut.shiftKey) modifiers.push('⇧');
      if (shortcut.altKey) modifiers.push(isMac ? '⌥' : 'Alt');
      
      if (modifiers.length > 0) {
        keyDisplay = `${modifiers.join(' + ')} + ${shortcut.key.toUpperCase()}`;
      } else {
        keyDisplay = shortcut.key === '?' ? '?' : shortcut.key.toUpperCase();
      }
      
      return {
        key: keyDisplay,
        description: shortcut.description,
        category: shortcut.category
      };
    }).sort((a, b) => {
      // Sort by category, then by key
      if (a.category !== b.category) {
        const order = ['navigation', 'patient', 'analysis', 'general'];
        return order.indexOf(a.category) - order.indexOf(b.category);
      }
      return a.key.localeCompare(b.key);
    });
  }, [shortcuts]);

  // Format shortcut display
  const formatShortcut = useCallback((shortcut: KeyboardShortcut): string => {
    const modifiers = [];
    if (shortcut.ctrlKey) modifiers.push(isMac ? '⌘' : 'Ctrl');
    if (shortcut.metaKey) modifiers.push('⌘');
    if (shortcut.shiftKey) modifiers.push('⇧');
    if (shortcut.altKey) modifiers.push(isMac ? '⌥' : 'Alt');
    
    const keyDisplay = shortcut.key === '?' ? '?' : shortcut.key.toUpperCase();
    
    return modifiers.length > 0 
      ? `${modifiers.join(' + ')} + ${keyDisplay}`
      : keyDisplay;
  }, []);

  // Patient navigation shortcuts
  const addPatientShortcuts = useCallback((patients: Array<{id: string, name: string}>) => {
    // Add number shortcuts for first 9 patients
    const patientShortcuts: KeyboardShortcut[] = patients.slice(0, 9).map((patient, index) => ({
      key: (index + 1).toString(),
      altKey: true,
      description: `Switch to ${patient.name}`,
      action: () => {
        // TODO: Switch to patient
        console.log(`Switching to patient: ${patient.name}`);
      },
      category: 'patient',
      context: 'patient-list',
      preventDefault: true
    }));

    patientShortcuts.forEach(registerShortcut);
  }, [registerShortcut]);

  // Analysis shortcuts
  const addAnalysisShortcuts = useCallback((analysisId?: string) => {
    const analysisShortcuts: KeyboardShortcut[] = [
      {
        key: 'r',
        ctrlKey: true,
        description: 'Refresh Analysis',
        action: () => {
          // TODO: Refresh current analysis
          console.log('Refreshing analysis');
        },
        category: 'analysis',
        context: 'analysis',
        preventDefault: true
      },
      {
        key: 's',
        ctrlKey: true,
        description: 'Save Analysis',
        action: () => {
          // TODO: Save analysis
          console.log('Saving analysis');
        },
        category: 'analysis',
        context: 'analysis',
        preventDefault: true
      },
      {
        key: 'e',
        ctrlKey: true,
        description: 'Export Analysis',
        action: () => {
          // TODO: Export analysis
          console.log('Exporting analysis');
        },
        category: 'analysis',
        context: 'analysis',
        preventDefault: true
      }
    ];

    analysisShortcuts.forEach(registerShortcut);
  }, [registerShortcut]);

  // Setup event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    registerShortcut,
    unregisterShortcut,
    getShortcutHelp,
    formatShortcut,
    addPatientShortcuts,
    addAnalysisShortcuts,
    showHelpModal,
    setShowHelpModal,
    showGlobalSearch,
    setShowGlobalSearch,
    isMac
  };
}; 