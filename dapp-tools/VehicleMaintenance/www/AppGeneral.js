//////////////////////////////
//
//  App General -- These form the general UI and other stuff
//  common to all templated apps
//
//////////////////////////////
htmlEncryptionKey = "EncryptionKeyisLooooooooooooooooooongEnough";
metaInfoFileName = "MetaFileInfoLoooooooooooooooooooooooooooongEnough";
applicationName = "Vehicle Maintenance";

function getdefault()
{
    console.log("user agent is:"+navigator.userAgent)
    if (navigator.userAgent.match(/iPod/)) return 1;
    if (navigator.userAgent.match(/iPad/)) return 2;
    if (navigator.userAgent.match(/iPhone/)) return 1;


}

function setLastEditedFileName(filename)
{
    // check meta file exists
    var filedata = window.localStorage.getItem(metaInfoFileName);
    var fileobj = {};
    if (filedata) {
        try {
            fileobj = JSON.parse(filedata);
        } catch (e) {
            fileobj = {};
        }
    } else {
        fileobj = {};
    }
    fileobj["lastedited"] = filename;
    window.localStorage.setItem(metaInfoFileName, JSON.stringify(fileobj));
}

function getLastEditedFileName()
{
    var filedata = window.localStorage.getItem(metaInfoFileName);
    if (filedata) {
        try {
            var fileobj = JSON.parse(filedata);
            return fileobj["lastedited"]
        } catch (e) {
            return null;
        }
    }
    return null;
}

function getLastEditedFileData()
{
    console.log("in init file data")
    var lasteditedfile = getLastEditedFileName();
    console.log("in init file data name:"+lasteditedfile)
    if (lasteditedfile) {
        if (lasteditedfile != "default") {
            var filedata = window.localStorage.getItem(lasteditedfile);
            if (filedata != null)
                return decodeURIComponent(filedata);
        } else {
            return document.getElementById("sheetdata").value
        }
    }
    console.log("no init file data")
    return null;
}





SocialCalc.oldBtnActive = 1;

function getSheetIds() {
    var control = SocialCalc.GetCurrentWorkBookControl();
    var sheets = [];
    for (key in control.sheetButtonArr) {
        //console.log(key);
        sheets.push(key);
    }
    return sheets;
}

function activateFooterBtn(index) {
    if (index == SocialCalc.oldBtnActive) return;

    var sheets = getSheetIds()
    // disable active edit boxes
    var control = SocialCalc.GetCurrentWorkBookControl();
    var spreadsheet = control.workbook.spreadsheet;
    var ele = document.getElementById(spreadsheet.formulabarDiv.id);
    if (ele) {
        SocialCalc.ToggleInputLineButtons(false);
        var input = ele.firstChild;
        input.style.display="none";
        spreadsheet.editor.state = "start";
    }
    SocialCalc.WorkBookControlActivateSheet(sheets[index-1]);

    SocialCalc.oldBtnActive = index;

    //
    //$("#indexPageSheetName").html($("#"+newbtn).attr("name"))
}


SocialCalc.ToggleInputLineButtons = function(show) {
    var bele = document.getElementById("testtest");
    if (!bele) return;
    if (show) {
        bele.style.display = "inline";
    } else {
        bele.style.display = "none";
    }
}
SocialCalc.InputLineClearText = function() {
    spreadsheet.editor.inputBox.SetText("");
}


SocialCalc.Callbacks.broadcast = function(type, data) {

}


function getFormattedTimestamp(timestr) {
    var d = new Date(timestr);
    if (d) {
        return d.toLocaleString()
    }
    return "";
}

function getFileDateString(filename) {
    var filedata = window.localStorage.getItem(filename);
    if (filedata) {
        filedata = decodeURIComponent(filedata);
        var data = JSON.parse(filedata);
        if (data && data["timestamp"]) {
            return getFormattedTimestamp(data["timestamp"])
        }
    }
    return ""
}

var selectedFile = "default";
var initialSelectedSheetButton = 1;


function loadAndStartUpApp(){
    //alert("yo");



    SocialCalc.Constants.defaultImagePrefix = "lib/aspiring/images/sc-";
    SocialCalc.Constants.defaultGridCSS = "";
    SocialCalc.Constants.SCNoColNames = true;
    SocialCalc.Constants.SCNoRowName = true;
    SocialCalc.Constants.defaultRownameStyle = "";
    SocialCalc.Constants.defaultSelectedRownameStyle = "";
    SocialCalc.Popup.imagePrefix = "lib/aspiring/images/sc-";



    var spreadsheet = new SocialCalc.SpreadsheetControl();
    var workbook = new SocialCalc.WorkBook(spreadsheet);
    workbook.InitializeWorkBook("sheet1");


    spreadsheet.InitializeSpreadsheetControl("tableeditor", 0, 0, 0);
    spreadsheet.ExecuteCommand('redisplay', '');


    var workbookcontrol = new SocialCalc.WorkBookControl(workbook,"workbookControl","sheet1");
    workbookcontrol.InitializeWorkBookControl();

    selectedFile = "default";
    initialSelectedSheetButton = 1;
    var initialFileLoadData = null;

     var devicefind = getDeviceType();
    
    if (getLastEditedFileName()) {
        selectedFile = getLastEditedFileName();
        console.log("lastedited="+selectedFile)
        initialFileLoadData = getLastEditedFileData();

        if (initialFileLoadData) {
            try {
                var initialmscfile = JSON.parse(initialFileLoadData)
                initialSelectedSheetButton = parseInt(initialmscfile["currentid"].slice(5))
                console.log("initbtn="+initialSelectedSheetButton)
            } catch (e) {
                initialSelectedSheetButton = 1;
            }
            SocialCalc.WorkBookControlLoad(initialFileLoadData)
        } else {
            selectedFile = "default"
            //SocialCalc.WorkBookControlLoad(document.getElementById("sheetdata").value)
            var sheetdatabydevice = getSheetDataForDevice();
            SocialCalc.WorkBookControlLoad(sheetdatabydevice)
            if(devicefind == "iPad" || devicefind == "default"){
                // changeTemplate(getTemplate());
            }
            
        }
    } else {
        
        //SocialCalc.WorkBookControlLoad(document.getElementById("sheetdata").value)
        var sheetdatabydevice = getSheetDataForDevice();
        //alert(sheetdatabydevice);
        SocialCalc.WorkBookControlLoad(sheetdatabydevice);
        if(devicefind == "iPad" || devicefind == "default"){
            // changeTemplate(getTemplate());
        }

    }
    var ele = document.getElementById('te_griddiv');
    ele.style.height= "1600px";
    
    //alert("5");
    spreadsheet.DoOnResize();
    //alert("6");
}


function getName(){
    return selectedFile;
}



/////prompt starts here

SocialCalc.Callbacks.mustshowprompt = function(coord){
    var control = SocialCalc.GetCurrentWorkBookControl();
    var editor = control.workbook.spreadsheet.editor;
    var cellname = editor.workingvalues.currentsheet+"!"+editor.ecell.coord;
    var constraint = SocialCalc.EditableCells.constraints[cellname];
    if (constraint)
    {
        if (constraint[0].slice(0,6)=="prompt")
            return true;
    }
    // for phone apps always show prompt
    return true;
}

SocialCalc.Callbacks.getinputtype = function(coord){
    var control = SocialCalc.GetCurrentWorkBookControl();
    var editor = control.workbook.spreadsheet.editor;
    var cellname = editor.workingvalues.currentsheet+"!"+editor.ecell.coord;
    var constraint = SocialCalc.EditableCells.constraints[cellname];
    if (constraint)
    {
        if (constraint[0].slice(0,5)=="input")
        {
            var inptype = constraint[0].slice(5);
            if (inptype == "numeric")
            {
                return "number";
            }
        }
    }
    return null;
}
SocialCalc.Callbacks.prompttype = function(coord){
    var control = SocialCalc.GetCurrentWorkBookControl();
    var editor = control.workbook.spreadsheet.editor;
    var cellname = editor.workingvalues.currentsheet+"!"+editor.ecell.coord;
    var constraint = SocialCalc.EditableCells.constraints[cellname];

    if (constraint)
    {
        if (constraint[0].slice(0,6)=="prompt")
        {
            var inptype = constraint[0].slice(6);
            if (inptype == "numeric")
            {
                return "numberpad";
            }
        }
    }
    return null;
}

SocialCalc.Callbacks.showprompt = function(coord) {

    var control = SocialCalc.GetCurrentWorkBookControl();
    var editor = control.workbook.spreadsheet.editor;
    var cellname = editor.workingvalues.currentsheet+"!"+editor.ecell.coord;
    var constraint = SocialCalc.EditableCells.constraints[cellname];
    var highlights = editor.context.highlights;

    //alert(constraint);
    var wval = editor.workingvalues;
    if (wval.eccord) {
        wval.ecoord = null;
        console.log("return due to ecoord")
        return;
    }
    wval.ecoord = coord;
    if (!coord) coord = editor.ecell.coord;
    var text = SocialCalc.GetCellContents(editor.context.sheetobj, coord);
    console.log("in prompt, coord = "+coord+" text="+text);

    if (SocialCalc.Constants.SCNoQuoteInInputBox && (text.substring(0,1) == "'")) {
        text = text.substring(1);
    }
    console.log("continue...")

    var cell=SocialCalc.GetEditorCellElement(editor, editor.ecell.row, editor.ecell.col);
    //alert(cell);

    var cancelfn = function() {
        wval.ecoord = null;
        delete highlights[editor.ecell.coord];
        editor.UpdateCellCSS(cell, editor.ecell.row, editor.ecell.col);

    };

    var okfn = function(val) {
        var callbackfn = function() {
            console.log("callback val "+val)
            SocialCalc.EditorSaveEdit(editor, val);
        };
        window.setTimeout(callbackfn, 100);
    };

    // highlight the cell
    delete highlights[editor.ecell.coord];
    highlights[editor.ecell.coord] = "cursor";
    editor.UpdateCellCSS(cell, editor.ecell.row, editor.ecell.col);


    var celltext = "Enter Value";
    var title = "Input";
    if (constraint)
    {
        if (constraint.length > 3)
        {
            celltext = constraint[3];
            //alert(celltext);
        }
        if (constraint.length > 4)
        {
            title = constraint[4];
        }
    } else {
        console.log("cell text is null")
    }

    var options = {title: title};
    var prompttype = SocialCalc.Callbacks.prompttype(coord);
    if (prompttype) options["type"] = prompttype;
    options["message"] = celltext;
    console.log("text is "+text);
    options["textvalue"] = text;

    function onPrompt(results) {
        if(results.buttonIndex==3) return;
        else if(results.buttonIndex == 2){
            showListView();
        }
        else if(results.buttonIndex == 1){
            okfn(results.input1);
        }
    }

    navigator.notification.prompt(
                                  'Enter value',  // message
                                  onPrompt,                  // callback to invoke
                                  'Input',            // title
                                  ['Ok','Customise','Cancel'],             // buttonLabels
                                  ''+text+''                 // defaultText
                                  );

    return true;
}

