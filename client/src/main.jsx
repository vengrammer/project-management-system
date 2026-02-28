import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { setContext } from "@apollo/client/link/context";

import { Provider } from "react-redux";
import { store } from "./middleware/store";

const httpLink = new HttpLink({
  uri: "http://localhost:5000/graphql",
});

// ✅ Add auth link
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");

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
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </Provider>,
);
