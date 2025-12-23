import { supabaseServer, isSupabaseConfigured } from './supabase';

export interface User {
  id: string;
  email: string;
  password?: string; // hashed
  name?: string;
  image?: string;
  userType: 'trial' | 'paid';
  tokensUsed: number;
  tokenLimit: number;
  subscriptionStatus?: 'active' | 'expired' | 'cancelled';
  subscriptionExpiresAt?: Date | string;
  paymentId?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

interface Session {
  userId: string;
  expires: Date;
}

// Database operations using Supabase
export const db = {
  user: {
    async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
      }

      const { data: user, error } = await supabaseServer
        .from('users')
        .insert({
          email: data.email,
          password: data.password,
          name: data.name,
          image: data.image,
          user_type: data.userType || 'trial',
          tokens_used: data.tokensUsed ?? 0,
          token_limit: data.tokenLimit ?? 1000, // 1k tokens for trial users
          subscription_status: data.subscriptionStatus,
          subscription_expires_at: data.subscriptionExpiresAt
            ? new Date(data.subscriptionExpiresAt).toISOString()
            : null,
          payment_id: data.paymentId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        // Provide more helpful error messages
        if (error.code === '42P01') {
          throw new Error('Database table "users" does not exist. Please run the SQL schema from supabase/schema.sql in your Supabase SQL Editor.');
        }
        if (error.message?.includes('JWT')) {
          throw new Error('Invalid Supabase API key. Please check your NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
        }
        throw error;
      }

      return this.mapUser(user);
    },

    async findByEmail(email: string): Promise<User | null> {
      if (!isSupabaseConfigured()) {
        return null; // Return null if not configured (for graceful degradation)
      }

      const { data, error } = await supabaseServer
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error finding user by email:', error);
        throw error;
      }

      return data ? this.mapUser(data) : null;
    },

    async findById(id: string): Promise<User | null> {
      const { data, error } = await supabaseServer
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error finding user by id:', error);
        throw error;
      }

      return data ? this.mapUser(data) : null;
    },

    async update(id: string, data: Partial<User>): Promise<User | null> {
      const updateData: any = {};

      if (data.email !== undefined) updateData.email = data.email;
      if (data.password !== undefined) updateData.password = data.password;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.image !== undefined) updateData.image = data.image;
      if (data.userType !== undefined) updateData.user_type = data.userType;
      if (data.tokensUsed !== undefined) updateData.tokens_used = data.tokensUsed;
      if (data.tokenLimit !== undefined) updateData.token_limit = data.tokenLimit;
      if (data.subscriptionStatus !== undefined)
        updateData.subscription_status = data.subscriptionStatus;
      if (data.subscriptionExpiresAt !== undefined)
        updateData.subscription_expires_at = data.subscriptionExpiresAt
          ? new Date(data.subscriptionExpiresAt).toISOString()
          : null;
      if (data.paymentId !== undefined) updateData.payment_id = data.paymentId;

      const { data: user, error } = await supabaseServer
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }

      return user ? this.mapUser(user) : null;
    },

    // Helper to map database row to User interface
    mapUser(row: any): User {
      return {
        id: row.id,
        email: row.email,
        password: row.password,
        name: row.name,
        image: row.image,
        userType: row.user_type,
        tokensUsed: row.tokens_used,
        tokenLimit: row.token_limit,
        subscriptionStatus: row.subscription_status,
        subscriptionExpiresAt: row.subscription_expires_at
          ? new Date(row.subscription_expires_at)
          : undefined,
        paymentId: row.payment_id,
        createdAt: row.created_at ? new Date(row.created_at) : new Date(),
        updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
      };
    },
  },

  session: {
    async create(data: Session) {
      // Sessions are handled by NextAuth, but we can store them if needed
      // For now, this is a placeholder
      return data;
    },

    async findByUserId(userId: string): Promise<Session | null> {
      // Sessions are handled by NextAuth
      return null;
    },

    async delete(userId: string) {
      // Sessions are handled by NextAuth
      return;
    },
  },

  article: {
    async create(data: {
      userId: string;
      title: string;
      originalContent: string;
      translatedContent: string;
      insights: string;
      inputType: 'url' | 'text';
      sourceUrl?: string;
      style?: string;
      tokensUsed: number;
    }) {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured');
      }

      const { data: article, error } = await supabaseServer
        .from('articles')
        .insert({
          user_id: data.userId,
          title: data.title,
          original_content: data.originalContent,
          translated_content: data.translatedContent,
          insights: data.insights,
          input_type: data.inputType,
          source_url: data.sourceUrl || null,
          style: data.style || null,
          tokens_used: data.tokensUsed,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating article:', error);
        throw error;
      }

      return this.mapArticle(article);
    },

    async findByUserId(userId: string, limit: number = 50) {
      if (!isSupabaseConfigured()) {
        return [];
      }

      const { data, error } = await supabaseServer
        .from('articles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        // Check if table doesn't exist
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('Articles table does not exist. Please run the database migration.');
          return []; // Return empty array instead of throwing
        }
        console.error('Error fetching articles:', error);
        throw error;
      }

      return data ? data.map(row => this.mapArticle(row)) : [];
    },

    async findById(id: string) {
      if (!isSupabaseConfigured()) {
        return null;
      }

      const { data, error } = await supabaseServer
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error finding article by id:', error);
        throw error;
      }

      return data ? this.mapArticle(data) : null;
    },

    async delete(id: string, userId: string) {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured');
      }

      const { error } = await supabaseServer
        .from('articles')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // Ensure user can only delete their own articles

      if (error) {
        console.error('Error deleting article:', error);
        throw error;
      }

      return true;
    },

    mapArticle(row: any) {
      return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        originalContent: row.original_content,
        translatedContent: row.translated_content,
        insights: row.insights,
        inputType: row.input_type,
        sourceUrl: row.source_url,
        style: row.style,
        tokensUsed: row.tokens_used,
        createdAt: row.created_at ? new Date(row.created_at) : new Date(),
        updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
      };
    },
  },
};