function showListView(){

    function onConfirm(buttonIndex) {
        if(buttonIndex == 1){
            //cut
            Cut();
        }
        else if(buttonIndex == 2){
            Copy();
        }
        else if(buttonIndex == 3){
            Paste();
        }
        else if(buttonIndex == 4){
            Delete();
        }
        else if(buttonIndex == 5){
            showFontListView();
        }
        else if(buttonIndex == 6){
            showColorListView();
        }
        else{
            return;
        }
    }

    // Show a custom confirmation dialog
    //

    navigator.notification.confirm(
                                   'Customise cell options', // message
                                   onConfirm,            // callback to invoke with index of button pressed
                                   'Customise',           // title
                                   ['Cut','Copy','Paste','Clear','Font','Color','Cancel']      // buttonLabels
                                   );

}

function showFontListView(){

    var control = SocialCalc.GetCurrentWorkBookControl();
    //alert('control are'+control);
    var editor = control.workbook.spreadsheet.editor;

    var onFontConfirm = function(buttonIndex){
        if(buttonIndex == 1){
            SocialCalc.EditorChangefontFromWidget(editor,"a");

        }
        else if(buttonIndex == 2){
            SocialCalc.EditorChangefontFromWidget(editor,"b");
        }
        else if(buttonIndex == 3){
            SocialCalc.EditorChangefontFromWidget(editor,"c");
        }
        else if(buttonIndex == 4){
            SocialCalc.EditorChangefontFromWidget(editor,"d");
        }
        else {
            return;
        }



    };
    navigator.notification.confirm(
                                   'Customise cell options', // message
                                   onFontConfirm,            // callback to invoke with index of button pressed
                                   'Customise',           // title
                                   ['Small:8pt','Medium:12pt','Big:14pt','Large:16pt','Cancel']      // buttonLabels
                                   );

}
function showColorListView(){
    var control = SocialCalc.GetCurrentWorkBookControl();
    //alert('control are'+control);
    var editor = control.workbook.spreadsheet.editor;

    var onColorConfirm = function(buttonIndex){
        if(buttonIndex == 1){
            SocialCalc.EditorChangecolorFromWidget(editor,"red");

        }
        else if(buttonIndex == 2){

            SocialCalc.EditorChangecolorFromWidget(editor,"yellow");

        }
        else if(buttonIndex == 3){
            SocialCalc.EditorChangecolorFromWidget(editor,"blue");

        }
        else if(buttonIndex == 4){
            SocialCalc.EditorChangecolorFromWidget(editor,"green");

        }
        else if(buttonIndex == 5){
            SocialCalc.EditorChangecolorFromWidget(editor,"purple");
        }
        else if(buttonIndex == 6){
            SocialCalc.EditorChangecolorFromWidget(editor,"black");
        }
        else {
            return;
        }



    };
    navigator.notification.confirm(
                                   'Customise cell options', // message
                                   onColorConfirm,            // callback to invoke with index of button pressed
                                   'Customise',           // title
                                   ['Red','Yellow','Blue','Green','Purple','Black','Cancel']      // buttonLabels
                                   );

}

var no_of_cells;
function Cut() {
    var editor = SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor;
    // alert("func called");
    var val= 'a';
    no_of_cells=1;
    var callbackfn = function() {
        // alert("callback");
        SocialCalc.EditorCut(editor, val,no_of_cells);
    };
    window.setTimeout(callbackfn, 100);

}
function Copy() {
    //alert("func called");
    var editor = SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor;

    var val= 'b';
    no_of_cells=1;
    var callbackfn = function() {

        //        var rememberradio = document.getElementById('radio-choice-h-2a');
        //        if(rememberradio.checked==true){
        //            // alert("callback");
        //            copysheet();
        //        }
        //        else {
        SocialCalc.EditorCut(editor, val,no_of_cells);
        //}

    };
    window.setTimeout(callbackfn, 100);

}

function Paste() {
    var editor = SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor;
    // alert("func called");
    var val= 'c';

    var callbackfn = function() {
        // alert("callback");
        //        var rememberradio = document.getElementById('radio-choice-h-2a');
        //        if(rememberradio.checked==true){
        //            // alert("callback");
        //            pastesheet();
        //        }
        //        else {
        SocialCalc.EditorCut(editor, val,no_of_lines_copied);
        // }

    };
    window.setTimeout(callbackfn, 100);

}


function Redo() {
    var control = SocialCalc.GetCurrentWorkBookControl();
    //alert('control are'+control);
    var editor = control.workbook.spreadsheet.editor;
    editor.context.sheetobj.SheetRedo();

}

function Undo() {
    //alert('undo');
    var control = SocialCalc.GetCurrentWorkBookControl();
    //alert('control are'+control);
    var editor = control.workbook.spreadsheet.editor;
    editor.context.sheetobj.SheetUndo();

}

function Delete() {
    //alert("func called");
    var editor = SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor;

    var val= 'd';
    no_of_cells=1;
    var callbackfn = function() {

        //        var rememberradio = document.getElementById('radio-choice-h-2a');
        //        if(rememberradio.checked==true){
        //            // alert("callback");
        //            copysheet();
        //        }
        //        else {
        SocialCalc.EditorCut(editor, val,no_of_cells);
        //}

    };
    window.setTimeout(callbackfn, 100);

}



function saveAsMessage(){
    function onPrompt(results) {
        //alert("You selected button number " + results.buttonIndex + " and entered " + results.input1);
        if(results.buttonIndex == 1)return;
        saveAsOk(results.input1)
    }

    // Show a custom prompt dialog
    //

    navigator.notification.prompt(
                                  'Please enter the filename',  // message
                                  onPrompt,                  // callback to invoke
                                  'Save as',            // title
                                  ['Cancel','Done'],             // buttonLabels
                                  ''                 // defaultText
                                  );

}


function saveAsOk(fname) {
    // do some validation checks on file name
    console.log("running 0");
    if ((fname == "default") || (fname == "Untitled")) {
        navigator.notification.alert("Cannot update default file!",null,"Save As","Ok");
        return;
    }
    console.log("running 1");

    if (fname == "") {
        navigator.notification.alert("Cannot use empty filename",null,"Save As","Ok");

        return;
    }

    console.log("running 2");
    if (fname.length > 30) {
        navigator.notification.alert('Filename too long  \n\n Please enter a file name less than 30 characters',null,"Save As","Ok");
        return;
    }
    console.log("running 4");
    var ind=fname.indexOf(" ");
    if(ind!= -1){
        fname=fname.replace(" ","");
        console.log("fname is now: "+fname);
    }
    else{
        console.log("fname is same: "+fname);

    }


    var val = SocialCalc.WorkBookControlSaveSheet();
    console.log(val.length);
    var val1 = encodeURIComponent(val);
    console.log(val1.length);

    console.log(window.localStorage.length);
    window.localStorage.setItem(fname, val1);
    console.log("saved as "+fname);
    // set the top right file to selected file
    updateFileName(fname);

    showToast("File "+fname+" saved successfully");
    updateCounter();
    return true;

}


function autoSave(filename){
    if(filename == "default" || filename == "Untitled") return;
    else{
        console.log("updating current file "+selectedFile)
        var val = SocialCalc.WorkBookControlSaveSheet();
        console.log(val.length);
        var val1 = encodeURIComponent(val);
        console.log(val1.length);
        window.localStorage.setItem(selectedFile, val1);
        console.log("updated as "+selectedFile);
    }
}

function saveCurrentFile(){

    if(selectedFile == "default") {
        showToast("Cannot update default. Use Save As");
        return false;
    }
    else{
        console.log("updating current file "+selectedFile)
        var val = SocialCalc.WorkBookControlSaveSheet();
        console.log(val.length);
        var val1 = encodeURIComponent(val);
        console.log(val1.length);
        window.localStorage.setItem(selectedFile, val1);
        console.log("updated as "+selectedFile);
        showToast("Updated file: "+selectedFile);
        return true;
    }

}

function updateFileName(fname) {

    if (selectedFile != fname) {
        setLastEditedFileName(fname)
    }
    selectedFile = fname;
    //Aspiring.AutoSave.selectedFile = fname;
    console.log("updateFileName:selected file: "+selectedFile);
}


function showToast(msg){
    window.plugins.toast.showShortBottom(msg, function(a){
                                         console.log('toast success: ' + a)},
                                         function(b){
                                         //alert('toast error: ' + b);
                                         });

}

function getdefault(){
    console.log("user agent is:"+navigator.userAgent)
    if (navigator.userAgent.match(/iPod/)) return 1;
    if (navigator.userAgent.match(/iPad/)) return 2;
    if (navigator.userAgent.match(/iPhone/)) return 1;

}


function encryptFile(){
    var passwordObject = window.localStorage.getItem(htmlEncryptionKey);
    if (passwordObject)
        passwordObject = JSON.parse(passwordObject);
    else
        passwordObject = {};
    var promptFile= function(filename){

        if(filename ==''){
            navigator.notification.alert("Filename cannot be empty",null,applicationName);
            return;
        }
        else if(filename.length>=30){
            navigator.notification.alert("Filename cannot be more than 30 characters",null,applicationName);
            return;
        }
        if (window.localStorage.getItem(filename)){
            navigator.notification.alert("File with the same name already exists",null,applicationName);
            return;
        }
        var promptPass = function passString(passString){
            if(passString ==''){
                navigator.notification.alert("Password cannot be empty",null,applicationName);
                return;
            }
            else if(passString.length>=30){
                navigator.notification.alert("Password cannot be more than 30 characters",null,applicationName);
                return;
            }

            passwordObject[filename] = passString;
            var val = SocialCalc.WorkBookControlSaveSheet();
            console.log(val.length);
            var val1 = encodeURIComponent(val);
            console.log(val1.length);
            window.localStorage.setItem(filename, val1);
            passwordObject = JSON.stringify(passwordObject);
            window.localStorage.setItem(htmlEncryptionKey,passwordObject);
            updateFileName(filename);
        }

        window.plugins.messageBox.prompt({title: 'Save', message: 'Enter Password'}, function(button, value) {
                                         var args = Array.prototype.slice.call(arguments, 0);
                                         if(button == 'ok'){
                                         console.log("save as success");
                                         promptPass(value);
                                         }
                                         else{
                                         //                                     alert("Cancelled");
                                         saveAsCancel();
                                         }

                                         });


        /* window.plugins.Prompt.show(
         "Enter Password",
         promptPass,
         null,
         "Submit", // ok button title (optional)
         "Cancel", // cancel button title (optional)
         "yes"
         ); */
    }

    /* window.plugins.Prompt.show(
     "Enter File Name",
     promptFile,
     null,
     "Submit", // ok button title (optional)
     "Cancel", // cancel button title (optional)
     "yes"
     ); */

    window.plugins.messageBox.prompt({title: 'Save', message: 'Enter File'}, function(button, value) {
                                     var args = Array.prototype.slice.call(arguments, 0);
                                     if(button == 'ok'){
                                     console.log("save as success");
                                     promptFile(value);
                                     }
                                     else{
                                     //                                     alert("Cancelled");
                                     saveAsCancel();
                                     }

                                     });





}

