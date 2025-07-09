/**
 * Centralized Debug Logger for Medical Charting App
 * Helps track initialization and runtime issues
 */

export interface DebugEvent {
  timestamp: string;
  component: string;
  event: string;
  data?: any;
  level: 'info' | 'warn' | 'error' | 'debug';
}

class DebugLogger {
  private events: DebugEvent[] = [];
  private maxEvents = 100; // Keep only last 100 events

  log(component: string, event: string, data?: any, level: 'info' | 'warn' | 'error' | 'debug' = 'info') {
    const debugEvent: DebugEvent = {
      timestamp: new Date().toISOString(),
      component,
      event,
      data,
      level
    };

    this.events.push(debugEvent);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Console output with emoji prefix
    const prefix = this.getLevelPrefix(level);
    const message = `${prefix} [${component}] ${event}`;
    
    if (data) {
      console[level](message, data);
    } else {
      console[level](message);
    }

    // Store in sessionStorage for debugging
    try {
      sessionStorage.setItem('debug_events', JSON.stringify(this.events));
    } catch (e) {
      // Ignore storage errors
    }
  }

  private getLevelPrefix(level: string): string {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      case 'debug': return '🔧';
      default: return '📝';
    }
  }

  getEvents(): DebugEvent[] {
    return [...this.events];
  }

  getEventsByComponent(component: string): DebugEvent[] {
    return this.events.filter(e => e.component === component);
  }

  getEventsSince(timestamp: string): DebugEvent[] {
    return this.events.filter(e => e.timestamp >= timestamp);
  }

  clear() {
    this.events = [];
    try {
      sessionStorage.removeItem('debug_events');
    } catch (e) {
      // Ignore storage errors
    }
  }

  // Load events from previous session
  loadStoredEvents() {
    try {
      const stored = sessionStorage.getItem('debug_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Export events for debugging
  export(): string {
    return JSON.stringify(this.events, null, 2);
  }

  // Show initialization summary
  showInitSummary() {
    console.group('🚀 App Initialization Summary');
    
    const initEvents = this.events.filter(e => 
      e.event.includes('initializ') || e.event.includes('start') || e.event.includes('config')
    );
    
    initEvents.forEach(event => {
      const prefix = this.getLevelPrefix(event.level);
      console.log(`${prefix} [${event.component}] ${event.event}`);
      if (event.data) {
        console.log('   Data:', event.data);
      }
    });
    
    console.groupEnd();
  }

  // Show error summary
  showErrors() {
    const errors = this.events.filter(e => e.level === 'error');
    if (errors.length > 0) {
      console.group('❌ Error Summary');
      errors.forEach(error => {
        console.error(`[${error.component}] ${error.event}`, error.data);
      });
      console.groupEnd();
    }
  }

  // Monitor specific patterns
  monitorPattern(pattern: string, callback?: (event: DebugEvent) => void) {
    const matchingEvents = this.events.filter(e => 
      e.event.toLowerCase().includes(pattern.toLowerCase()) ||
      e.component.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (matchingEvents.length > 0) {
      console.group(`🔍 Events matching "${pattern}"`);
      matchingEvents.forEach(event => {
        const prefix = this.getLevelPrefix(event.level);
        console.log(`${prefix} [${event.component}] ${event.event}`, event.data);
        if (callback) callback(event);
      });
      console.groupEnd();
    }
  }
}

// Global debug logger instance
export const debugLogger = new DebugLogger();

// Load stored events on initialization
debugLogger.loadStoredEvents();

// Make it available globally for debugging
(window as any).debugLogger = debugLogger;

// Helper functions for common debug scenarios
export const logInit = (component: string, data?: any) => 
  debugLogger.log(component, 'Initializing', data, 'info');

export const logError = (component: string, error: any, context?: any) => 
  debugLogger.log(component, 'Error occurred', { error: error.message, context }, 'error');

export const logConfig = (component: string, config: any) => 
  debugLogger.log(component, 'Configuration loaded', config, 'debug');

export const logState = (component: string, state: any) => 
  debugLogger.log(component, 'State updated', state, 'debug');

// Auto-show summary after initial load
setTimeout(() => {
  debugLogger.showInitSummary();
  debugLogger.showErrors();
}, 5000); 