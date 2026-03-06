import { useEffect, useState } from "react"
import {URLBTS} from "../../component/tools.js"
import "./Besoins.css"
        fetch(`${URLBTS}`)
let url = URLBTS+"/besoins";
export function Besoins(){
    let [besoins , setBesoins] = useState([]);
    let [isLoading,setIsLoading] = useState(false);
    let [error,setError] = useState("")
    
    let [formAddVisible,setFormAddVisible] = useState(false);
    let [formEditVisible,setFormEditVisible] = useState(false);
    let [formDeleteVisible,setFormDeleteVisible] = useState(false);

    let [besoin ,setBesoin] = useState(null);

    function getAllServices(){
        // setIsLoading(true)
        fetch(url)
        .then(res=>{
            if(!res.ok){
                throw new Error("Erreur lors de la requete avec le status " + res.status)
            }
            return res.json();
        }).then(res=>{
            console.log(" donnees recue " + res)
            setBesoins(res);
            // setIsLoading(false);
        }).catch(error=>{
            if (error.name !== 'AbortError') {
                setError("Erreur " +  error );
                console.log("Error" + error);
                // setIsLoading(false);
            }
        })
    }

    useEffect(()=>{
        getAllServices();
    },[])
    return <div className=" container">
        <div className='top'>
            <h1>Services</h1>

                <div className='actions'>
                    <button onClick={() => setFormAddVisible(true)}>+</button>
                    <button>+</button>
                </div>
            </div>
        <div className="options">
            {/* <select>
                <option value={"all"}>All</option>
            </select> */}
            <button>Besoins ({besoins.length})</button>
        </div>
        <div className="list">
            { !(besoins.length == 0) ? besoins.map((item,index)=>{
                    return <div key={index} className='item' onClick={
                        ()=>{
                            setBesoin(item)
                            setFormEditVisible(true);

                        }
                    }>
                                <div className='top'>
                                    <div className="info">
                                        <span>{item.name}</span>
                                    </div>
                              
                                    
                                </div>
                                <div content="contenu">
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        }) : <div style={{textAlign:"center"}}>No messages found.</div>}
        </div>
        
        {formAddVisible && <FormAdd setVisible = {setFormAddVisible} action={add}/>}
        {formEditVisible && <FormEdit setVisible = {setFormEditVisible}  action={{update,remove}} editItem={besoin}/>}
        {formDeleteVisible && <DeleteProspect setVisible = {setFormDeleteVisible} action={remove}  itemAction={besoin}/>}
    
    </div>


    
    function add(item) {
        //fonction qui permet d'ajouter une service dans la base de donnees
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        }).then(res=>{
            if(!res.ok){
                throw new Error(`Serveur : ${res.status}`)
            }
            return res.json();
        }).then(data=>{
            console.log("Service ajouter ajouté :", data);
            // Optionnel : mettre à jour la liste des prospects après l'ajout
            setBesoins(prev => [...prev, data]);
            setFormAddVisible(false);

        }).catch(error=>{
            if(error.name !== "AbortError"){
                console.error("Erreur lors de l'ajout du prospect :", error.message);
            }

        })

    }

     function update(item,id) {
        //cette fonctione de modifier un service
        //item ici represente le service que je souhaire modifier 
        fetch(`${url}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        }).then(res=>{
            if(!res.ok){
                throw new Error(`Serveur : ${res.status}`)
            }
            return res.json();
        }).then(data=>{
            console.log("Service modifier modifier :", data);
            // Optionnel : mettre à jour la liste des prospects après l'ajout
            // setProspects(prev =z> [...prev, data]);
            let index = besoins.findIndex(item => item.id === id);
            if (index !== -1) {
                setBesoins(prev => {
                    const updatedProspects = [...prev];
                    updatedProspects[index] = data;
                    return updatedProspects;
                });
            }
            setFormEditVisible(false);
        }).catch(error=>{
            if(error.name !== "AbortError"){
                console.error("Erreur lors de l'ajout du prospect :", error.message);
            }
        })
    }

    function remove(id) {
        //cette fonctione permet de supprimer un service de la base de donnees
        //item ici represente le service que je souhaire modifier 
        fetch(`${url}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res=>{
            if(!res.ok){
                throw new Error(`Serveur : ${res.status}`)
            }
            // return res.json();
             console.log("Service modifier modifier :", res.status);
            // Optionnel : mettre à jour la liste des prospects après l'ajout
                setBesoins(prev => {
                   return prev.filter(item=>item.id !== id)
                });
        })
        // .then(data=>{
        //     console.log("Service modifier modifier :", data);
        //     // Optionnel : mettre à jour la liste des prospects après l'ajout
        //         setServices(prev => {
        //            return prev.filter(item=>item.id !== id)
        //         });

        // })
        .catch(error=>{
            if(error.name !== "AbortError"){
                console.error("Erreur lors de l'ajout du prospect :", error.message);
            }
        })
    }
    
}

