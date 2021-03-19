import React from "react";
import swal from 'sweetalert';
import M from 'materialize-css';

// Custom components
import Map from './map';
import Loader from './cmp/loader';

import {functions} from '../firebase-config';

class ContentPanel extends React.Component {

    constructor(props) {

        super(props);
        swal('Success','Authentication Successful','success');

        this.state = {
            userCoordinates : null,
            error : null,
            locations : null,
            myLocations: null
        };
    }

    // Remove from locations state
    removeFromLocationsState = async (key,action) => {

        const arr = key.split(':');
        const timestamp = parseInt(arr[0]);
        const uid = arr[1];
        
        let removedObj = null;

        let locations = this.state.locations.filter(data=>{
            if(data.uid===uid && data.timestamp===timestamp)
               removedObj = data;
            return !(data.uid===uid && data.timestamp===timestamp);
        });

        let cloudFunction;
        if(action==='add')
          cloudFunction = 'assignVolunteer';
        else
          cloudFunction = 'irrelevantIssue';

        const call = functions.httpsCallable(cloudFunction);

        swal("Processing","Please Wait",'info',{
            buttons: {
                cancel: false,
                confirm: false,
            }
        });

        await call({ timestamp,uid})
        .then(res => {

            if(res==='')
                swal("Error",'Unauthorized Invocation','error');
            else if(res.data==='OK') {

                swal("Successful",'','success');
                if(action==='add' && removedObj !== null) {
                    
                    let myLocations = this.state.myLocations;
                    if(myLocations.length===undefined)
                        myLocations = [ removedObj ];
                    else
                        myLocations.push(removedObj);

                    this.setState({ ...this.state,locations,myLocations });

                }
                else
                    this.setState({ ...this.state,locations });

            }
            else
                swal("Failed","",'error');

        })
        .catch(err => {
            swal('Failed',err.message,'error');
        });

    }

    // Remove from myLocations state
    removeFromMyLocationsState = async (key,action) => {

        const arr = key.split(':');
        const timestamp = parseInt(arr[0]);
        const uid = arr[1];
        
        let removedObj = null;

        let myLocations = this.state.myLocations.filter( data => {
            if(data.uid===uid && data.timestamp===timestamp)
                removedObj = data;
            return !(data.uid===uid && data.timestamp===timestamp);
        });

        let cloudFunction;
        if(action==='add')
          cloudFunction = 'completedIssue';
        else
          cloudFunction = 'rejectIssue';

        const call = functions.httpsCallable(cloudFunction);

        swal("Processing","Please Wait",'info',{
            buttons: {
                cancel: false,
                confirm: false,
            }
        });

        await call({ timestamp,uid})
        .then(res => {

            if(res==='')
                swal("Error",'Unauthorized Invocation','error');
            else if(res.data==='OK') {

                swal("Successful",'','success');
                if(action==='sub' && removedObj!==null) {

                    let locations = this.state.locations;
                    locations.push(removedObj);
                    this.setState({...this.state,myLocations,locations});

                }
                else
                    this.setState({ ...this.state,myLocations });

            }
            else
                swal("Failed","",'error');

        })
        .catch(err => {
            swal('Failed',err.message,'error');
        });

    }

    // Send Problem Report
    sendReport = async ()=> {

        let title = document.getElementById('title').value;
        let description = document.getElementById('description').value;
        let solution = document.getElementById('solution').value;

        if(title.length===0 || description.length===0 || solution.length===0)
            return swal('Failed','Fields cannot be empty','error');

        const coordRef = this.state.userCoordinates;
        if(coordRef.latitude===null || coordRef.longitude===null)
            return swal('Failed','User coordinates cannot be fetched','error');

        swal("Processing","Please Wait",'info',{
            buttons: {
                cancel: false,
                confirm: false,
            }
        });

        const testCall = functions.httpsCallable('addEntry');
        await testCall({
            latitude : this.state.userCoordinates.latitude,
            longitude: this.state.userCoordinates.longitude,
            title, description, solution
        })
            .then( res => {

                if(res.data==="")
                    swal("Error",'Unauthorized Invocation','error');
                else if(res.data==='OK')
                    swal("Report Submitted",'Will be published after review','success');
                else
                    swal("Rule(s) Violated","Contact admin for details",'error');

                // Cleaning state
                document.getElementById('title').value = "";
                document.getElementById('description').value = "";
                document.getElementById('solution').value = "";
                M.updateTextFields();

            })
            .catch( err => {
                    swal("Error",err.message,'error');
            }); 

    };

