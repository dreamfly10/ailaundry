interface User {
  id: string;
  email: string;
  password?: string; // hashed
  name?: string;
  image?: string;
  createdAt: Date;
}

interface Session {
  userId: string;
  expires: Date;
}

// In-memory stores
const usersById: Map<string, User> = new Map();
const usersByEmail: Map<string, User> = new Map();
const sessions: Map<string, Session> = new Map();

export const db = {
  user: {
    async create(data: Omit<User, 'id' | 'createdAt'>) {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const user: User = {
        ...data,
        id,
        createdAt: new Date(),
      };
      usersById.set(id, user);
      usersByEmail.set(data.email, user);
      return user;
    },
    async findByEmail(email: string) {
      return usersByEmail.get(email) || null;
    },
    async findById(id: string) {
      return usersById.get(id) || null;
    },
    async update(id: string, data: Partial<User>) {
      const user = usersById.get(id);
      if (!user) return null;
      const updated = { ...user, ...data };
      usersById.set(id, updated);
      if (updated.email) usersByEmail.set(updated.email, updated);
      // Update email mapping if email changed
      if (data.email && data.email !== user.email) {
        usersByEmail.delete(user.email);
        usersByEmail.set(data.email, updated);
      }
      return updated;
    },
  },
  session: {
    async create(data: Session) {
      sessions.set(data.userId, data);
      return data;
    },
    async findByUserId(userId: string) {
      return sessions.get(userId) || null;
    },
    async delete(userId: string) {
      sessions.delete(userId);
    },
  },
};

