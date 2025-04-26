import { supabase } from '../utils/supabaseClient.js';

export async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.error('Missing authorization token');
      return res.status(401).json({ error: 'Missing token' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Token validation error:', error.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (!user) {
      console.error('No user found for token');
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}