import React, { Component } from 'react';
import './App.css';
import * as AppGeneral from './socialcalc/AppGeneral';
import { DATA } from './app-data.js';

class App extends Component {

  componentDidMount(){
    let data = DATA['home'][AppGeneral.getDeviceType()]['msc'];
    AppGeneral.initializeApp(JSON.stringify(data));
  }

  activateFooter(footer){
    // console.log("Button pressed! "+footer);
    AppGeneral.activateFooterButton(footer);
  }

  render() {
    let footers = DATA['home'][AppGeneral.getDeviceType()]['footers'];
    
    let footersList = footers.map((footerArray, i) => {
        // console.log(footerArray.name);
        // console.log(footerArray.index);
        return <button key={footerArray.index} className="App-footers" 
                       onClick={() => this.activateFooter(footerArray.index)}> {footerArray.name} </button>
        
    });

    return (
      <div className="App">
        <div className="App-footers">
          { footersList }
        </div>
        <div id="workbookControl"></div>
        <div id="tableeditor">editor goes here</div> 
        <div id="msg"></div> 
      </div>
    );
  }
}

export default App;
