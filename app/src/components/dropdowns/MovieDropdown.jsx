import { Stack, } from '@mui/material';

import { Link } from 'react-router-dom';

function MovieDropdown({ movies }) {
  return (
    <Stack
      className='movie-search-dropdown'
      justifyContent='flex-start'
      alignItems='flex-start'
      padding={0}
    >
      {movies?.length !== 0 ? (
        movies?.map((movie) => {
        
          return (
            <Link
              key={movie._id}
              to={`/evoucher/cinema-ticket/movie/${movie?._id}`}
              className='dropdown-item'
            >
              {movie.details?.movie}
            </Link>
          );
        })
      ) : (
        <p
          style={{
            padding: '8px',
          }}
        >
          No Movie match your search
        </p>
      )}
    </Stack>
  );
}

export default MovieDropdown;
