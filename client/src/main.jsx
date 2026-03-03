import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { setContext } from "@apollo/client/link/context";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
// store and persistor will be imported below for auth link

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
});

// ✅ Add auth link (pull token from redux-persisted store rather than
// reading a separate key – the persisted auth slice is stored under
// `persist:auth`).  We import the store directly so we always have the
// latest value when a request is made.
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

const client = new ApolloClient({
  link: authLink.concat(httpLink), // ✅ attach token automatically
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
