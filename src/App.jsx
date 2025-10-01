import React, { useEffect, useState } from 'react'
import Search from './components/search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce} from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite';

const API_BASE_URL = 'https://api.themoviedb.org/3'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);

  // debounce the search term to prevent making too many API requests
  //  by waiting for the user to stop typing for 500ms
  useDebounce(()=>setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query='')=>{

    setIsLoading(true);
    setErrorMessage('');


    try{
        const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` //
        :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

        const response = await fetch(endpoint, API_OPTIONS);

        if(!response.ok){ // no response then throw an error
          throw new Error('Failed to fetch movies');
        }

        const data = await response.json() // get data (movies in pages)

        if(data.Response === 'False'){ // no movies then show the error message
          setErrorMessage(data.Error || 'Failed to fetch movies')
          setMovieList([])
          return;
        }

        setMovieList(data.results || []) // got response then update movie list array

        // update the search count
        if(query && data.results.length>0){
          await updateSearchCount(query, data.results[0])
        }

    }catch(error){
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.')
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async ()=>{
    try{
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    }catch(error){
      console.error(error)
    }

  }

  useEffect(()=>{
    fetchMovies(debouncedSearchTerm);
  },[debouncedSearchTerm]); // recalling the fetch movies with updated search term

  useEffect(()=>{
    loadTrendingMovies();
  },[])

  return (
    <main>
      {/* bg image is at css under theme */}
      <div className='pattern'/>

      <div className="wrapper">
        {/* header section */}
        <header>
          <img src="./hero.png" alt="hero-banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        </header>

        {/* trending movies section */}
        {trendingMovies.length>0 &&(
          <section className='trending'>
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie,index) => (
                <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* all movies section */}
        <section className='all-movies'>
          <h2>All Movies</h2>


          {isLoading ? (
            <p className='text-white'>Loading...</p>

          ) : errorMessage ? (
            <Spinner/>
          ) : (
              <ul>
                {movieList.map((movie)=>(
                  <MovieCard key={movie.id} movie={movie} />
                ))}
                {/* if {} then need return */}
              </ul>
          )}
        </section>

      </div>
    </main>
  )
}

export default App