import * as React from 'react';
const Cinema = (props) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' {...props}>
    <path fill='#3F51B5' d='M43 39V24h-4v15c0 5 4 9 9 9v-4c-2.8 0-5-2.2-5-5z' />
    <path fill='#90A4AE' d='M24 5a19 19 0 1 0 0 38 19 19 0 1 0 0-38Z' />
    <path fill='#37474F' d='M24 22a2 2 0 1 0 0 4 2 2 0 1 0 0-4Z' />
    <path
      fill='#253278'
      d='M24 9a5 5 0 1 0 0 10 5 5 0 1 0 0-10zm0 20a5 5 0 1 0 0 10 5 5 0 1 0 0-10zm10-10a5 5 0 1 0 0 10 5 5 0 1 0 0-10zm-20 0a5 5 0 1 0 0 10 5 5 0 1 0 0-10z'
    />
  </svg>
);
export default Cinema;
