import React from 'react';

export default function Card({info,eraser}) {

    return (
        <div>
        <div className="card" key={"id:"+info.uid+":"+info.timestamp}>
            
            <div className="card-content">
                <span className="card-title activator grey-text text-darken-4">
                    {info.title}
                    <i className="material-icons right">keyboard_arrow_up</i>
                </span>
                <p>{info.email}</p>
                <p>{info.description}</p>
            </div>

            <div className="card-reveal">
                <span className="card-title grey-text text-darken-4">
                    {info.title}<i className="material-icons right">close</i>
                </span>
                <p>{info.solution}</p>
            </div>

            <div className='card-action' >
                <button name={info.timestamp+":"+info.uid} className='btn btn-small red' 
                    onClick={(evt)=>eraser(evt.target.name,"sub")}>Reject</button>
                <button name={info.timestamp+":"+info.uid} className='right btn btn-small' 
                    onClick={(evt)=>eraser(evt.target.name,"add")}>Resolve</button>
            </div>

        </div>
            <br/>
        </div>
    );
}
