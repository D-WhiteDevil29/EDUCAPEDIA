import React from 'react';
import Header from '../../components/Header/Header';
import {Outlet} from 'react-router-dom' ;

const home = () => {
  return (
    <main>
      <Header/>
      <Outlet/>
    </main>
  )
}

export default home;