function FormAdd({setVisible,action}){
    let [besoin,setBesoin] = useState({name:"",description:"",prospect_id:0,serviceIds:[]});

    const [prospects, setProspects] = useState([]);
    const [services, setServices] = useState([]);

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
            // setIsLoading(true);
          })
          .catch(err => {
            if (err.naprospectme !== 'AbortError') {
              console.error("Erreur détectée :", err.message);
            //   setError(err.message);
            //   setIsLoading(true);
            }
          });

          fetch(`${URLBTS}/services`)
        .then(res => {
            if (!res.ok) throw new Error(`Serveur : ${res.status}`);
            return res.json();
          })
          .then(data => {
            setServices(data);
            // setIsLoading(true);
          })
          .catch(err => {
            if (err.naprospectme !== 'AbortError') {
              console.error("Erreur détectée :", err.message);
            //   setError(err.message);
            //   setIsLoading(true);
            }
          });


    return () => controller.abort(); // Nettoyage
  
    },[])
    return (
        <div className=' pop_up_1'>
            <div className='form'>
                <h2>Ajouter un service</h2>

                <form className=''>
                
                    <label htmlFor="">Prospect</label>
                    <select onChange={(e)=>{
                        setBesoin(prev=>{return {...prev,prospect_id:e.target.value}})
                    }} >
                        <option> selectionner un prospect </option>
                        { prospects.length == 0 ? <h1>not found</h1> :
                            prospects.map((item,index)=>{
                               return <option value={item.id} key={index}> {item.name}</option>;
                            })
                         }
                        
                    </select>

                    <label htmlFor="">Besoins</label>
                    <select onChange={(e)=>{
                        if(!besoin.serviceIds.includes(e.target.value)){
                            setBesoin(prev=>{return {...prev,serviceIds:[...besoin.serviceIds,e.target.value]}})
                        }
                    }} >
                        <option> selectionner le services </option>
                        { services.length == 0 ? <h1>not found</h1> :
                            services.map((item,index)=>{
                               return <option value={item.id} key={index}> {item.name}</option>;
                            })
                         }
                        
                    </select> 

                    <label htmlFor="">Name</label>
                    <input type="text" value={besoin.name} onChange={(e)=>{
                        setBesoin(prev=>{return {...prev,name:e.target.value}})
                    }}  />

                    <label htmlFor="">Description</label>
                    <input type="email" value={besoin.description} onChange={(e)=>{
                        setBesoin(prev=>{return {...prev,description:e.target.value}})
                    }}  />
                    
                   

                <div className='actions'>
                        <button
                            onClick={(e)=>{
                                e.preventDefault()
                                console.log(besoin);
                                action(besoin);
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

function FormEdit({setVisible,editItem,action}){
   let [service,setService] = useState(editItem);
   let [edit , setEdit] = useState(false);
   console.log("editItem***********************************");
   console.log(editItem);
    let [formDeleteVisible,setFormDeleteVisible] = useState(false);

    return (
        <div className=' pop_up_1'>
            <div className="containerq">
                <div className="definirAction" ><span>see more</span><div> <span className="boule">.</span></div><span>edit</span></div>
                <div className='form'>
                <h2>Modifer un service</h2>

                <form className=''>
                    <label htmlFor="">Name</label>
                    <input type="text" value={service.name} onChange={(e)=>{
                        setService(prev=>{return {...prev,name:e.target.value}})
                    }}  />

                    <label htmlFor="">Description</label>
                    <input type="email" value={service.description} onChange={(e)=>{
                        setService(prev=>{return {...prev,description:e.target.value}})
                    }}  />
                    
                   

                <div className='actions'>
                        <button
                            onClick={(e)=>{
                                e.preventDefault()
                                console.log(service);
                                action.update(service,service.id);
                            }}
                        >Save</button>
                        <button onClick={(e) => {
                            e.preventDefault();
                            setVisible(false)}
                            
                            }>Cancel</button>
                        </div>
                    </form>
                </div>


                {/*  */}
                <div className="actions float">
                    <button onClick={()=>{
                        setVisible(false)
                    }}>exit</button>
                    <button onClick={()=>{
                        setFormDeleteVisible(true)
                    }}>Delete</button>

                   
                </div>

                {formDeleteVisible && <FormDelete setVisible={setFormDeleteVisible}
                    itemAction={editItem} 
                    action={action.remove}
                    setVisibleParent = {setVisible}
                    />}

            </div>
            
            
        </div>
    )
    
}

function FormDelete({setVisible,itemAction,action,setVisibleParent}){
    console.log("dnas le compesont de suppression : ********************************")
    console.log(itemAction)
    return (
        <div className=' pop_up_1'>
            <div className='form'>
                <h2>Voulez vous vraiment supprimer les prospects : {itemAction.name}</h2>

                <form className=''>
                   

                <div className='actions'>
                        <button
                        className='red'
                            onClick={(e)=>{
                                e.preventDefault()
                                console.log("click");
                                action(itemAction.id);
                                setVisible(false)
                                setVisibleParent(false)
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

