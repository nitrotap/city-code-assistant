import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

//apollo
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

//CSS
import './components/CSS/App.css';

//routes
import Login from './pages/Login';
import Signup from './pages/Signup';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage';

const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default function App() {

  return (
    <ApolloProvider client={client}>
      <Box sx={{ marginTop: '30px', marginBottom: '60px' }}>
        <Router>
          <Box sx={{ display: 'flex', }}>
            <CssBaseline />

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="signup" element={<Signup />} />
              <Route path="login" element={<Login />} />
            </Routes>
          </Box>
        </Router >
      </Box>
    </ApolloProvider >
  );
};