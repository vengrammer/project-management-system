import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { setContext } from "@apollo/client/link/context";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";


//import for the websocket
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";


const httpLink = new HttpLink({
  uri: "/graphql",
});

import { store, persistor } from "./middleware/store";


const authLink = setContext((_, { headers }) => {
  const state = store.getState();
  const token = state?.auth?.token;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

//websocket
const host = location.pathname

const wsLink = new GraphQLWsLink(
  createClient({
    url: `wss://${host}:4000/graphql`,
    connectionParams: () => {
      const state = store.getState();
      const token = state?.auth?.token;

      return {
        authorization: token ? `Bearer ${token}` : "",
      };
    },
  }),
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);

    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink, // subscriptions → websocket
  authLink.concat(httpLink), // queries & mutations → http
);


const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </PersistGate>
  </Provider>,
);
