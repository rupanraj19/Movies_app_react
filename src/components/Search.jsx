import React from 'react'

const Search = ({searchTerm, setSearchTerm}) => { // props to get the string from the user using usestate searchTerm
  return (
    <div className='search'>
        <div>
            <img src="./search.svg" alt="search" />

            <input type="text" placeholder='Search through thousands of movies'
            value={searchTerm}
            onChange={(e)=> setSearchTerm(e.target.value)}
            />
        </div>
    </div>
  )
}

export default Search