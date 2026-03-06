// import { useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import {URL} from "./component/tools.js"
import { Prospect } from './pages/Prospect/Prospect.jsx';
import { useEffect , useState} from 'react';


function App() {
  const [prospects, setProspects] = useState([]);
  const [error, setError] = useState(null);
  // console.log("aaa")
  // useEffect(() => {

  //   // console.log("_________________________________")
  //   // console.log("_________________________________")

  //   //     fetch("http://localhost:8080/api/prospects").
  //   //     then(res=>{
  //   //         console.log(res);
  //   //         if(!res.ok){
  //   //           throw new Error(`Serveur a répondu avec le statut ${res.status}`);
  //   //         }
  //   //         return res.json()
  //   //       })
  //   //     .then(res=>{
  //   //         setProspects(res);
  //   //         console.log(res)

  //   //     })
  //   //     .catch(error=>{
  //   //         console.log("error : " + error);
  //   //     })
  //   // console.log("_________________________________")
  //   // console.log("_________________________________")

  //   // let url = "http://localhost:8080/api/prospects";

  //   // fetch(url)
  //   // .thuseEffect(() => {

  //   // console.log("_________________________________")
  //   // console.log("_________________________________")

  //   //     fetch("http://localhost:8080/api/prospects").
  //   //     then(res=>{
  //   //         console.log(res);
  //   //         if(!res.ok){
  //   //           throw new Error(`Serveur a répondu avec le statut ${res.status}`);
  //   //         }
  //   //         return res.json()
  //   //       })
  //   //     .then(res=>{
  //   //         setProspects(res);
  //   //         console.log(res)

  //   //     })
  //   //     .catch(error=>{
  //   //         console.log("error : " + error);
  //   //     })
  //   // console.log("_________________________________")
  //   // console.log("_________________________________")

  //   // leten(res=>{
  //   // console.log("******************************")

  //   //   console.log("la reponse est : " + res.ok);
  //   //   return res.json();
  //   // }).then(res=>{
  //   //   console.log("la reponse obtenu du serveur est : " + JSON.stringify([...res]))
  //   // })

  // //   fetch(url)
  // // .then(res => {
  // //   if (!res.ok) {
  // //     // Si le serveur répond 500 ou 404, on va ici
  // //     throw new Error(`Erreur HTTP! Statut: ${res.status}`);
  // //   }
  // //   console.log("la requete a reussi")
  // //   let response = res.json();
  // //   console.log(response)
  // //   return response;
  // // }).then(res=>{
  // //   console.log("******************************")
  // //   console.log("Données reçues :", res);
  // // })
  // // .catch(error => {
  // //   console.error("Le diagnostic réel :", error);
  // // });



  //   // const controller = new AbortController(); // Bonne pratique : annulation

  //   // fetch("http://localhost:8080/api/prospects", {
  //   //   method: "GET",
  //   //   signal: controller.signal 
  //   // })
  //   //   .then(res => {
  //   //     if (!res.ok) throw new Error(`Serveur : ${res.status}`);
  //   //     return res.json();
  //   //   })
  //   //   .then(data => {
  //   //     console.log("Données reçues :", data);
  //   //     setProspects(data);
  //   //   })
  //   //   .catch(err => {
  //   //     if (err.name !== 'AbortError') {
  //   //       console.error("Erreur détectée :", err.message);
  //   //       setError(err.message);
  //   //     }
  //   //   });

  //   return () => controller.abort(); // Nettoyage
  // }, []);

  if (error) return <div>Erreur de chargement : {error}</div>;

  return (
    <div className='view'>
      {/* Tu peux maintenant passer prospects à ton composant */}
      {/* <pre>{JSON.stringify(prospects, null, 2)}</pre> */}
       <Prospect/>

    </div>
  );
}
// function App() {
//   console.log("render app")
//   useEffect(()=>{
//         console.log("useEffect")

//     },[])
//   return <div className='view'>
//       <Prospect/>
//   </div>;
// }


export default App