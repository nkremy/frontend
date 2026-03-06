import  './Prospect.css';
import { useEffect, useState } from 'react';
import {URLBTS} from "../../component/tools.js"
import { Link } from 'react-router-dom';

export function Prospect(){
    let [formProspectVisivle,setFormProspectVisible] = useState(false);
    let [formProspectEditVisivle,setProspectEditVisible] = useState(false);
    let [formProspectDeleteVisivle,setProspectDeleteVisible] = useState(false);
    // let [formProspectVisivle,setFormProspectVisivle] = useState(false);
    const [prospect, setProspect] = useState(null);
    const [prospects, setProspects] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    console.log("render prospect")
     const controller = new AbortController(); 

    useEffect(()=>{
        console.log("useEffect prospect")
        fetch(`${URLBTS}/prospects`)
        .then(res => {
            if (!res.ok) throw new Error(`Serveur : ${res.status}`);
            return res.json();
          })
          .then(data => {
            setProspects(data);
            setIsLoading(true);
          })
          .catch(err => {
                    <label htmlFor="">Name</label>
            if (err.name !== 'AbortError') {
              console.error("Erreur détectée :", err.message);
              setError(err.message);
              setIsLoading(true);
            }
          });


    return () => controller.abort(); // Nettoyage
  
    },[])

    return (
        <div className={"container"}>
            <div className='top'>
            <h1>Prospect</h1>
                <div className='actions'>
                    <button onClick={() => setFormProspectVisible(true)}>+</button>
                    <button>+</button>
                </div>
            </div>
            <div className={"options"}>
                <button>Prospect (0)</button>
            </div>

            <div className="list">
                <div className='barreRecherche'>
                    <input type="text" placeholder='search...' />
                </div>
                {/* <div className="item"> */}
                { !isLoading ? <div>Loading...</div> : prospects.length > 0 ? prospects.map((item,index)=>{
                    return <div key={index} className='item'>
                            <div className='top'>
                            <Link to={`/prospects/${item.id}`} key={index} >
                                <span>name : {item.email}</span>
                            </Link>
                                <div className='actions'> 
                                <button
                                    onClick={()=>{
                                        setProspect(item)
                                        setProspectDeleteVisible(true);

                                    }}
                                >delete</button>
                                <button
                                    onClick={()=>{
                                        setProspect(item)
                                        setProspectEditVisible(true);

                                    }}
                                >update</button>
                            </div>
                        </div>
                    </div>
                }) : <div>No prospects found.</div>}
                    
                    {/* </div> */}

                </div>

                <div className="item">
                    
                </div>
               
            {/* </div> */}
            {formProspectVisivle && <FormProspect setVisible = {setFormProspectVisible} action={addProspect}/>}
            {formProspectEditVisivle && <FormEditProspect setVisible = {setProspectEditVisible}  action={updateProspect} editProspect={prospect}/>}
            {formProspectDeleteVisivle && <DeleteProspect setVisible = {setProspectDeleteVisible} action={deleteProspect}  deleteProspect={prospect}/>}
        
        
        </div>
    )
    function addProspect(prospect) {
        fetch(`${URLBTS}/prospects`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(prospect)
        }).then(res=>{
            if(!res.ok){
                throw new Error(`Serveur : ${res.status}`)
            }
            return res.json();
        }).then(data=>{
            console.log("Prospect ajouté :", data);
            // Optionnel : mettre à jour la liste des prospects après l'ajout
            setProspects(prev => [...prev, data]);
            setFormProspectVisible(false);

        }).catch(error=>{
            if(error.name !== "AbortError"){
                console.error("Erreur lors de l'ajout du prospect :", error.message);
            }

        })

    }

    function updateProspect(prospect,id) {
        fetch(`${URLBTS}/prospects/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(prospect)
        }).then(res=>{
            if(!res.ok){
                throw new Error(`Serveur : ${res.status}`)
            }
            return res.json();
        }).then(data=>{
            console.log("Prospect modifier :", data);
            // Optionnel : mettre à jour la liste des prospects après l'ajout
            // setProspects(prev => [...prev, data]);
            let index = prospects.findIndex(item => item.id === id);
            if (index !== -1) {
                setProspects(prev => {
                    const updatedProspects = [...prev];
                    updatedProspects[index] = data;
                    return updatedProspects;
                });
            }
            setProspectEditVisible(false);

        }).catch(error=>{
            if(error.name !== "AbortError"){
                console.error("Erreur lors de l'ajout du prospect :", error.message);
            }

        })


        
    }

    function deleteProspect(id) {
            fetch(`${URLBTS}/prospects/${id}`, {
                method: "DELETE"
            }).then(res=>{
                if(!res.ok){
                    throw new Error(`Serveur : ${res.status}`)
                }
                return res.json();
            }).then(data=>{
                console.log("Prospect supprimé :", data);
                // Optionnel : mettre à jour la liste des prospects après la suppression
                // setProspects(prev => [...prev, data]);
                setProspects(prev => prev.filter(item => item.id !== id));
                setProspectDeleteVisible(false);

            }).catch(error=>{
                if(error.name !== "AbortError"){
                    console.error("Erreur lors de l'ajout du prospect :", error.message);
                }

            })

        }
}

function FormProspect({setVisible,action}){
    let [prospect,setProspect] = useState({name:"",email:""});
    return (
        <div className=' pop_up_1'>
            <div className='form'>
                <h2>Prospect details</h2>

                <form className=''>
                    <label htmlFor="">Name</label>
                    <input type="text" value={prospect.name} onChange={(e)=>{
                        setProspect(prev=>{return {...prev,name:e.target.value}})
                    }}  />

                    <label htmlFor="">Email</label>
                    <input type="email" value={prospect.email} onChange={(e)=>{
                        setProspect(prev=>{return {...prev,email:e.target.value}})
                    }}  />
                    
                    <label htmlFor="">Phone</label>
                    <input type="text" />

                <div className='actions'>
                        <button
                            onClick={(e)=>{
                                e.preventDefault()
                                console.log("click");
                                console.log(prospect);
                                action(prospect);
                            }}
                        >Save</button>
                        <button onClick={(e) => {
                            e.preventDefault();
                            setVisible(false)}
                            
                            }>Cancel</button>
                </div>
                </form>
            </div>
            
        </div>
    )
}

function FormEditProspect({setVisible,editProspect,action}){
    let [prospect,setProspect] = useState(editProspect);
    return (
        <div className=' pop_up_1'>
            <div className='form'>
                <h2>Prospect details</h2>

                <form className=''>
                    <label htmlFor="">Name</label>
                    <input type="text" value={prospect.name} onChange={(e)=>{
                        setProspect(prev=>{return {...prev,name:e.target.value}})
                    }}  />

                    <label htmlFor="">Email</label>
                    <input type="email" value={prospect.email} onChange={(e)=>{
                        setProspect(prev=>{return {...prev,email:e.target.value}})
                    }}  />
                    
                    <label htmlFor="">Phone</label>
                    <input type="text" />

                <div className='actions'>
                        <button
                            onClick={(e)=>{
                                e.preventDefault()
                                console.log("click");
                                console.log(prospect);
                                action(prospect,editProspect.id);
                            }}
                        >Save</button>
                        <button onClick={(e) => {
                            e.preventDefault();
                            setVisible(false)}
                            
                            }>Cancel</button>
                </div>
                </form>
            </div>
            
        </div>
    )
}

function DeleteProspect({setVisible,deleteProspect,action}){
    return (
        <div className=' pop_up_1'>
            <div className='form'>
                <h2>Voulez vous vraiment supprimer les prospects : {deleteProspect.email}</h2>

                <form className=''>
                   

                <div className='actions'>
                        <button
                        className='red'
                            onClick={(e)=>{
                                e.preventDefault()
                                console.log("click");
                                action(deleteProspect.id);
                            }}
                        >Delete</button>
                        <button onClick={(e) => {
                            e.preventDefault();
                            setVisible(false)}
                            
                            }>Cancel</button>
                </div>
                </form>
            </div>
            
        </div>
    )
}

