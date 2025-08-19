# Troubleshooting "Projects Disabled" Issue

## Problem
Worker users seeing "Projects Disabled" and "Add Task Disabled" messages with "database schema is being updated" text.

## Root Cause
This issue is typically caused by:
1. **Service Worker Cache**: PWA serving old cached content
2. **Browser Cache**: Outdated application cache
3. **IndexedDB**: Corrupted offline data
4. **Network Issues**: App falling back to cached version

## Solutions Implemented

### 1. Cache Clear Dialog
- **Location**: Available on all main pages (Projects, Dashboard, MyTasks)
- **Button**: "Reset App" button in page headers
- **Function**: Clears all caches, storage, and IndexedDB data

### 2. Sync Status Display
- **Shows**: Connection status, sync initialization, pending operations
- **Updates**: Every 10 seconds automatically
- **Helps**: Identify connectivity and sync issues

### 3. Manual Resolution Steps
1. Click "Reset App" button on any main page
2. Confirm cache clearing in dialog
3. Wait for automatic page reload
4. Re-login if necessary

### 4. Database Verification
- User assignments are working correctly in database
- Project access permissions are properly configured
- No schema migration issues detected

## Prevention
- Regular cache clearing in development
- Monitor sync status dashboard
- Check for PWA update prompts

## Technical Details
The fix includes:
- Service worker cache clearing
- localStorage/sessionStorage reset
- IndexedDB database deletion
- PWA manifest refresh
- Sync service status monitoring

## Files Modified
- `src/components/CacheClearDialog.tsx` - Cache clearing utility
- `src/components/SyncStatusDisplay.tsx` - Sync monitoring
- `src/pages/Projects.tsx` - Added reset functionality
- `src/pages/Dashboard.tsx` - Added reset functionality  
- `src/pages/MyTasks.tsx` - Added reset functionality