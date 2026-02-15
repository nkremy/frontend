import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {URL} from "./component/tools.js"

function App() {
  let [task,listTask] = useState([])
  let [newTask,setNewTask] = useState({name:"",description:""})
  let [visible,setVisible] = useState(true);
  let [taskEdit,setTaskEdit] = useState(null);

  useEffect( ()=>{
    let getTask =  ()=>{
      fetch(URL)
      .then(r=>r.json())
      .then(r => {listTask(r); console.log(r)});

    }
   getTask()
  },[])


  function remove(id){
    fetch(`${URL}/${id}`,{
      method:"DELETE"
    })
      .then(r=>{
        if(r.status == 200){
          listTask(prev=> prev.filter(item=>item.id != id));
          alert("task delete sucessfuly")
        }else{
          alert("task not found")
        }
      })
  }
  console.log("je ne te rerend pas seul je rend aussi le parent")

  return (
    <>
      <form action=""
        onSubmit={(e)=>{
          e.preventDefault;
            fetch(`${URL}`,{
            method:"POST",
            headers:{
              "Content-Type":"application/json"
            },
            body:JSON.stringify(newTask)
          })
            .then(r=>{
              console.log(r)
              if(r.status == 200){
                listTask(prev=>[...prev,...r.json()])
                alert("task add sucessfuly")
              }else{
                alert("error")
              }
              setTaskEdit(null)
            })
        }}
      >
          <label htmlFor="">Name</label>
          <input type="text" value={newTask.name}  onChange={(e)=>{ setNewTask(prev=> {return {...prev,name:e.target.value} })}}/>

          <label htmlFor="">Description</label>
          <textarea type="text" name="" id="" value={newTask.description}  onChange={(e)=>{ setNewTask(prev=> {return {...prev,description:e.target.value} })}} rows={10} width={20}/>

        <button>Save</button>
      </form>

      

     <table width={500}>
        <tr>
          <td>name</td>
          <td>description</td>
          <td>actions</td>
        </tr>
        {task.length != 0 ? task.map((item,index)=>(
          <tr key={index}>
            <td>{item.name}</td>
            <td>{item.description}</td>
            <td>
              <button onClick={()=>{remove(item.id)}}>delete</button>
              <button onClick={()=>{
                setTaskEdit(item);
                setVisible(true);

              }}>update</button>
            </td>
          </tr>
        )) : null}
     </table>
      <UpdateForm
        visible={visible}
        setVisible={setVisible}
        item={taskEdit}
        editItem={setTaskEdit}
        updateItem = {(id,body)=>{
          console.log("le body utiliser dans le requete est : ");
          console.log(body)
          
          fetch(`${URL}/${id}`,{
            method:"PUT",
            headers:{
              "Content-Type":"application/json"
            },
            body:JSON.stringify(body)
          })
            .then(r=>{
              console.log(r)
              if(r.status == 200){
                let newListeTask = task.filter(item=>{if( item.id == id){
                  console.log("c'est le meme article");
                  return body
                }else{
                  console.log("c'est n'est pas le meme article")
                  return item
                }})
                console.log("&&&&&&&&&&&&&&&&([]);&&&&&&&&&&&&&&&&&&&&&&&&&la nouvelle liste est : ")
                console.log(newListeTask)
                listTask(newListeTask);
                alert("task update sucessfuly")
              }else{
                alert("task not found")
              }
              setTaskEdit(null)
            })
        }}
      />
    </>
  )
}

function UpdateForm({item,editItem,visible,setVisible,updateItem}){

  console.log("nous sommen dans le composant pour tester si tout ce passe bien")
  console.log(item)
  return (visible  && item != null) ?
  
    <div className="potUp" style={{height:"100vh",width:"100vw",zIndex:"10",display:"flex",justifyContent:"center",position:"absolute " , top:"0px",left:"0px" , alignItems:"center",background:"grey"}}>
         <form onSubmit={(e)=>{
            e.preventDefault();
            console.log("on vient de clique sir le bouton pour modifier voici le corps de le requete qui sera envoyer ")
            console.log(item);
            updateItem(item.id,item)
            setVisible(false)
         }}>
          <label htmlFor="">Name</label>
          <input type="text" value={item.name}  onChange={(e)=>{ editItem(prev=> {return {...prev,name:e.target.value} })}}/>

          <label htmlFor="">Description</label>
          <textarea type="text" name="" id="" value={item.description}  onChange={(e)=>{ editItem(prev=> {return {...prev,description:e.target.value} })}} rows={10} width={20}/>

          <button onClick={()=>{
            
          }}>Save</button>
          <button onClick={()=>{
            setVisible(false);
          }}>Cancel</button>
        </form>
      </div> 

  : "pas de tache selectionner pour le moment";
}

export default App
