// import { useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import {URL} from "./component/tools.js"
import { Prospect } from './pages/Prospect/Prospect.jsx';
import { useEffect , useState} from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PersonnalProspectPage } from './pages/PersonnalProspectPage/PersonnalProspectPage.jsx';
import { Services } from './pages/Services/Services.jsx';
import { Besoins } from './pages/Besoins/Besoins.jsx';

// let route = createBrowserRouter([
//   {
//     path:"/prospects",
//     element:<Prospect/>
//   }
// ]);
let route = createBrowserRouter([
  {
    path:"/prospects",
    element:<Prospect/>
  },{
    path:"/prospects/:id",
    element:<PersonnalProspectPage/>
  },{
    path:'/',
    element:<h1>Home</h1>
  },{
    path:"/services",
    element:<Services/>
  },{
    path:"/besoins",
    element:<Besoins/>
  }
])

function App() {



  return (
    <div className='view'>

       <RouterProvider router={route}/>

    </div>
  );
}



export default App