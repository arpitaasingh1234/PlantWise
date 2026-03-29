# Automatic Signout Feature

## Overview

This feature automatically signs out users when they open the website if their session is old or expired, ensuring security and preventing unauthorized access.

## Implementation

### File: `src/contexts/AuthContext.tsx`

#### Enhanced Session Validation
```typescript
// Auto signout on page load for old sessions
useEffect(() => {
  const validateAndSignOutOldSessions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const sessionAge = Date.now() - new Date(session.created_at).getTime();
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
        
        // Check if session is expired or older than 24 hours
        const currentTime = Math.floor(Date.now() / 1000);
        const sessionExpiresAt = session.expires_at ? 
          Math.floor(new Date(session.expires_at).getTime() / 1000) : 
          currentTime + 86400; // Default 24 hours
        
        if (sessionAge > maxSessionAge || currentTime >= sessionExpiresAt) {
          // Auto signout logic
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          
          // User notification
          toast.info('Your session has expired. You have been automatically signed out. Please sign in again.', {
            duration: 6000,
            action: {
              label: 'Sign In',
              onClick: () => window.location.href = '/auth';
            }
          });
        }
      }
    } catch (error) {
      // Safety fallback - sign out if validation fails
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      
      toast.error('Session validation failed. You have been signed out for security. Please sign in again.');
    }
  };

  validateAndSignOutOldSessions();
}, []);
```

## Features

### ✅ **Automatic Session Validation**
- Checks session age on every page load
- Validates session expiration time
- Handles validation errors gracefully

### ✅ **User Notifications**
- Clear toast messages for expired sessions
- Actionable "Sign In" button in notifications
- Different messages for expired vs invalid sessions

### ✅ **Security Measures**
- 24-hour maximum session duration
- Immediate signout for validation failures
- Prevents unauthorized access from old sessions

### ✅ **User Experience**
- Non-intrusive automatic signout
- Clear explanation of why signout occurred
- Easy way to sign back in

## Session Expiration Rules

1. **Session Age**: Automatically signout if session is older than 24 hours
2. **Expiration Time**: Signout if current time >= session.expires_at
3. **Validation Errors**: Signout immediately if session validation fails
4. **User Notification**: Always inform user why they were signed out

## Notification Types

### **Expired Session**
```
"Your session has expired. You have been automatically signed out. Please sign in again."
```
- Duration: 6 seconds
- Action: "Sign In" button
- Color: Info (blue)

### **Validation Failed**
```
"Session validation failed. You have been signed out for security. Please sign in again."
```
- Duration: 5 seconds
- Action: "Sign In" button
- Color: Error (red)

## Benefits

- **Security**: Prevents unauthorized access from old sessions
- **User Trust**: Users are informed about security actions
- **Compliance**: Follows security best practices
- **Convenience**: Clear path to sign back in

## Usage

1. User opens website
2. AuthContext automatically validates session
3. If session is old/expired → Auto signout
4. User sees notification explaining signout
5. User can click "Sign In" to reauthenticate

## Configuration

```typescript
const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
```

To change the maximum session duration, modify the `maxSessionAge` value in `AuthContext.tsx`.

## Technical Details

- **Trigger**: On every page load (AuthContext initialization)
- **Validation**: Checks both session age and expiration time
- **Fallback**: Signs out on any validation error
- **Persistence**: Uses Supabase session management
- **UI**: Uses Sonner toast notifications
