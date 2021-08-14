import React from 'react';
import firebase from './firebase-config';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import logo from './logo.jpg';
import Content from './dir/content';

class App extends React.Component {

    constructor(props) {

        super(props);
        this.state = {
            isSignedIn : false
        };

        this.uiConfig = {
            signInFlow: 'popup',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID
            ],
            callbacks: {
                signInSuccessWithAuthResult: () => false
            }
        };
    }

    async componentDidMount() {
        this.unregisterAuthObserver = await firebase.auth().onAuthStateChanged(
            async (user) => await this.setState({
                isSignedIn: !!user
            })
        );
    }

    componentWillUnmount() {
        this.unregisterAuthObserver();
    }

    // Conditional Render as per login state
    render() {

        if (!this.state.isSignedIn) {
            return (
                <div id='login'>
                    
                    <img id='mainLogo' src={logo} alt='Project Logo'/>
                                    
                    <div>
                        <StyledFirebaseAuth
                            uiConfig={this.uiConfig} 
                            firebaseAuth={firebase.auth()}
                        />
                        <label>
                            <input type="checkbox" className="filled-in" checked="checked" />
                            <span className='white-text small'>I agree to terms and conditions</span>
                        </label>
                    </div>

                </div>
            );
        }
        
        return (
            <Content/>
        );
    }
};

export default App;
