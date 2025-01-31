import express from 'express';
import path from 'node:path';
import db from './config/connection.js';
// import routes from './routes/index.js';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schemas/index.js';

const app = express();
const PORT = process.env.PORT || 3001;


const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();
  
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
  
    app.use('/graphql', expressMiddleware(server));
    
    // if we're in production, serve client/build as static assets
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/dist')));
      
      app.get('*', (_req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));startApolloServer
      });
    }
    
    // app.use(routes);
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    
    app.listen(PORT, () => {
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  };

startApolloServer();