function decryptFileOpen(filename){
    var passwordObject = window.localStorage.getItem(htmlEncryptionKey);
    console.log(passwordObject);
    passwordObject = JSON.parse(passwordObject);


    if (!passwordObject){
        return true;
    }
    if (!passwordObject[filename]){
        return true;
    }

    var promptPass = function(passString){

        if (passString == passwordObject[filename])
        {
            data = window.localStorage.getItem(filename);
            console.log(data.length);
            SocialCalc.WorkBookControlInsertWorkbook(decodeURIComponent(data));
            SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state = "start";
            SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand('redisplay', '');
            updateFileName(filename);

            $.mobile.changePage(($("#indexPage")), { transition: "slideup"} );


            window.setTimeout(function() {
                              SocialCalc.ScrollRelativeBoth(SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor, 1, 0);
                              SocialCalc.ScrollRelativeBoth(SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor, -1, 0);
                              },1000);


        }
        else
        {
            navigator.notification.alert("You have entered wrong Password",null,applicationName);
        }
    }

    /*   window.plugins.Prompt.show(
     "Enter password for this File",
     promptPass,
     null,
     "Submit", // ok button title (optional)
     "Cancel", // cancel button title (optional)
     "yes"
     ); */

    window.plugins.messageBox.prompt({title: 'Save', message: 'Enter Password'}, function(button, value) {
                                     var args = Array.prototype.slice.call(arguments, 0);
                                     if(button == 'ok'){
                                     console.log("save as success");
                                     promptPass(value);
                                     }
                                     else{
                                     //                                     alert("Cancelled");
                                     saveAsCancel();
                                     }

                                     });

    return false;
}

function decryptFileDelete(filename){
    var passwordObject = window.localStorage.getItem(htmlEncryptionKey);
    console.log(passwordObject);
    passwordObject = JSON.parse(passwordObject);


    if (!passwordObject){
        return true;
    }
    if (!passwordObject[filename]){
        return true;
    }

    var promptPass = function(passString){

        if (passString == passwordObject[filename])
        {
            deleteFile(filename);
            delete passwordObject[filename];
            passwordObject = JSON.stringify(passwordObject);
            window.localStorage.setItem(htmlEncryptionKey,passwordObject);
        }
        else
        {
            navigator.notification.alert("You have entered wrong Password",null,applicationName);
        }
    }

    /*
     window.plugins.Prompt.show(
     "Enter password for this File",
     promptPass,
     null,
     "Submit", // ok button title (optional)
     "Cancel", // cancel button title (optional)
     "yes"
     ); */


    window.plugins.messageBox.prompt({title: 'Save', message: 'Enter Password'}, function(button, value) {
                                     var args = Array.prototype.slice.call(arguments, 0);
                                     if(button == 'ok'){
                                     console.log("save as success");
                                     promptPass(value);
                                     }
                                     else{
                                     //                                     alert("Cancelled");
                                     saveAsCancel();
                                     }

                                     });





    return false;
}




function getTemplate(){
    if(!window.localStorage.getItem("choice")){
        return 1;
    }
    var device = window.localStorage.getItem("choice");
    if(device == "checkbook"){
        return 2;
    }
    else{
        return 1;
    }
}


function viewFile(filename) {
    //alert("viewFile: "+selectedFile)
    console.log("view file "+filename);
    selectedFile = filename;
    var devicefind = getDeviceType();
    //$.mobile.showPageLoadingMsg()
    //selectedFile = filename;
    var getdefaultvalue = getdefault();
    var data = "";
    
    /*Changes for Encryption Implementation Start*/
    
    if (filename != "default") {
        var decrypt = decryptFileOpen(filename); //change
        if (decrypt == true){               //change
            data = window.localStorage.getItem(filename)
            console.log(data.length);
            /*var temp = checkIfCustomTemplate(filename);
            if(temp == "checkbook" && devicefind == "iPad"){
                changeTemplate(2);
            }
            else{
                changeTemplate(1);
            }
            */
            
            SocialCalc.WorkBookControlInsertWorkbook(decodeURIComponent(data));
        }
        else{ return;}     //change
        /*Changes for Encryption Implementation End*/
        
    } else {
        
        if(getdefaultvalue == 2){
            console.log("getdefaultvalue is "+getdefaultvalue);
            data = document.getElementById("sheetdata").value;
            
        }
        if(getdefaultvalue == 1){
            console.log("getdefaultvalue is "+getdefaultvalue);
            data = document.getElementById("sheetdata1").value;
        }
        
        
        SocialCalc.WorkBookControlInsertWorkbook(data);
        if(devicefind == "iPad" || devicefind == "default"){
           /// changeTemplate(getTemplate());
        }
    }
    //updateFileName(filename);
    selectedFile = filename;
    // reset the editor state

    SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state = "start";

    SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand('redisplay', '');
    var control=SocialCalc.GetCurrentWorkBookControl();

    window.setTimeout(function() {
                      SocialCalc.ScrollRelativeBoth(SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor, 1, 0);
                      SocialCalc.ScrollRelativeBoth(SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor, -1, 0);
                      },1000);



    //},2000
    //);
}


function showPrintDialog(){
    var control = SocialCalc.GetCurrentWorkBookControl();
    var html = control.workbook.spreadsheet.CreateSheetHTML();

    cordova.plugins.printer.print(html, 'VehicleMaintenance.html', function () {
                                  //alert('printing finished or canceled');
                                  updateCounter();
                                  });


}


function exportAsCsv(){
    var val = SocialCalc.WorkBookControlSaveSheet();
    // alert(val);
    var workBookObject = JSON.parse(val);
    // alert(workBookObject);
    var control = SocialCalc.GetCurrentWorkBookControl();
    currentname = control.currentSheetButton.id; //predefined variable.replace id by name for fixed sheet.
    //alert(currentname);
    var savestrr = workBookObject.sheetArr[currentname].sheetstr.savestr;
    var res = SocialCalc.ConvertSaveToOtherFormat(savestrr, "csv", false);
    // alert(res);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {

                             //alert("fs");
                             fileSystem.root.getFile("VehicleMaintenance.csv", {create: true}, function(entry) {
                                                     var fileEntry = entry;
                                                     console.log(entry);

                                                     entry.createWriter(function(writer) {
                                                                        writer.onwrite = function(evt) {
                                                                        console.log("write success");

                                                                        //showEmailComposer(res,"csv");
                                                                        sendAttachmentCsv(res);
                                                                        };

                                                                        console.log("writing to file");


                                                                        writer.write( res );
                                                                        }, function(error) {alert('error1');
                                                                        console.log(error);
                                                                        });

                                                     }, function(error){alert('error2');
                                                     console.log(error);
                                                     });
                             },
                             function(event) { alert('error code');
                             console.log( evt.target.error.code );
                             });

}

function sendAttachmentCsv(content){
    cordova.require('emailcomposer.EmailComposer').show({
                                                        to: '',
                                                        cc: '',
                                                        bcc: '',
                                                        subject: 'Vehicle Maintenance',
                                                        body: content,
                                                        isHtml: true,
                                                        attachments: [
                                                                      // attach a HTML file using a UTF-8 encoded string
                                                                      {
                                                                      mimeType: 'text/csv',
                                                                      encoding: 'UTF-8',
                                                                      data: content,
                                                                      name: 'VehicleMaintenance.csv'
                                                                      }],

                                                        onSuccess: function (winParam) {
                                                        console.log('EmailComposer onSuccess - return code' + winParam.toString());

                                                        },
                                                        onError: function (error) {
                                                        console.log('EmailComposer onError - ' + error.toString());
                                                        }
                                                        });

}


function replaceImageUrl(inp)
{
    var out = inp;

    var ind = out.indexOf('<img src="checkmark.png">');
    while (ind != -1) {
        out = out.slice(0,ind)+"&#10004"+out.slice(ind+25);
        ind = out.indexOf('<img src="checkmark.png">', ind+20);
    }
    return out;
}



function showEmailComposer(body,type)
{
    var control = SocialCalc.GetCurrentWorkBookControl();
    var content;
    if(body == ""){
        content = control.workbook.spreadsheet.CreateSheetHTML();
        content = replaceImageUrl(content);
    }
    else{
        content = body;
    }
    //alert(content);

    cordova.require('emailcomposer.EmailComposer').show({
                                                        to: '',
                                                        cc: '',
                                                        bcc: '',
                                                        subject: 'Vehicle Maintenance',
                                                        body: content,
                                                        isHtml: true,
                                                        attachments: [
                                                                      // attach a HTML file using a UTF-8 encoded string
                                                                      {
                                                                      mimeType: 'text/html',
                                                                      encoding: 'UTF-8',
                                                                      data: content,
                                                                      name: 'VehicleMaintenance.html'
                                                                      },
                                                                      ],

                                                        onSuccess: function (winParam) {
                                                        console.log('EmailComposer onSuccess - return code' + winParam.toString());
                                                        if(body!="" && type == "pdf"){
                                                        if(winParam.toString() == 2){

                                                        updateItems();
                                                        }
                                                        }
                                                        },
                                                        onError: function (error) {
                                                        console.log('EmailComposer onError - ' + error.toString());
                                                        }
                                                        });

}

