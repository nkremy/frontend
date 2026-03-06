import { useParams,Link } from "react-router-dom"
import { useEffect , useState} from 'react';
import "./PersonnalProspectPage.css"
import { Prospect } from "../Prospect/Prospect";


export function PersonnalProspectPage(){
    let id = useParams().id;
    let url = `http://localhost:8080/api/prospects/${id}`;
    let [prospect,setProspect] = useState(null);

    useEffect(()=>{
        fetch(url)
        .then(res=>{
            if(!res.ok){
                throw new Error(`Serveur a répondu avec le statut ${res.status}`);
              }
              return res.json()
        })
        .then(res=>{
            setProspect(res);
            console.log(res)

        })
        .catch(error=>{
            console.log("error : " + error);
        })
    },[])   
    return (
        <div className="container personnalProspectPage">
           {
            prospect == null ? 
            <div>Loading...</div> : 
            (<>
                <div>
                    <h1>Prospect Details</h1>
                    <p>Prospect ID: {prospect.id}</p>
                    <p>Prospect Name: {prospect.name}</p>
                </div>
                <div className="options ">
                    <button className="btn card">Message({prospect.messages.length})</button>
                    <button className="btn card">Analyse(0)</button>
                </div>

                <div className="list">
                <div className='barreRecherche'>
                    <input type="text" placeholder='search...' />
                </div>
                {/* <div className="item"> */}
                { !(prospect.messages.length == 0) ? prospect.messages.map((item,index)=>{
                    return <div key={index} className='item'>
                                <div className='top'>
                                    <div className="info">
                                        <span>{prospect.email}</span>
                                    </div>
                                {/* <Link to={`/prospects/${item.id}`} key={index} > */}
                                    {/* <span>{prospect.email}</span>
                                </Link> */}
                                    <div className="right">
                                        <span>{item.dateCreation}</span>
                                        <span>type : {item.type}</span>
                                    </div>
                                </div>
                                <div content="contenu">
                                    <p>{item.contenu}</p>
                                </div>
                            </div>
                        }) : <div>No messages found.</div>}
                    
                    {/* </div> */}

                </div>
            </>) 
           }
            <ViewMore prospect={prospect} item={{name:""}} action={()=>{}} setVisible={()=>{}}/>
        </div>
    )
}


function ViewMore({setVisible,item,action,prospect}){
//     console.log("item in view more : ");
//     console.log(prospect);
//    let [service,setService] = useState(item);
//    let [edit , setEdit] = useState(false);
//    let [sectionResponseVisible,setSectionResponseVisible] = useState(true);
//    console.log("editItem***********************************");
//    console.log(item);
//     let [formDeleteVisible,setFormDeleteVisible] = useState(false);
    return (
        <div className=' pop_up_1'>
            <div className="containerq">    
                <div className="up">
                    <p> id : {prospect.id}</p>
                    <p> contenu : {prospect.contenu}</p>
                    <p> type : {item.type}</p>
                    <p> gmail id : {item.gmailId}</p>
                </div>
                <div className="down">
                    <div className="options">
                        <button> response</button>
                        <button> Analyse</button>
                    </div>
                    <div className="subContainer">
                        
                    </div>
                </div>
            </div>
        </div>
    );
    return (
        <div className=' pop_up_1'>
            <div className="containerq">
                <div className="up">
                    <p> id : {item.id}</p>
                    <p> contenu : {item.contenu}</p>
                    <p> type : {item.type}</p>
                    <p> gmail id : {item.gmailId}</p>
                </div>

                <div className="down">
                    <div className="options">
                        <button> response</button>
                        <button> Analyse</button>
                    </div>
                    <div className="subContainer">
                        
                    </div>
                </div>

            </div>
            
            
        </div>
    )
    
}

// function SectionResponse({responses}){
//     return(
//         <div className="sectionResponse">
//             <div className="list">
//                 <div className='barreRecherche'>
//                     <input type="text" placeholder='search...' />
//                 </div>
               
//                 { !(responses.messages.length == 0) ? responses.messages.map((item,index)=>{
//                     return <div key={index} className='item'>
//                                 <div className='top'>
//                                     <div className="info">
//                                         <span>{responses.email}</span>
//                                     </div>
                              
//                                     <div className="right">
//                                         <span>date : {item.dateEnvoi}</span>
//                                         <span>type : {item.type}</span>
//                                     </div>
//                                 </div>
//                                 <div content="contenu">
//                                     <p>{item.contenu}</p>
//                                 </div>
//                             </div>
//                         }) : <div>No messages found.</div>}
                    
//                     {/* </div> */}

//                 </div>
//         </div>
//     )
// }