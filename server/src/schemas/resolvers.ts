import User from '../models/User.js'
import { signToken } from '../services/auth.js'
import { AuthenticationError } from 'apollo-server-express';


const resolvers = {
  Query: {
    me: async (_parent, _args, context) => {
      if (!context.user) throw new AuthenticationError('Debes iniciar sesión');
      return User.findById(context.user.data._id);
    },
  },
  Mutation: {

    login: async (_parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Credenciales incorrectas');
      }
      const token = signToken(user);
      return { token, user };
    },
    addUser: async (_parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (_parent, { book }, context) => {
      if (!context.user) throw new AuthenticationError('Debes iniciar sesión');
      return User.findByIdAndUpdate(
        context.user.data._id,
        { $addToSet: { savedBooks: book } },
        { new: true }
      );
    },
    deleteBook: async (_parent, { bookId }, context) => {
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