function updateItems(){


    if(!window.localStorage.getItem('inapplocal')){
        showAlert("Please purchase","Please click on the Purchase button to be able to generate and send CashReceipt as a Pdf file");
        return;
    }

    var products=JSON.parse(window.localStorage.getItem('inapplocal'));

    var itemConsumed=-1;

    for(var i=0;i<4;i++){

        if(products[i].Purchase=='Yes'){
            itemConsumed=i;

        }
    }
    var consumed=products[itemConsumed].Consumed;
    consumed++;

    if( consumed == products[itemConsumed].Own){
        products[itemConsumed].Purchase='No';
        products[itemConsumed].Consumed=0;
        products[itemConsumed].Own=0;
    }
    else{
        products[itemConsumed].Consumed=consumed;
    }

    var pdfLeft=parseInt(products[itemConsumed].Own)-parseInt(products[itemConsumed].Consumed);
    //alert(pdfLeft);
    if(pdfLeft > 0){
        showToast("You have "+pdfLeft+" Pdfs left");
        //alert("1");
    }
    else if(pdfLeft==0){
        showToast("You have "+pdfLeft+" Pdf left.Purchase again to continue sending Pdfs");
        // alert("2");
    }
    //alert("3");
    window.localStorage.setItem("inapplocal",JSON.stringify(products));
    //alert("4");
    console.log("product list updated: "+JSON.stringify(products));
    //alert("5");
    setCloudRestoreItems(JSON.stringify(products));


}



var item={};


item.init=function(){

    $.ajax({
           type: 'GET',
           url: 'http://aspiringapps.com/restore',
           data: {action:"getInapp",appname:applicationName},
           dataType: 'json',
           success: function(response) {

           result = response["result"];

           if(result == "no" || result == "fail"){

           var productList=[];
           productList.push({"Feature": "10Pdf","Id": "2017vhm10Pdf","Purchase":"No","Consumed":0,"Own":0 });
           productList.push({"Feature": "25Pdf","Id": "2017vhm25Pdf","Purchase":"No","Consumed":0,"Own":0 });
           productList.push({"Feature": "50Pdf","Id": "2017vhm50Pdf","Purchase":"No","Consumed":0,"Own":0 });
           productList.push({"Feature": "100Pdf","Id": "2017vhm100Pdf","Purchase":"No","Consumed":0,"Own":0});
           productList.push({"Feature": "fb-tw-sms-whatsapp","Id": "2017vhm10share","Purchase":"No","Consumed":0,"Own":0});
           productList.push({"Feature": "email-print-save","Id": "2017vhmSavePrintEmail","Purchase":"Yes","Consumed":0,"Own":5});
           productList.push({"Feature": "pdf-ibooks","Id": "2017vhmSavePdf","Purchase":"No","Consumed":0,"Own":0})
           productList.push({"Feature": "email-second-print-save","Id": "2017vhm500SavePrintEmail","Purchase":"No","Consumed":0,"Own":0});/*** 500 & 1000 times Save as, Print and Email ***/
           productList.push({"Feature": "email-third-print-save","Id": "2017vhm1000SavePrintEmail","Purchase":"No","Consumed":0,"Own":0});

           window.localStorage.setItem("inapplocal",JSON.stringify(productList));
           console.log("product list created: "+JSON.stringify(productList));
           var products = JSON.stringify(productList);
           setCloudRestoreItems(products);
           //alert(result);
           console.log("init:end");
           }
           else{
           //alert(result.own);

           window.localStorage.setItem("inapplocal",result);
           console.log("product list from server: "+result);

           //inapp updated in s3
           //alert(JSON.stringify(result));

           }


           },
           error: function(e) {
           //alert("No pdf returned");


           console.log("item.init Ajax failed "+JSON.stringify(e));
           }
           });



};

/*** 500 & 1000 times Save as, Print and Email ***/
var IAP = {
list: [ "2017vhm10Pdf", "2017vhm25Pdf", "2017vhm50Pdf","2017vhm100Pdf","2017vhm10share" ,"2017vhmCloud", "2017vhmSavePrintEmail" , "2017vhmSavePdf" , "2017vhm500SavePrintEmail", "2017vhm1000SavePrintEmail"]
};


item.getAllProducts=function(){

    IAP.load = function () {
        // Check availability of the storekit plugin

        //alert("IAP.load called");
        if (!window.storekit) {
            alert("In-app purchases not available");
            console.log("In-App Purchases not available");
            return;
        }

        // Initialize
        storekit.init({
                      debug:    true, // Enable IAP messages on the console
                      ready:    IAP.onReady,
                      purchase: IAP.onPurchase,
                      restore:  IAP.onRestore,
                      error:    IAP.onError
                      });
    };

    // StoreKit's callbacks (we'll talk about them later)
    IAP.onReady = function () {};
    IAP.onPurchase = function () {};
    IAP.onRestore = function () {};
    IAP.onError = function () {};

    IAP.onReady = function () {
        // Once setup is done, load all product data.
        // alert("IAP.onReady called");
        storekit.load(IAP.list, function (products, invalidIds) {
                      IAP.products = products;
                      IAP.loaded = true;
                      //renderIAPs(document.getElementById('in-app-purchase-list'));
                      for (var i = 0; i < invalidIds.length; ++i) {
                      console.log("Error: could not load " + invalidIds[i]);
                      }
                      });
    };

    IAP.load();

    var renderIAPs = function (el) {
        if (IAP.loaded) {
            //alert(IAP.loaded);
            var coins10  = IAP.products["2017vhm10Pdf"];
            var coins100 = IAP.products["2017vhm25Pdf"];
            var coins1000 = IAP.products["2017vhm50Pdf"];
            var coins10000 = IAP.products["2017vhm100Pdf"];
            //console.log("products are "+IAP.products);
            var html = "<ul>";
            console.log(IAP.list);
            //console.log(IAP.products);
            var index = 0;
            var buttonStyle = "display:inline-block; padding: 5px 20px; border: 1px solid black";
            for (var id in IAP.products) {
                var p = IAP.products[id];
                html += "<li>" +
                "<h3>" + p.title + "</h3>" +
                "<p>" + p.description + "</p>" +
                "<div style='" + buttonStyle + "' id='buy-" + index + "' productId='" + p.id + "' type='button'>" + p.price + "</div>" +
                "</li>";
                ++index;
            }
            html += "</ul>";
            html += "<div style='" + buttonStyle + "' id='restore'>RESTORE ALL</div>"
            el.innerHTML = html;
            while (index > 0) {
                --index;
                document.getElementById("buy-" + index).onclick = function (event) {
                    var pid = this.getAttribute("productId");
                    IAP.buy(pid);
                };
            }
            document.getElementById("restore").onclick = function (event) {
                IAP.restore();
            };
        }
        else {
            el.innerHTML = "In-App Purchases not available";
        }
    };

    IAP.buy = function (productId, callback) {
        //alert("buy called");
        IAP.purchaseCallback = callback;
        storekit.purchase(productId);
    };



}


item.successCallback=function(productId){
    console.log("purchasing.. "+productId);

    var products=JSON.parse(window.localStorage.getItem("inapplocal"));

    var currentItem=-1;
    var pdfLeft=-1;
    var pdfsRemaining=0;
    if(!window.localStorage.getItem('inapp')){

    }
    else{
        console.log("previous inapp purchase found");
        var previous = JSON.parse(window.localStorage.getItem('inapp'));
        if(previous[0].Val=='No'){
            console.log("Either no purchase or purchase exhausted");
        }
        else if(previous[0].Val=='Yes'){
            pdfLeft=parseInt(10)-parseInt(previous[0].Ctr);
            console.log("You have "+pdfLeft+" pdf left from previous update");
        }
        window.localStorage.removeItem('inapp');
    }

    switch(productId){
        case "2017vhm10Pdf" :
            products[0].Purchase="Yes";
            if(pdfLeft!=-1)  products[0].Own=parseInt(10)+parseInt(pdfLeft);
            else products[0].Own=10;
            currentItem=0;
            //alert(productId);
            break;

        case "2017vhm25Pdf" :
            products[1].Purchase="Yes";
            if(pdfLeft!=-1)  products[1].Own=parseInt(25)+parseInt(pdfLeft);
            else products[1].Own=25;
            currentItem=1;
            break;

        case "2017vhm50Pdf" :
            products[2].Purchase="Yes";
            if(pdfLeft!=-1)  products[2].Own=parseInt(50)+parseInt(pdfLeft);
            else products[2].Own=50;
            currentItem=2;
            break;

        case "2017vhm100Pdf" :
            products[3].Purchase="Yes";
            if(pdfLeft!=-1)  products[3].Own=parseInt(100)+parseInt(pdfLeft);
            else products[3].Own=100;
            currentItem=3;
            break;
        case "2017vhm10share":
            sharepdfSuccessCallback(productId);
            return;
        case "2017vhmCloud":

            cloudInappSuccess();
            return;
            
        case "2017vhmSavePrintEmail":  /*** 500 & 1000 times Save as, Print and Email ***/
            var left = 0;
            if(products[8].Purchase == "Yes"){
                left = parseInt(products[8].Own) - parseInt(products[8].Consumed);
                products[8].Consumed = 0;
                products[8].Own = 0;
                products[8].Purchase = "No";
            }
            if(products[7].Purchase == "Yes"){
                left = parseInt(left) + parseInt(products[7].Own) - parseInt(products[7].Consumed);
                products[7].Consumed = 0;
                products[7].Own = 0;
                products[7].Purchase = "No";
            }
            
            products[5].Purchase="Yes";
            left = parseInt(left) + parseInt(products[5].Own) - parseInt(products[5].Consumed);
            console.log("left from previous purchase: "+left);
            products[5].Own=parseInt(10)+parseInt(left);
            console.log("owned now: "+products[5].Own);
            products[5].Consumed = 0;
            
            
            
            break;
        case "2017vhm500SavePrintEmail":  /*** 500 & 1000 times Save as, Print and Email ***/
            
            var left = 0;
            if(products[5].Purchase == "Yes"){
                left = parseInt(products[5].Own) - parseInt(products[5].Consumed);
                products[5].Consumed = 0;
                products[5].Own = 0;
                products[5].Purchase = "No";
            }
            if(products[8].Purchase == "Yes"){
                left = parseInt(left) + parseInt(products[8].Own) - parseInt(products[8].Consumed);
                products[8].Consumed = 0;
                products[8].Own = 0;
                products[8].Purchase = "No";
            }
            
            
            products[7].Purchase="Yes";
            left = parseInt(left) + parseInt(products[7].Own) - parseInt(products[7].Consumed);
            console.log("left from previous purchase: "+left);
            products[7].Own=parseInt(500)+parseInt(left);
            console.log("owned now: "+products[7].Own);
            products[7].Consumed = 0;
            
            break;
        case "2017vhm1000SavePrintEmail":  /*** 500 & 1000 times Save as, Print and Email ***/
            var left = 0;
            if(products[5].Purchase == "Yes"){
                left = parseInt(products[5].Own) - parseInt(products[5].Consumed);
                products[5].Consumed = 0;
                products[5].Own = 0;
                products[5].Purchase = "No";
            }
            if(products[7].Purchase == "Yes"){
                left = parseInt(left) + parseInt(products[7].Own) - parseInt(products[7].Consumed);
                products[7].Consumed = 0;
                products[7].Own = 0;
                products[7].Purchase = "No";
            }
            
            products[8].Purchase="Yes";
            left = parseInt(left) + parseInt(products[8].Own) - parseInt(products[8].Consumed);
            console.log("left from previous purchase: "+left);
            products[8].Own=parseInt(1000)+parseInt(left);
            console.log("owned now: "+products[8].Own);
            products[8].Consumed = 0;
            break;
            
        case "2017vhmSavePdf":
            products[6].Purchase="Yes";
            var left = parseInt(products[6].Own) - parseInt(products[6].Consumed);
            console.log("left from previous purchase: "+left);
            products[6].Own=parseInt(10)+parseInt(left);
            console.log("owned now: "+products[6].Own);
            products[6].Consumed = 0;
            
            
            break;

    }

    window.localStorage.setItem("inapplocal",JSON.stringify(products));
    console.log("product list updated: "+JSON.stringify(products));
    window.localStorage.removeItem("inapp");
    ///showToast("Pull to refresh the products list");


    setCloudRestoreItems(JSON.stringify(products));
    purchaseInterval = true;



};

