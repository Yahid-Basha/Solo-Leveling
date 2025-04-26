# Authentication Implementation Guide

## Current Mock Auth
The application uses a simple mock authentication system with local storage. This needs to be replaced with Supabase Authentication.

## Supabase Auth Implementation

### 1. Auth Context Update
```typescript
// src/context/AuthContext.tsx

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const AuthProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }));
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    return data;
  };

  const signup = async (email: string, password: string, username: string) => {
    setState(prev => ({ ...prev, loading: true }));
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          score: 0,
          retryChances: 3
        }
      }
    });

    if (error) throw error;
    
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user: state.user,
      session: state.session,
      loading: state.loading,
      login,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Protected Routes
```typescript
const ProtectedRoute: React.FC = ({ children }) => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return session ? children : null;
};
```

### 3. Auth Middleware
```typescript
// src/lib/supabase.ts

export const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Add auth header to all requests
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session?.access_token) {
    supabaseClient.realtime.setAuth(session.access_token);
  }
});
```

### 4. Password Reset Flow
```typescript
// Request reset
const requestReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  
  if (error) throw error;
};

// Update password
const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) throw error;
};
```

### 5. Social Authentication (Optional)
```typescript
const signInWithProvider = async (provider: Provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) throw error;
  return data;
};
```

### 6. Session Management
```typescript
// Check session status
const checkSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    await supabase.auth.signOut();
    throw error;
  }
  
  return session;
};

// Refresh session
const refreshSession = async () => {
  const { data: { session }, error } = await supabase.auth.refreshSession();
  
  if (error) {
    await supabase.auth.signOut();
    throw error;
  }
  
  return session;
};
```

### 7. User Profile Management
```typescript
const updateProfile = async (updates: {
  username?: string;
  avatar_url?: string;
}) => {
  const { data: { user }, error } = await supabase.auth.updateUser({
    data: updates
  });

  if (error) throw error;
  return user;
};
```

### 8. Security Considerations
- Implement rate limiting for auth attempts
- Add CAPTCHA for signup/login
- Enforce password strength requirements
- Set up proper CORS configuration
- Enable MFA when needed
- Monitor auth logs for suspicious activity
- Implement proper session timeout handling