import User from '../models/User.js'
import { signToken, authenticateGraphQL } from '../services/auth.js'


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



const resolvers = {
  Query: {
    me: async (_: any, { token }: { token: string }) => {
      const userData = authenticateGraphQL(token);
      if (!userData) throw new Error('Not authenticated');
      return await User.findById(userData._id);
    },
  },
  Mutation: {
    createUser: async (_: any, { username, email, password }: User) => {
      const user = await User.create({ username, email, password });
      const token = signToken(username, email, String(user._id));
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
      const token = signToken(user.username, user.email, String(user._id));
      return { token, user };
    },
    saveBook: async (_: any, { token, bookId, title, authors, description }: { token: string } & Book) => {
      const userData = authenticateGraphQL(token);
      if (!userData) throw new Error('Not authenticated');
      return await User.findOneAndUpdate(
        { _id: userData._id },
        { $addToSet: { savedBooks: { bookId, title, authors, description } } },
        { new: true }
      );
    },
    deleteBook: async (_: any, { token, bookId }: { token: string, bookId: string }) => {
      const userData = authenticateGraphQL(token);
      if (!userData) throw new Error('Not authenticated');
      return await User.findOneAndUpdate(
        { _id: userData._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
    },
  },
};



export default resolvers;