function sharepdfSuccessCallback(productId){
    //alert(productId);
    //$("#index-purchase").removeClass("ui-icon-shop").addClass("ui-icon-check");
    var products=JSON.parse(window.localStorage.getItem("inapplocal"));
    if(products[4].Id==productId){
        products[4].Purchase="Yes";
        products[4].Own=10;
    }
    window.localStorage.setItem("inapplocal",JSON.stringify(products));
    console.log("product list updated: "+JSON.stringify(products));
    setCloudRestoreItems(products);
    purchaseInterval = true;
}


///****/// Inapp purchase of save files to s3
function cloudInappSuccess(){



    $.ajax({
           type: 'POST',
           url: 'http://aspiringapps.com/webapp',
           data: {action:"purchase",appname:"Vehicle Maintenance"},
           dataType: 'json',
           success: function(response) {


           result = response["result"];
           if(result == "ok"){

           var products = JSON.parse(window.localStorage.getItem("cloudInapp"));
           products[0].Purchase = "Yes";
           var left = parseInt(products[0].Own) - parseInt(products[0].Consumed);
           products[0].Own = parseInt(10) + parseInt(left);
           products[0].Consumed = 0;
           purchaseInterval = true;

           console.log("purchase successful");
           console.log("product list updated"+JSON.stringify(products));

           window.localStorage.setItem("cloudInapp",JSON.stringify(products));
           purchaseInterval = true;


           }
           else{

           console.log("purchase unsuccessful");

           }

           },
           error: function(e) {
           //alert("No pdf returned");


           console.log("cloudInappSuccess: Ajax failed "+JSON.stringify(e));
           }
           });
}


function loadProducts(){
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    var conn = states[networkState];

    if(states[networkState] == 'No network connection'){
        showToast("No network connection.Connect and continue");
        return;
    }

    if(!IAP.loaded){
        item.getAllProducts();
    }

}


function setCloudRestoreItems(products){
    //alert(JSON.stringify(products));
    $.ajax({
           type: 'POST',
           url: 'http://aspiringapps.com/restore',
           data: {content:products,action:"inapp",appname:"Vehicle Maintenance"},
           dataType: 'json',
           success: function(response) {


           result = response["result"];
           if(result == "ok"){
           console.log("updated inapp items");
           //alert("done");
           }
           else{

           window.setTimeout(function(){

                //showToast("Please Login to access Vehicle Maintenance on web");

           },1000);


           }

           },
           error: function(e) {
           //alert("No pdf returned");


           console.log("setCloud:Ajax failed "+JSON.stringify(e));
           }
           });





}

function purchasePDF(id){
    if(!IAP.loaded){
        loadProducts();

    }
    if(!window.localStorage.getItem("inapplocal")) item.init();
    //alert(id);
    var products=JSON.parse(window.localStorage.getItem('inapplocal'));

    if(id == "2014cr10Pdf" || id == "2014cr25Pdf" || id == "2014cr50Pdf" || id == "2014cr100Pdf"){
        for(var i=0;i<products.length-1;i++){

            if(products[i].Purchase=='Yes'){
                return;
            }
        }
    }

    else if(id == "2015cr10share"){
        if(products[4].Purchase == "Yes")
            return;
    }
    else if(id == "2015crCloud"){
        var p = JSON.parse(window.localStorage.getItem('cloudInapp'));
        if(p[0].Purchase == "Yes")
            return;
    }

    ///alert(id);
    ActivityIndicator.show("Purchasing");
    window.setTimeout(function(){
                      ActivityIndicator.hide();
                      IAP.buy(id);
                      },2000);
}


function checkBeforeShare(){
    loadProducts();

    if(!window.localStorage.getItem("inapplocal")){
        item.init();
    }


    var products = JSON.parse(window.localStorage.getItem("inapplocal"));
    if(products[4].Purchase == "No"){
        navigator.notification.alert("Share Pdf via SMS, WhatsApp, Facebook and Twitter available.Click on Purchase Tab to continue",null,"Message as PDF");
        return;

    }
    else if(products[4].Purchase=="Yes" && products[4].Consumed<products[4].Own){
        //return true;
        shareCurrentPdf();

    }
    else{
        navigator.notification.alert("Share Pdf via SMS, WhatsApp, Facebook and Twitter available.Click on Purchase Tab to continue",null,"Message as PDF");
        return;
    }




}


function shareCurrentPdf(){
    var devicefind =getDeviceType();
    var onConfirm = function(buttonIndex){
        if(devicefind =="iPad" || devicefind =="default" || devicefind=="iPod"){
            if(buttonIndex == 1) buttonIndex =3;
            else if(buttonIndex ==2) buttonIndex =4;
            else if(buttonIndex ==3) buttonIndex =5;
        }
        if(buttonIndex == 5) return;
        else{
            var control = SocialCalc.GetCurrentWorkBookControl();

            var content = control.workbook.spreadsheet.CreateSheetHTML();
            //var content = getHtmlContentForApp(val);
            //content = replaceImageUrl(content);


            /*change for displaying the checkmark in pdf*/
            content = content.replace(/src="checkmark.png"/g,'src="http://img689.imageshack.us/img689/9234/checkmark.png"');

            ActivityIndicator.show("Generating url to share");
            var func=function(){
                $.ajax({
                       type: 'POST',
                       url: 'http://aspiringapps.com/htmltopdf',
                       data: {content:content},
                       dataType: 'json',
                       success: function(data) {
                       console.log(data["result"]);
                       ActivityIndicator.hide();
                       pdfurl = data["pdfurl"];

                       navigator.notification.alert("The url is "+pdfurl,null,"Share");
                       console.log("url: "+pdfurl);


                       if(buttonIndex==1){
                       //sms

                       window.plugins.socialsharing.shareViaSMS(pdfurl, null , function(msg) {
                                                                console.log('ok: ' + msg);
                                                                updateShareItem();
                                                                }, function(msg) {alert('error: ' + msg)});
                       }
                       else if(buttonIndex==2){
                       //whatsapp
                       window.plugins.socialsharing.shareViaWhatsApp('Message via WhatsApp', "www/img/bi.img" /* img */, pdfurl /* url */,
                                                                     function() {console.log('share ok');
                                                                     updateShareItem();
                                                                     }, function(errormsg){alert(errormsg)});

                       }

                       else if(buttonIndex==3){
                       window.plugins.socialsharing.shareViaFacebook('Message via Facebook', 'www/img/bi.png' /* img */, pdfurl /* url */, function() {
                                                                     console.log('share ok');
                                                                     updateShareItem();

                                                                     },
                                                                     function(errormsg){console.log(errormsg)});
                       }
                       else if(buttonIndex==4){
                       window.plugins.socialsharing.shareViaTwitter('Message via Twitter','www/img/bi.png',pdfurl);
                       updateShareItem();

                       }


                       },
                       error: function(e) {
                       //alert("No pdf returned");
                       console.log("No pdf returned");
                       }
                       });
            };
            window.setTimeout(func, 1000);
        }
    };
    var arr;

    if(devicefind=="iPad" || devicefind=="default" || devicefind=="iPod"){
        arr=['Facebook','Twitter','Cancel'];
    }
    else if(devicefind=="iPhone"){
        arr=['SMS','WhatsApp','Facebook','Twitter','Cancel'];
    }
    navigator.notification.confirm(
                                   'Share via', // message
                                   onConfirm,  // callback to invoke with index of button pressed
                                   'Share',   // title
                                   arr  // buttonLabels
                                   );

}

function updateShareItem(){
    var products=JSON.parse(window.localStorage.getItem('inapplocal'));

    var itemConsumed;
    for(i in products){
        if(products[i].Id == "2017vhm10share")
            itemConsumed = i;
    }

    var consumed=products[itemConsumed].Consumed;
    consumed++;

    if( consumed == products[itemConsumed].Own){
        products[itemConsumed].Purchase='No';
        products[itemConsumed].Consumed=0;
        products[itemConsumed].Own=0;
    }
    else{
        products[itemConsumed].Consumed=consumed;
    }

    var pdfLeft=parseFloat(products[itemConsumed].Own)-parseFloat(products[itemConsumed].Consumed);
    //alert(pdfLeft);
    if(pdfLeft>0){
        showToast("You can share "+pdfLeft+" times more");
    }
    else if(pdfLeft==0){
        showToast("You can share "+pdfLeft+" times more.Purchase again to continue sharing Pdfs");
    }
    window.localStorage.setItem("inapplocal",JSON.stringify(products));
    console.log("product list updated: "+JSON.stringify(products));
    setCloudRestoreItems(JSON.stringify(products));
}



var checkBeforeSend=function(val){
    //loadProducts();
    
    
    if(!window.localStorage.getItem('inapplocal')){
        item.init();
        
    }
    
    var products=JSON.parse(window.localStorage.getItem('inapplocal'));
    console.log(JSON.stringify(products));
    var itemAvailable=-1;
    
    for(var i=0;i<4;i++){
        
        if(products[i].Purchase=='Yes' && (products[i].Consumed<=products[i].Own)){
            itemAvailable=i;
        }
        
    }
    if(itemAvailable==-1){
        //showAlert("Email Locked","Please Purchase to send Pdf");
        navigator.notification.alert("Email as Pdf Available.Click on Purchase Tab to continue",null,"Purchase","Ok");
        return;
        
    }
    console.log("purchased: "+products[itemAvailable].Feature);
    
    if(products[itemAvailable].Consumed <= products[itemAvailable].Own){
        exportPDF(val);
        //return true;
        
    }
    else if(products[itemAvailable].Consumed == products[itemAvailable].Own){
        showAlert("Limit Reached","Please purchase again");
        return;
    }
};