    // Fetch User Coordinates
    askforUserCoords = async(signal) => {

        let userCoordinates = null;
        let error = null;

        // Enable high accuracy
        var geoOptions = {
            enableHighAccuracy: true
        }

        // Success geolocation
        var geoSuccess = async (position) => {
            
            userCoordinates = {
                latitude : position.coords.latitude,
                longitude : position.coords.longitude
            };

            if(signal==='') {
                let locations = await this.fetchNearbyLocations(userCoordinates);
                let myLocations = await this.fetchMyLocations(userCoordinates);
                
                this.setState({ ...this.state, userCoordinates, 
                                    locations:locations.data, 
                                    myLocations: myLocations.data 
                              });
            } else {
                this.setState({ ...this.state, userCoordinates });
            };

        };

        // Report Error
        var geoError = (err) => {

            swal('Error','Client Permission Denied','error');
            error = err.code;
            this.setState({ ...this.state, error });
            
        };

        navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);

    };

    fetchMyLocations = async (coords) => {

        if(coords!==null) {

            const testCall = functions.httpsCallable('undertakenIssues');

            return await testCall()
              .then(res => res)
              .catch(err => err);
            
        }
    }

    // Integrate 'Fetch Nearby Locations'
    fetchNearbyLocations = async (coords) => {

      if(coords!==null) { 

        const testCall = functions.httpsCallable('listEntries');

        return await testCall({
            latitude : coords.latitude,
            longitude: coords.longitude
        }).then(res => res)
          .catch(err => err);

      }
    };

    // Fetch relevant data for user
    async componentDidMount() {
        M.AutoInit();
        await this.askforUserCoords("");
    }

    render() {

        return (
        <>

            <nav className="nav-extended light-blue darken-2" >

                <div className="nav-wrapper">
                    <span className="brand-logo center">Loconnect</span>
                </div>

                <div className="nav-content row">
                    <ul className="tabs tabs-transparent">
                    <li className="tab col s4"><a href="#locate"><b>Locate</b></a></li>
                    <li className="tab col s4"><a href="#inform"><b>Inform</b></a></li>
                    <li className="tab col s4"><a href="#tasks"><b>My Tasks</b></a></li>
                    </ul>
                </div>

            </nav>

            <div id='locate' className='center center-align' style={{margin: 'auto'}}>
                { 
                    (this.state.userCoordinates===null)?(
                        (this.state.error===null)?<Loader/>:
                        ("Client Error-Code:"+this.state.error)
                    ):
                    <Map location={this.state.userCoordinates} locations={this.state.locations} eraser={this.removeFromLocationsState}/>
                } 
            </div>

            <div id='inform' className='container'>

                <br/>
                <div className='card-panel'>
                <h5 className='card-title'>Report Problem</h5>
                <div className="row">

                    <div className="input-field col s12">
                        <input id="title" type="text" className="validate" required/>
                        <label htmlFor="title">Issue Title</label>
                    </div>
                
                    <div className="input-field col s12">
                        <input id="description" type="text" className="validate" required/>
                        <label htmlFor="description">Description</label>
                    </div>
                
                    <div className="input-field col s12">
                        <textarea id="solution" className="validate materialize-textarea" required></textarea>
                        <label htmlFor="solution">Possible Soluton</label>
                    </div>

                </div>

                <button className="waves-effect waves-light btn left" onClick={()=>this.askforUserCoords("re")} ><i className="material-icons left">my_location</i>Refresh</button>
                <button className="waves-effect waves-light btn right" onClick={()=>this.sendReport()}><i className="material-icons right">send</i>Submit</button>
                    <br/><br/>
                </div>

            </div>
        
            <div id='tasks' className='center center-align' style={{margin: 'auto'}}>
                {
                    (this.state.userCoordinates===null)?(
                        <Loader/>
                    ):
                    <Map location={this.state.userCoordinates} locations={this.state.myLocations} eraser={this.removeFromMyLocationsState}/>
                
                }
            </div>
        
        </>
        );
    }
};

export default ContentPanel;
