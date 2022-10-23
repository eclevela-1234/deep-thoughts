const express = require("express");
const path = require("path");
// import Apollo Server
const { ApolloServer } = require("apollo-server-express");
const { authMiddleware } = require("./utils/auth");
//import our typeDefs and resolvers

const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");

const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Server up static assets 
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, '--/client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

// Create a new instance of an Apollo server with the graphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();

  //integrate our Apollo server with the Express application middleware
  server.applyMiddleware({ app });
  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      // log where to go to test our gql api
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

startApolloServer();