function exportPDF(val){
    //
    var control = SocialCalc.GetCurrentWorkBookControl();
    ActivityIndicator.show("Generating PDF");
    var content = '';
    if(val == 1){
        content = control.workbook.spreadsheet.CreateSheetHTML();
    }
    else {
        var appsheets = {}; var devicefind = getDeviceType();
        if(devicefind == "iPad" || devicefind == "default"){
            appsheets= {sheet1:"sheet1", sheet2:"sheet2", sheet3:"sheet3", sheet4:"sheet4", sheet5:"sheet5"};
        }
        else if(devicefind == "iPhone" || devicefind == "iPod"){
            appsheets= {sheet1:"sheet1", sheet2:"sheet2", sheet3:"sheet3", sheet4:"sheet4"};
        }
        
        content = SocialCalc.WorkbookControlCreateSheetHTML(appsheets);
    }
    // var content = getHtmlContentForApp(val);
    content = content.replace(/src="checkmark.png"/g,'src="http://img689.imageshack.us/img689/9234/checkmark.png"');

    $.ajax({
           type: 'POST',
           url: 'http://aspiringapps.com/htmltopdf',
           data: {content:content},
           dataType: 'json',
           success: function(data) {
           console.log(data["result"]);

           pdfurl = data["pdfurl"];
           ActivityIndicator.hide();
           showEmailComposer(pdfurl,"pdf");
           //alert(pdfurl)
           console.log("url: "+pdfurl);
           //ActivityIndicator.hide();

           },
           error: function(e) {
           //alert("No pdf returned");
           ActivityIndicator.hide();

           console.log("No pdf returned");
           }
           });

}


function checkBeforeSave(file){
    //loadProducts();

    if(!window.localStorage.getItem("cloudInapp")){
        return;
    }

    var products = JSON.parse(window.localStorage.getItem("cloudInapp"));
    if(products[0].Purchase == "Yes"){
        saveToWeb(file);
    }
    else{
        navigator.notification.alert("Save as exhausted.Kindly purchase by clicking on the Purchase Tab",null,"Save as to web");

    }
}


function saveToWeb(file){

    var fname;

    if(file != ""){
        fname = file;
    }
    else{

        function onPrompt(results){
            if(results.buttonIndex == 1) {clearInterval(interval); return;}
            fname = results.input1;
        }

        navigator.notification.prompt(
                                      'Please enter the filename',  // message
                                      onPrompt,                  // callback to invoke
                                      'Save as',            // title
                                      ['Cancel','Done'],             // buttonLabels
                                      ''                 // defaultText
                                      );


    }

    var interval = setInterval(function(){

                               if(!fname){
                               console.log("in the interval");
                               }
                               else{
                               console.log("name found");
                               //alert(fname);
                               clearInterval(interval);


                               var val = SocialCalc.WorkBookControlSaveSheet();
                               console.log(val.length);
                               var val1 = encodeURIComponent(val);
                               console.log(val1.length);



                               var messages={};
                               messages.url='http://aspiringapps.com/webapp';
                               messages.type="GET";
                               messages.format = 'json';
                               messages.data={action:"login"};

                               request(messages, function(result){
                                       //alert("result:"+result);
                                       if(result == "fail") {
                                       //showToast("Login required.Please log in and continue");

                                       return false;
                                       }
                                       else if(result == "ok"){

                                       console.log("logged in");
                                       console.log("logged in can continue");


                                       var message={};
                                       message.url='http://aspiringapps.com/webapp';
                                       message.type="POST";
                                       message.format = 'json';
                                       message.data={action:"savefile",fname:fname,data:val1,appname:"Vehicle Maintenance"};

                                       //$scope.chk = "false";
                                       ActivityIndicator.show("Saving..");
                                       request(message,function(result){
                                               //alert(result);
                                               if(result == "ok"){
                                               showToast("File "+fname+" successfully saved");

                                               updateCloudInapp();

                                               //$scope.chk= "true";
                                               ActivityIndicator.hide();
                                               }
                                               else{
                                               showToast("File "+fname+" is not saved.Try again");
                                               //$scope.chk = "true";
                                               ActivityIndicator.hide();
                                               }

                                               });




                                       }

                                       });


                               }
                               },100);



}

function updateCloudInapp(){
    var message={};
    message.url='http://aspiringapps.com/webapp';
    message.type="POST";
    message.format = 'json';
    message.data={action:"update",appname:"Vehicle Maintenance"};


    request(message,function(result){
            //alert(result);
            if (result == "ok") {


            var products=JSON.parse(window.localStorage.getItem('cloudInapp'));

            var itemConsumed=0;

            var consumed=products[itemConsumed].Consumed;
            consumed++;

            if( consumed == products[itemConsumed].Own){
            products[itemConsumed].Purchase='No';
            products[itemConsumed].Consumed=0;
            products[itemConsumed].Own=0;
            }
            else{
            products[itemConsumed].Consumed=consumed;
            }

            var pdfLeft=parseFloat(products[itemConsumed].Own)-parseFloat(products[itemConsumed].Consumed);
            //alert(pdfLeft);
            if(pdfLeft>0){
            showToast("You can save "+pdfLeft+" files more");
            }
            else if(pdfLeft==0){
            showToast("You can save "+pdfLeft+" files.Purchase again to continue saving files");
            }

            window.localStorage.setItem("cloudInapp",JSON.stringify(products));
            console.log("cloudInapp product list updated: "+JSON.stringify(products));

            }

            else{
            console.log("update counter failed");

            }
            });

}

function request(message,callback){
    $.ajax({
           type: message.type,
           url: message.url,
           data: message.data,
           dataType: message.format,
           success: function(response) {
           result = response["result"];
           // alert( result);
           callback(result);
           },
           error: function(e) {
           //alert("No pdf returned");
           console.log(JSON.stringify(e));
           }
           });

}



function loadWebsite(){

    var ref = window.open('http://aspiringapps.com', '_blank', 'location=yes');

}

function showFeedback(){
    cordova.require('emailcomposer.EmailComposer').show({
                                                        to: 'marketing@tickervalue.com',
                                                        cc: '',
                                                        bcc: '',
                                                        subject: 'Vehicle Maintenance: Please share your feedback',
                                                        body: '',
                                                        isHtml: true,
                                                        onSuccess: function (winParam) {
                                                        console.log('EmailComposer onSuccess - return code ' + winParam.toString());
                                                        },
                                                        onError: function (error) {
                                                        console.log('EmailComposer onError - ' + error.toString());
                                                        }
                                                        });

}
function refer(){

    var onConfirm = function(buttonIndex){
        if(buttonIndex == 4) return;

        else if(buttonIndex ==1){
            //facebook

            window.plugins.socialsharing.shareViaFacebook('Manage finance for your business using Vehicle Maintenance', 'www/img/bi.png' /* img */, 'https://itunes.apple.com/us/app/business-ledger-pro/id515667725?ls=1&mt=8' /* url */, function() {
                                                          console.log('share ok');
                                                          },
                                                          function(errormsg){console.log(errormsg)});

        }
        else if(buttonIndex ==2){
            //twitter

            window.plugins.socialsharing.shareViaTwitter('Manage finance for your business using Vehicle Maintenance','www/img/bi.png','https://itunes.apple.com/us/app/business-ledger-pro/id515667725?ls=1&mt=8');
        }

        else if(buttonIndex ==3){
            //twitter

            cordova.require('emailcomposer.EmailComposer').show({
                                                                to: '',
                                                                cc: '',
                                                                bcc: '',
                                                                subject: 'Vehicle Maintenance',
                                                                body: 'Manage finance for your business using Vehicle Maintenance \n https://itunes.apple.com/us/app/business-ledger-pro/id515667725?ls=1&mt=8',
                                                                isHtml: true,
                                                                onSuccess: function (winParam) {
                                                                console.log('EmailComposer onSuccess - return code ' + winParam.toString());
                                                                },
                                                                onError: function (error) {
                                                                console.log('EmailComposer onError - ' + error.toString());
                                                                }
                                                                });

        }


    };


    navigator.notification.confirm(
                                   'Refer Vehicle Maintenance via', // message
                                   onConfirm,  // callback to invoke with index of button pressed
                                   'Refer to a friend',   // title
                                   ['Facebook','Twitter','Email','Cancel']  // buttonLabels
                                   );


}


var purchaseInterval = false;





window.addEventListener('orientationchange', function(){
                        
                        switch(window.orientation){
                        case -90:
                        case 90:
                        //alert('landscape');
                        var ele = document.getElementById('te_griddiv');
                        ele.style.height= "1600px";
                        console.log('landscape');
                        break;
                        default:
                        //alert('portrait');
                        var ele = document.getElementById('te_griddiv');
                        ele.style.height= "1600px";
                        console.log('portrait');
                        break;
                        }
                        });


function checkBeforeSaveToDropbox(val){
    if(!window.localStorage.getItem('inapplocal')){
        item.init();
        
    }
    
    var products=JSON.parse(window.localStorage.getItem('inapplocal'));
    console.log(JSON.stringify(products));
    var itemAvailable=-1;
    
    for(var i=0;i<4;i++){
        
        if(products[i].Purchase=='Yes' && (products[i].Consumed<=products[i].Own)){
            itemAvailable=i;
        }
        
    }
    if(itemAvailable==-1){
        //showAlert("Email Locked","Please Purchase to send Pdf");
        navigator.notification.alert("Email as Pdf Available.Click on Purchase Tab to continue",null,"Purchase","Ok");
        return;
        
    }
    console.log("purchased: "+products[itemAvailable].Feature);
    
    if(products[itemAvailable].Consumed <= products[itemAvailable].Own){
        saveToDropbox(val);
    }
    else if(products[itemAvailable].Consumed == products[itemAvailable].Own){
        showAlert("Limit Reached","Please purchase again");
        return;
    }
}

