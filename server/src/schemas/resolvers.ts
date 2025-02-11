import User from '../models/User.js';
import { signToken } from '../services/auth.js';
import { AuthenticationError } from 'apollo-server-express';

interface Context {
  user?: {
    data: {
      _id: string;
    };
  };
}

interface Book {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image: string;
  link: string;
}

const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) throw new AuthenticationError('Debes iniciar sesión');
      return await User.findById(context.user.data._id);
    },
  },
  Mutation: {
    login: async (_parent: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Credenciales incorrectas');
      }
      const token = signToken(user.username as string, user.email as string, user._id as string);
      return { token, user };
    },

    addUser: async (_parent: any, { username, email, password }: { username: string; email: string; password: string }) => {
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) throw new Error('El usuario ya existe');
      
      const user = await User.create({ username, email, password });
      const token = signToken(user.username as string, user.email as string, user._id as string);
      return { token, user };
    },

    saveBook: async (_parent: any, { book }: { book: Book }, context: Context) => {
      if (!context.user) throw new AuthenticationError('Debes iniciar sesión');
      return User.findByIdAndUpdate(
        context.user.data._id,
        { $addToSet: { savedBooks: book } },
        { new: true }
      );
    },

    removeBook: async (_parent: any, { bookId }: { bookId: string }, context: Context) => {
      if (!context.user) throw new AuthenticationError('Debes iniciar sesión');
      return User.findByIdAndUpdate(
        context.user.data._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
    },
  },
};

export default resolvers;
