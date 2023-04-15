import React from 'react';
import Navbar from '../Navbar/Navbar';
import SearchForm from '../SearchForm/SearchForm';
import './Header.css';


const Header = () => {
  return (
    <div className='holder'>
      <header className='header'>
        <Navbar/>
        <div className='header-content flex flex-c text-center text-white'>
          <h2 className='header-title text-capitalize'>Find your book of choice.</h2><br/>
          <p className='header-text fs-18 fw-3'>Welcome to Library, your online source for books and knowledge. Explore our extensive collection of books in various genres and discover new perspectives. Join us today and expand your horizons!</p>
          <SearchForm />
        </div>
      </header>
      
    </div>
  )
}

export default Header