function saveToDropbox(val){
    
    
    var checksuccess = function() {
        // alert("success");
        var control = SocialCalc.GetCurrentWorkBookControl();
        ActivityIndicator.show("Generating PDF");
        var content = '';
        if(val == 1){
            content = control.workbook.spreadsheet.CreateSheetHTML();
        }
        else {
            var appsheets = {}; var devicefind = getDeviceType();
            if(devicefind == "iPad" || devicefind == "default"){
                appsheets= {sheet1:"sheet1", sheet2:"sheet2", sheet3:"sheet3", sheet4:"sheet4", sheet5:"sheet5"};
            }
            else if(devicefind == "iPhone" || devicefind == "iPod"){
                appsheets= {sheet1:"sheet1", sheet2:"sheet2", sheet3:"sheet3", sheet4:"sheet4"};
            }
            
            content = SocialCalc.WorkbookControlCreateSheetHTML(appsheets);
        }
        // var content = getHtmlContentForApp(val);
        content = content.replace(/src="checkmark.png"/g,'src="http://img689.imageshack.us/img689/9234/checkmark.png"');
        
        $.ajax({
               type: 'POST',
               url: 'http://aspiringapps.com/htmltopdf',
               data: {content:content},
               dataType: 'json',
               success: function(data) {
               console.log(data["result"]);
               
               pdfurl = data["pdfurl"];
               ActivityIndicator.hide();
               
               var identifier = pdfurl.split("=");
               identifier = identifier[1];
               var pdf_name = '';
               function onPrompt(results){
               if(results.buttonIndex == 1){
               pdf_name = "VehicleMaintenance"+identifier;
               }
               else{
               pdf_name = results.input1;
               
               }
               
               continueSaving(pdf_name);
               }
               
               navigator.notification.prompt(
                                             'Please enter the name of the pdf',  // message
                                             onPrompt,                  // callback to invoke
                                             'PDF Name',            // title
                                             ['Cancel','Done'],             // buttonLabels
                                             ''                 // defaultText
                                             );
               
               
               function continueSaving(name){
               navigator.notification.alert("Pdf successfully generated",function(){
                                            // showToast("Copied to clipboard");
                                            
                                            var callwrite = function() {
                                            
                                            var writesuccess = function(){
                                            
                                            navigator.notification.alert("PDF link saved to Dropbox in file "+name+".txt",null,"PDF");
                                            // showToast("Copied to clipboard");
                                            updateItems();
                                            
                                            };
                                            var writefailure = function(){
                                            showToast("File could not be saved to Dropbox ");
                                            
                                            };
                                            var promise = dropbox.writeString("/PDFs/"+name+".txt",pdfurl);
                                            promise.done(writesuccess);
                                            promise.fail(writefailure);
                                            };
                                            var promise0 = dropbox.createFile("/PDFs/"+name+".txt");
                                            promise0.always(callwrite);
                                            
                                            
                                            
                                            },"PDF","Continue");
               }
               
               
               
               
               
               },
               error: function(e) {
               //alert("No pdf returned");
               ActivityIndicator.hide();
               
               console.log("No pdf returned");
               }
               });
        
        
    };
    
    var checkfailure = function() {
        // alert("failure");
        navigator.notification.alert("Login to dropbox to continue.",null,"Dropbox failure","Ok");
        return;
        
    };
    
    var promise = dropbox.checkLink();
    promise.done(checksuccess);
    promise.fail(checkfailure);
}



function changeTemplate(val){
    
    
    var pathname = window.location.pathname;
    var appLocation = pathname.split("www");
    var temp=''; var parent_folder='';
    var device = getDeviceType();
    if(device == "iPad" || device == "default"){
        parent_folder = "apps-ipad";
        if(val == 1){
            temp = "app-default";
        }
        else{
            temp = "app-checkbook";
        }
    }
    else{
        return;
    }
    // alert(appLocation[0]+"www/"+parent_folder+"/"+temp+".html");
    
    $.ajax({
           type:'GET',
           url:appLocation[0]+"www/"+parent_folder+"/"+temp+".html",
           async:false,
           success:function(result){
           
           
           SocialCalc.Constants.defaultImagePrefix = "lib/aspiring/images/sc-";
           SocialCalc.Constants.defaultGridCSS = "";
           SocialCalc.Constants.SCNoColNames = true;
           SocialCalc.Constants.SCNoRowName = true;
           SocialCalc.Constants.defaultRownameStyle = "";
           SocialCalc.Constants.defaultSelectedRownameStyle = "";
           SocialCalc.Popup.imagePrefix = "lib/aspiring/images/sc-";
           
           
           spreadsheet = new SocialCalc.SpreadsheetControl();
           
           
           
           workbook = new SocialCalc.WorkBook(spreadsheet);
           workbook.InitializeWorkBook("sheet1");
           
           spreadsheet.InitializeSpreadsheetControl("tableeditor",0,0,0);
           spreadsheet.ExecuteCommand('redisplay', '');
           
           
           workbookcontrol = new SocialCalc.WorkBookControl(workbook,"workbookControl","sheet1");
           workbookcontrol.InitializeWorkBookControl();
           
           SocialCalc.WorkBookControlLoad(result);
           var ele = document.getElementById('te_griddiv');
           ele.style.height= "1000px";
           selectedFile = "default";
           
           spreadsheet.DoOnResize();
           
           },
           error:function(){
           console.log("cannot find app");
           
           }
           });
    
}


function checkIfCustomTemplate(file){
    
    var control = SocialCalc.GetCurrentWorkBookControl();
    var editor = control.workbook.spreadsheet.editor;
    var currentsheet= control.currentSheetButton.id;
    //var wval = editor.workingvalues;
    var devicefind = getDeviceType();
    var workBookObject = JSON.parse(SocialCalc.WorkBookControlSaveSheet());
    
    var savestrr = workBookObject.sheetArr["sheet1"].sheetstr.savestr;
    var cr, cell,str;
    
    var sheet = new SocialCalc.Sheet();
    sheet.ParseSheetSave(savestrr);
    var row = 1;
    var col = 2;
    cr = SocialCalc.crToCoord(col, row);
    cell = sheet.GetAssuredCell(cr);
    str = cell.datavalue;
    if(str){
        str = str.toLowerCase();
    }
        
    
    console.log("Returning: "+str);
    return str;
    
}

/***************************** save to ibooks ***************************/


function saveToDevice(){
    // loadProducts();
    
    if(!window.localStorage.getItem("inapplocal")) item.init();
    
    var products=JSON.parse(window.localStorage.getItem('inapplocal'));
    //console.log(JSON.stringify(products));
    var itemAvailable=-1;
    
    
    
    if(products[6].Purchase=='Yes' && (products[6].Consumed<=products[6].Own)){
        itemAvailable=6;
    }
    
    
    if(itemAvailable==-1){
        //showAlert("Email Locked","Please Purchase to send Pdf");
        var onConfirm = function(buttonIndex){
            if(buttonIndex == 1) return;
            else{
                IAP.buy("2017vhmSavePdf")
            }
            
        };
        
        navigator.notification.confirm(
                                       'Save as PDF in iBooks and Evernote available.Download Evernote before purchase.', // message
                                       onConfirm,            // callback to invoke with index of button pressed
                                       'Purchase',           // title
                                       ['Cancel','Ok']         // buttonLabels
                                       );
        
        
        return;
        
    }
    console.log("purchased: "+products[itemAvailable].Feature);
    
    if(products[itemAvailable].Consumed <= products[itemAvailable].Own){
        savePDF();
    }
    else if(products[itemAvailable].Consumed == products[itemAvailable].Own){
        showAlert("Limit Reached","Please purchase again");
    }
    
}

function savePDF(){
    
    showToast("Generating PDF..");
    
    var incrementCounter = function(){
        
        var products=JSON.parse(window.localStorage.getItem('inapplocal'));
        
        var itemConsumed=6;
        
        var consumed=products[itemConsumed].Consumed;
        consumed++;
        
        if( consumed == products[itemConsumed].Own){
            products[itemConsumed].Purchase='No';
            products[itemConsumed].Consumed=0;
            products[itemConsumed].Own=0;
        }
        else{
            products[itemConsumed].Consumed=consumed;
        }
        
        var pdfLeft=parseFloat(products[itemConsumed].Own)-parseFloat(products[itemConsumed].Consumed);
        //alert(pdfLeft);
        if(pdfLeft>0){
            showToast("You can save "+pdfLeft+" PDF more");
        }
        else if(pdfLeft==0){
            showToast("You can save "+pdfLeft+" PDF more.Purchase again to continue sharing Pdfs");
        }
        window.localStorage.setItem("inapplocal",JSON.stringify(products));
        console.log("product list updated: "+JSON.stringify(products));
        setCloudRestoreItems(JSON.stringify(products));
        
        
    };
    
    var control = SocialCalc.GetCurrentWorkBookControl();
    
    var content = control.workbook.spreadsheet.CreateSheetHTML();
    
    
    
    /*change for displaying the checkmark in pdf*/
    content = content.replace(/src="checkmark.png"/g,'src="http://img689.imageshack.us/img689/9234/checkmark.png"');
    
    
    var success = function(status) {
        console.log('Message: ' + status);
        incrementCounter();
    }
    
    var error = function(status) {
        console.log('Error: ' + status);
    }
    
    window.html2pdf.create(
                           ""+content+"",
                           "~/Documents/VehicleMaintenance.pdf", // on iOS,
                           // "test.pdf", on Android (will be stored in /mnt/sdcard/at.modalog.cordova.plugin.html2pdf/test.pdf)
                           success,
                           error
                           );
}

function updateCounter(){
    
    var products=JSON.parse(window.localStorage.getItem('inapplocal'));
    
    var itemConsumed=5;
    /*** 500 & 1000 times Save as, Print and Email ***/
    if(products[5].Purchase == "Yes" && products[5].Consumed <= products[5].Own){ itemConsumed = 5; }
    else if(products[7].Purchase == "Yes" && products[7].Consumed <= products[7].Own){ itemConsumed = 7; }
    else if(products[8].Purchase == "Yes" && products[8].Consumed <= products[8].Own){ itemConsumed = 8; }
    else{
        return;
    }
    
    var consumed=products[itemConsumed].Consumed;
    consumed++;
    
    if( consumed == products[itemConsumed].Own){
        products[itemConsumed].Purchase='No';
        products[itemConsumed].Consumed=0;
        products[itemConsumed].Own=0;
    }
    else{
        products[itemConsumed].Consumed=consumed;
    }
    
    
    var left=parseInt(products[itemConsumed].Own)-parseInt(products[itemConsumed].Consumed);
    if(left <= 3){
        navigator.notification.alert("You have limited number of times remaining for doing Save as ,Print and Email.Kindly buy from Purchase tab",null,"10 times Save as,Print and Email");
    }
    //alert(pdfLeft);
    window.localStorage.setItem("inapplocal",JSON.stringify(products));
    //alert("4");
    console.log("product list updated: "+JSON.stringify(products));
    //alert("5");
    setCloudRestoreItems(JSON.stringify(products));
    
}

