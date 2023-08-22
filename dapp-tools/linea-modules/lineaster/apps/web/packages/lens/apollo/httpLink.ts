import { HttpLink } from '@apollo/client';
import { API_URL } from 'data';

const httpLink = new HttpLink({
  uri: API_URL,
  fetchOptions: 'no-cors',
  fetch
});

export default httpLink;
