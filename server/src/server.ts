import express from 'express';
import path from 'path';
import db from './config/connection.js';
// import routes from './routes/index.js';
import { fileURLToPath } from 'url';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schemas/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
    app.use('/graphql', expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.authorization || '' }),
    }));
      app.use(express.static(path.join(__dirname, '../../client/dist')));
      
      app.get('*', (_req, res) => {
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
      });
    }
    
    // app.use(routes);
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    
    app.listen(PORT, () => {
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  

startApolloServer();