function checkBeforeUse(feature,name){
    if(!window.localStorage.getItem('inapplocal')){
        item.init();
    }
    /*** 500 & 1000 times Save as, Print and Email ***/
    var products=JSON.parse(window.localStorage.getItem('inapplocal'));
    console.log(JSON.stringify(products));
    var itemAvailable= -1;
    
    
    if(products[5].Purchase == "Yes" && products[5].Consumed <= products[5].Own) {
        itemAvailable =5;
        console.log("purchased: "+products[itemAvailable].Feature);
    }
    else if(products[7].Purchase == "Yes" && products[7].Consumed <= products[7].Own) {
        itemAvailable =7;
        console.log("purchased: "+products[itemAvailable].Feature);
    }
    else if(products[8].Purchase == "Yes" && products[8].Consumed <= products[8].Own) {
        itemAvailable =8;
        console.log("purchased: "+products[itemAvailable].Feature);
    }
    
    else{
        navigator.notification.alert("You have exceeded Email, Print and Save as.To continue using the feature, please click on In-app Purchase Tab and purchase",null,"Email, Print and Save as");
        return;
    }
    
    if(feature == "email"){
        
        var control = SocialCalc.GetCurrentWorkBookControl();
        var content = control.workbook.spreadsheet.CreateSheetHTML();
        content = replaceImageUrl(content);
        
        
        cordova.require('emailcomposer.EmailComposer').show({
                                                            to: '',
                                                            cc: '',
                                                            bcc: '',
                                                            subject: 'Vehicle Maintenance',
                                                            body: content,
                                                            isHtml: true,
                                                            
                                                            onSuccess: function (winParam) {
                                                            console.log('EmailComposer onSuccess - return code' + winParam.toString());
                                                            if(winParam.toString() == 2){
                                                            updateCounter();
                                                            }
                                                            },
                                                            onError: function (error) {
                                                            console.log('EmailComposer onError - ' + error.toString());
                                                            }
                                                            });
        
    }
    else if(feature == "print"){
        showPrintDialog();
    }
    else if(feature == "save"){
        return saveAsOk(name);
    }
    else if(feature == "emailWorkbook"){
        var control = SocialCalc.GetCurrentWorkBookControl();
        var devicefind = getDeviceType();
        var appsheets = {}; var sheetdata='';
        
        
        if(devicefind == "iPad" || devicefind == "default"){
            sheetdata = JSON.parse(document.getElementById("sheetdata").value);
        }
        else if(devicefind == "iPhone" || devicefind == "iPod"){
            sheetdata = JSON.parse(document.getElementById("sheetdata1").value);
        }
        
        for(var i=1; i<= sheetdata.numsheets;i++){
            var key = "sheet"+i;
            appsheets[key] = key;
        }
        
        //alert(JSON.stringify(appsheets));
        var content = SocialCalc.WorkbookControlCreateSheetHTML(appsheets);
        content = replaceImageUrl(content);
        //console.log(content);
        
        cordova.require('emailcomposer.EmailComposer').show({
                                                            to: '',
                                                            cc: '',
                                                            bcc: '',
                                                            subject: 'Vehicle Maintenance Workbook',
                                                            body: content,
                                                            isHtml: true,
                                                            attachments: [{
                                                                          mimeType: 'text/html',
                                                                          encoding: 'UTF-8',
                                                                          data: content,
                                                                          name: 'VehicleMaintenance.html'
                                                                          }],
                                                            
                                                            onSuccess: function (winParam) {
                                                            console.log('EmailComposer onSuccess - return code' + winParam.toString());
                                                            if(winParam.toString() == 2){
                                                            updateCounter();
                                                            }
                                                            },
                                                            onError: function (error) {
                                                            console.log('EmailComposer onError - ' + error.toString());
                                                            }
                                                            });
    }
    
    
}


document.addEventListener("deviceready", function(){
                          if(!window.localStorage.getItem("inapplocal")) { item.init(); };
                          var products = JSON.parse(window.localStorage.getItem("inapplocal"));
                          var saveEmail;var yearlySaveEmail;var savePdf;var secondSaveEmail;var thirdSaveEmail;
                          
                          /*** 500 & 1000 times Save as, Print and Email ***/
                          
                          for(i in products){
                          if(products[i].Id == "2017vhmSavePrintEmail"){
                          console.log("saveEmail present");
                          saveEmail=true;
                          }
                          if(products[i].Id == "2017vhmSavePdf"){
                          console.log("savePdf present");
                          savePdf=true;
                          }
                          if(products[i].Id == "2017vhm500SavePrintEmail"){
                          console.log("secondSaveEmail present");
                          secondSaveEmail=true;
                          }
                          if(products[i].Id == "2017vhm1000SavePrintEmail"){
                          console.log("thirdSaveEmail present");
                          thirdSaveEmail=true;
                          }
                          
                          }
                          
                          
                          if(!saveEmail){
                          products.push({"Feature": "email-print-save","Id": "2017vhmSavePrintEmail","Purchase":"Yes","Consumed":0,"Own":10});
                          console.log("new "+JSON.stringify(products));
                          window.localStorage.setItem("inapplocal",  JSON.stringify(products));
                          setCloudRestoreItems(JSON.stringify(products));
                          }
                          
                          if(!savePdf){
                          products.push({"Feature": "pdf-ibooks","Id": "2017vhmSavePdf","Purchase":"No","Consumed":0,"Own":0});
                          console.log("new "+JSON.stringify(products));
                          window.localStorage.setItem("inapplocal",  JSON.stringify(products));
                          setCloudRestoreItems(JSON.stringify(products));
                          }
                          
                          if(!secondSaveEmail){
                          products.push({"Feature": "email-second-print-save","Id": "2017vhm500SavePrintEmail","Purchase":"No","Consumed":0,"Own":0});
                          console.log("new "+JSON.stringify(products));
                          window.localStorage.setItem("inapplocal",  JSON.stringify(products));
                          setCloudRestoreItems(JSON.stringify(products));
                          }
                          
                          if(!thirdSaveEmail){
                          products.push({"Feature": "email-third-print-save","Id": "2017vhm1000SavePrintEmail","Purchase":"No","Consumed":0,"Own":0});
                          console.log("new "+JSON.stringify(products));
                          window.localStorage.setItem("inapplocal",  JSON.stringify(products));
                          setCloudRestoreItems(JSON.stringify(products));
                          }
                          
                          else{
                          console.log("Returning!");
                          return;
                          }
                          
                          
                          },false);

function sortFunction(col){
    var devicefind = getDeviceType();
    var control = SocialCalc.GetCurrentWorkBookControl();
    var editor = control.workbook.spreadsheet.editor;
    var cmdline = '';
    var currentsheet = control.currentSheetButton.id;
    
    var check = checkIfCustomTemplate('');
    
    if(check == '' && devicefind == "iPad"){
        showToast("Data can be sorted only in Checkbook Register")
        return;
    }
    else if(check != '' && devicefind == "iPad"){
        
        cmdline = 'sort B5:H37 B up';
        editor.EditorScheduleSheetCommands(cmdline, true, false);
        
        for(var i= 6;i<= 36; i=i+2){
            cmdline = "set B"+i+":H"+i+" bgcolor rgb(221,221,221)";
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }
        for(var i=5;i<= 37; i=i+2){
            cmdline = "set B"+i+":H"+i+" bgcolor rgb(255,255,255)";
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }
        
    }
    
    if(devicefind == "iPhone" || devicefind == "iPod"){
        cmdline = 'sort B5:H30 B up';
        editor.EditorScheduleSheetCommands(cmdline, true, false);
        
        for(var i= 5;i<= 29; i=i+2){
            cmdline = "set B"+i+":H"+i+" bgcolor rgb(221,221,221)";
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }
        for(var i=6;i<= 30; i=i+2){
            cmdline = "set B"+i+":H"+i+" bgcolor rgb(255,255,255)";
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }
    }

    
}



function renameCallback(result){
    var check = checkIfCustomTemplate('');
    if(check == ''){
        check = "home";
    }
    // alert(check);
    var index = result.index;
    var newname = result.newname;
    newname = newname.trim();
    var footerObj = {};
    
    if(!window.localStorage.getItem("rename")){
        footerObj[check]= [];
        footerObj[check].push({"index":index, "name": newname});
        
        window.localStorage.setItem("rename",JSON.stringify(footerObj));
        console.log("created rename json object.. "+check+", "+JSON.stringify(footerObj));
        return true;
    }
    else{
        var footerObj = JSON.parse(window.localStorage.getItem("rename"));
        console.log("footerObj is: "+JSON.stringify(footerObj));
        var footers = footerObj[check];
        if(!footers){
            footerObj[check]= [];
            footerObj[check].push({"index":index, "name": newname});
            
            window.localStorage.setItem("rename",JSON.stringify(footerObj));
            console.log("created rename json object for .. "+check+", "+JSON.stringify(footerObj));
            return true;
        }
        else{
            console.log("footers are: "+JSON.stringify(footers));
            for(var i in footers){
                console.log(footers[i].index, index);
                if(footers[i].index == index){
                    footers[i].name = newname;
                    window.localStorage.setItem("rename",JSON.stringify(footerObj));
                    console.log("rename updated: "+JSON.stringify(footerObj));
                    return true;
                    
                }
                
            }
            footers.push({"index":index, "name": newname});
            window.localStorage.setItem("rename",JSON.stringify(footerObj));
            console.log("rename updated: "+JSON.stringify(footerObj));
            return true;
        }
    }
    
}




function passwordProtectionProcess(){
    
    if(!window.localStorage.getItem('inapplocal')){
        item.init();
    }
    
    var products=JSON.parse(window.localStorage.getItem('inapplocal'));
    
    var itemAvailable=-1;
    if(products[5].Purchase == "Yes" && products[5].Consumed <= products[5].Own){
        itemAvailable =5;
        console.log(JSON.stringify(products));
        console.log("purchased: "+products[itemAvailable].Feature);
    }
    else{
        navigator.notification.alert("Kindly purchase 5 times Save as, Print and Email to continue ",null, "Save as, Print and Email");
        return;
    }
    
    
    var filename, password;
    navigator.notification.prompt(
                                  'Enter filename',
                                  function(results){
                                  if(results.buttonIndex == 1) return;
                                  filename = results.input1;
                                  
                                  navigator.notification.prompt(
                                                                'Enter password',
                                                                function(result){
                                                                if(result.buttonIndex == 1) return;
                                                                password = result.input1;
                                                                
                                                                //Email // Password
                                                                var sheetsave = SocialCalc.WorkBookControlSaveSheet();
                                                                sheetsave = JSON.parse(sheetsave);
                                                                sheetsave["password"] = password;
                                                                var val = JSON.stringify(sheetsave);
                                                                var val1 = encodeURIComponent(val);
                                                                window.localStorage.setItem(filename, val1);
                                                                updateCounter();
                                                                
                                                                },
                                                                'Password Protection',
                                                                ['Cancel', 'Ok'],
                                                                ''
                                                                );
                                  },
                                  'Password Protection',
                                  ['Cancel', 'Ok'],
                                  ''
                                  );
}



