import User from '../models/User.js'
import { signToken} from '../services/auth.js'


interface User {
    username: string;
    password: string;
    email: string;
}

interface Login {
    email: string;
    password: string;
}

interface Book {
    bookId: string;
    title?: string;
    authors?: string[];
    description?: string;
} 

interface Context {
    user: {_id: string} | null; 
}

const resolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      return await User.findById(context.user._id);
    },
  },
  Mutation: {
    createUser: async (_: any, { username, email, password }: User) => {
      const user = await User.create({ username, email, password });
      const token = signToken(username, email, user._id);
      return { token, user };
    },
    login: async (_: any, { email, password }: Login) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('No user with this email');
      }
      const isPasswordValid = await user.isCorrectPassword(password);
      if (!isPasswordValid) {
        throw new Error('Incorrect password');
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    saveBook: async (_: any, { bookId, title, authors, description }: Book, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      return await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: { bookId, title, authors, description } } },
        { new: true }
      );
    },
    deleteBook: async (_: any, { bookId }: Book, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      return await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
    },
  },
};



export default resolvers;
