import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import Card from './cmp/card';

class SimpleMap extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {

        const renderMarkers = (map, maps) => {
            
            new maps.Marker({
                position: { lat: this.props.location.latitude, lng: this.props.location.longitude },
                map,
                title: 'My Location',
                label: 'M',
            });
            
            if(this.props.locations.length!==undefined)
                this.props.locations.map(data=> {
                    
                    let infowindow = new maps.InfoWindow({
                        content: data.title
                    });
                    
                    let marker = new maps.Marker({
                        position: { lat: data.latitude, lng: data.longitude},
                        map,
                        title: data.title,
                    });

                    marker.addListener("click",()=>{
                        infowindow.open(map,marker);
                    });

                    return marker;
                })

                // Transit Layer for public transport
                const transitLayer = new maps.TransitLayer();
                transitLayer.setMap(map);
            
        };

        return (
            <>
            <div style={{ width:'90%',height:'50vh',margin:'auto' }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: "GOOGLE_MAPS_API_KEY_HERE" }}
                    defaultCenter={{lat:this.props.location.latitude,lng:this.props.location.longitude}}
                    defaultZoom={8}
                    yesIWantToUseGoogleMapApiInternals={true}
                    onGoogleApiLoaded={({ map, maps }) => renderMarkers(map, maps)}
                    >

                </GoogleMapReact>
            </div>

            <h4>Nearby Locations</h4>

                <div style={{position:'absolute',width:'100vw',marginTop:'2em'}}>
                {
                    // Returns Info Cards
                    (this.props.locations===null)?"":
                    (this.props.locations.length===undefined || this.props.locations.length===0)?
                    "No Nearby Issue/Task(s) Available":  
                    this.props.locations.map( (data,index) => {
                        return <Card info={data} eraser={this.props.eraser}/>
                    })
                }
                </div>

            </>
        );
    }
};

export default SimpleMap;
