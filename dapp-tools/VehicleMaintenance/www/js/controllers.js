angular.module('starter.controllers', [])

.controller('ListCtrl', function($scope ,LocalFiles ,$state, $ionicActionSheet, $timeout, $ionicPopup) {
   $scope.files = LocalFiles.all();
            
   $scope.data = {
            showDelete: false
   };
            
   $scope.doRefresh = function(){
            console.log('Refreshing!');
            
            $scope.files = LocalFiles.all();
            
            
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
   };
            
    $scope.delete = function(file){
            
            if(file == "default"){
            navigator.notification.alert("Cannot delete default file!",null,"Delete","Done");
            return false;
            }
            else{
            var filedata = JSON.parse(decodeURIComponent(window.localStorage.getItem(file)));
            passwordObject = filedata["password"];
            if (!passwordObject){
            
            var confirmPopup = $ionicPopup.confirm({
                                                   title: 'Delete',
                                                   template: 'Are you sure you want to delete file '+file+' ?'
                                                   });
            confirmPopup.then(function(res) {
                              if(res) {
                              console.log('You are sure');
                              console.log("Removing: "+file);
                              window.localStorage.removeItem(file);
                              $scope.doRefresh();
                              
                              } else {
                              console.log('You are not sure');
                              }
                              });
            
            }
            else{
            $scope.data = {};
            var promptPassword = $ionicPopup.show({
                                                  template: '<input type="password" ng-model="data.password">',
                                                  title: 'Enter Password',
                                                  subTitle: '',
                                                  scope: $scope,
                                                  buttons: [
                                                            { text: 'Cancel' },
                                                            {
                                                            text: '<b>Ok</b>',
                                                            type: 'button-positive',
                                                            onTap: function(e) {
                                                            if (!$scope.data.password) {
                                                            //don't allow the user to close unless he enters wifi password
                                                            e.preventDefault();
                                                            } else {
                                                            return $scope.data.password;
                                                            }
                                                            }
                                                            }
                                                            ]
                                                  });
            promptPassword.then(function(res) {
                                
                                if(res){
                                if(res == passwordObject){
                                window.localStorage.removeItem(file);
                                $scope.doRefresh();
                                
                                
                                }
                                else{
                                navigator.notification.alert("You have entered wrong Password",null,"Incorrect Password");
                                return;
                                
                                }
                                }
                                });
            }
            
            
            }
            
            if (selectedFile == file) {
            updateFileName("default");
            
            }
            
            
        };
            
        $scope.view = function(filename){
            
            var deviceFind = getDeviceType();
            var data = '';
            
            if(filename != "default"){
            
            var filedata = JSON.parse(decodeURIComponent(window.localStorage.getItem(filename)));
            
            if(filedata["password"]){
            $scope.data = {};
            var promptPassword = $ionicPopup.show({
                                                  template: '<input type="password" ng-model="data.password">',
                                                  title: 'Enter Password',
                                                  subTitle: '',
                                                  scope: $scope,
                                                  buttons: [
                                                            { text: 'Cancel' },
                                                            {
                                                            text: '<b>Ok</b>',
                                                            type: 'button-positive',
                                                            onTap: function(e) {
                                                            if (!$scope.data.password) {
                                                            //don't allow the user to close unless he enters wifi password
                                                            e.preventDefault();
                                                            } else {
                                                            return $scope.data.password;
                                                            }
                                                            }
                                                            }
                                                            ]
                                                  });
            promptPassword.then(function(res) {
                                if(res){
                                
                                if(res == filedata["password"]){
                                data = window.localStorage.getItem(filename);
                                data = decodeURIComponent(data);
                                SocialCalc.WorkBookControlInsertWorkbook(data);
                                updateFileName(filename);
                                SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state = "start";
                                
                                SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand('redisplay', '');
                                window.setTimeout(function() {
                                                  SocialCalc.ScrollRelativeBoth(SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor, 1, 0);
                                                  SocialCalc.ScrollRelativeBoth(SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor, -1, 0);
                                                  },1000);
                                
                                if(data){
                                showToast("Loading file "+filename);
                                $timeout(function(){
                                         $state.go('tab.home');},1000);
                                }
                                return;
                                
                                }
                                else{
                                navigator.notification.alert("You have entered wrong Password",null,"Incorrect Password");
                                
                                return;
                                }
                                
                                }
                                
                                
                                });
            }
            else{
            
            data = decodeURIComponent(window.localStorage.getItem(filename));
            
            }
            
            
            }
            else{
            if(deviceFind == "iPad" || deviceFind == "default"){
            data = document.getElementById("sheetdata").value;
            }
            else if(deviceFind == "iPhone" || deviceFind == "iPod"){
            data = document.getElementById("sheetdata1").value;
            }
            else{
            data = document.getElementById("sheetdata1").value;
            }
            }
            
            
            
            SocialCalc.WorkBookControlInsertWorkbook(data);
            updateFileName(filename);
            SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state = "start";
            
            SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand('redisplay', '');
            window.setTimeout(function() {
                              SocialCalc.ScrollRelativeBoth(SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor, 1, 0);
                              SocialCalc.ScrollRelativeBoth(SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor, -1, 0);
                              },1000);
            
            if(data){
            showToast("Loading file "+filename);
            $timeout(function(){
                     $state.go('tab.home');},1000);
            }
            
            
            
            
    };
    
            
    $scope.$on('$ionicView.beforeEnter', function() {
            console.log("updating files...");
            $scope.files = LocalFiles.all();
    });
            
            $scope.showActionsheet = function(filename){
            $ionicActionSheet.show({
                                   titleText: 'More Options',
                                   buttons: [
                                             { text: '<i class="icon ion-edit"></i>Edit' },
                                             { text: '<i class="icon ion-edit"></i>Rename' }
                                             ],
                                   destructiveText: '<i class="icon ion-ios-trash"></i>Delete',
                                   cancelText: 'Cancel',
                                   cancel: function() {
                                   console.log('CANCELLED');
                                   },
                                   buttonClicked: function(index) {
                                   console.log('BUTTON CLICKED',index);
                                   if(index == 0){
                                   //$scope.addSign(link);
                                   $timeout(function(){
                                            $scope.view(filename);},100);
                                   
                                   }else if(index == 1){
                                   
                                   navigator.notification.alert("Please save the file before renaming",function(){
                                                                
                                                                $scope.rename(filename);
                                                                
                                                                }, "Rename");
                                   
                                   }
                                   return true;
                                   },
                                   destructiveButtonClicked: function() {
                                   console.log('DESTRUCT');
                                   $scope.delete(filename);
                                   //$scope.deleteSign(link);
                                   return true;
                                   }
                                   });
            };
            
            
            
            $scope.rename = function(oldName){
            if(oldName == "default" ){
            navigator.notification.alert("Cannot rename default !",null,"Rename","Ok");
            }
            else{
            /// console.log(oldName);
            $scope.data = {};
            
            var myPopup = $ionicPopup.show({
                                           template: '<input type="text" ng-model="data.name">',
                                           title: 'Rename file',
                                           subTitle: 'Enter name',
                                           scope: $scope,
                                           buttons: [
                                                     { text: 'Cancel' },
                                                     {
                                                     text: '<b>Save</b>',
                                                     type: 'button-positive',
                                                     onTap: function(e) {
                                                     if (!$scope.data.name) {
                                                     //don't allow the user to close unless he enters wifi password
                                                     e.preventDefault();
                                                     } else {
                                                     return $scope.data.name;
                                                     }
                                                     }
                                                     }
                                                     ]
                                           });
            
            myPopup.then(function(res) {
                         if(!res){
                         return;
                         }
                         /// console.log('Tapped!'+ res);
                         for (i=0; i<window.localStorage.length; i++) {
                         if(window.localStorage.key(i).length >=30) continue;
                         var filename = window.localStorage.key(i);
                         if(filename == oldName){
                         var data = window.localStorage.getItem(filename);
                         window.localStorage.setItem(res, data);
                         window.localStorage.removeItem(filename);
                         //console.log(data);
                         $scope.files = LocalFiles.all();
                         
                         }
                         
                         }
                         
                         });
            }
            
            };
            
       
        

})


.controller('OptionsCtrl', function($scope, $ionicLoading , CloudService , $http, $state, ModalService, $interval, LocalFiles, $timeout) {
        
            
    $scope.view = function(filename){
            var deviceFind = getDeviceType();
            var data = '';
            if(deviceFind == "iPad" || deviceFind == "default"){
            data = document.getElementById("sheetdata").value;
            }
            else if(deviceFind == "iPod" || deviceFind == "iPhone"){
            data = document.getElementById("sheetdata1").value;
            }
            
            
            SocialCalc.WorkBookControlInsertWorkbook(data);
            
            
            updateFileName(filename);
            selectedFile = filename;
            // reset the editor state
            
            SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state = "start";
            
            SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand('redisplay', '');
            var control=SocialCalc.GetCurrentWorkBookControl();
            
            window.setTimeout(function() {
                              SocialCalc.ScrollRelativeBoth(SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor, 1, 0);
                              SocialCalc.ScrollRelativeBoth(SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor, -1, 0);
                              },1000);
            
            
            showToast("Loading new file");
            $timeout(function(){
                     $state.go('tab.home');},1000);
            
            
            
    };

            
            
    $scope.show = function(template) {
            $ionicLoading.show({
                               template: template
                               });
    };
    $scope.hide = function(){
            $ionicLoading.hide();
    };
      
    $scope.email = function(){
       // showEmailComposer("",null);
        checkBeforeUse("email",null);
            
            
    };
            
            $scope.emailWorkbook = function(){
            checkBeforeUse("emailWorkbook",null);
            };
        
    $scope.save = function(){
            var bool= saveCurrentFile();
            ///backup File started
            
            if(bool){
            $scope.backup(selectedFile, "save");
            }
    };
            
    $scope.saveAs = function(){
            function onPrompt(results) {
            //alert("You selected button number " + results.buttonIndex + " and entered " + results.input1);
            if(results.buttonIndex == 1)return;
            //alert("typed: "+results.input1)
            
            LocalFiles.findByName(results.input1).then(function(response){
                                                       //alert("response"+ response);
                                                       var name = results.input1;
                                                       name = name.toLowerCase();
                                                       //     alert("name "+name);
                                                       if(response == name){
                                                       // alert("exists");
                                                       navigator.notification.alert("File with the same name exists.Please save under a different name",null,"File exists")
                                                       }
                                                       else{
                                                       // alert("no");
                                                       //saveAsOk(results.input1);
                                                       var bool= checkBeforeUse("save",results.input1);
                                                       ///backup File started
                                                       if(bool){
                                                       $scope.backup(results.input1, "save as");
                                                       }
                                                       

                                                       }
                                                       });
            
            
            }
            
            navigator.notification.prompt(
                                          'Please enter the filename',  // message
                                          onPrompt,                  // callback to invoke
                                          'Save as',            // title
                                          ['Cancel','Done'],             // buttonLabels
                                          ''                 // defaultText
                                          );

    };
            
            $scope.backup = function(file, feature){
            //alert(file);
            
            function onConfirm(buttonIndex){
            
            if(buttonIndex == 1) {
                navigator.notification.alert('Please click on Email workbook and backup your data in your email account',null, "Email Workboook");
                return;
            }
            
            function onSelectStorage(buttonIndex){
            
            if(buttonIndex == 4) return;
            else if(buttonIndex == 3){
                checkBeforeSaveToDropbox(2);
            }
            else if(buttonIndex == 2){
            /// server
            
                CloudService.checkLogin().then(function(response){
                                           var result= response.data.result;
                                           
                                           if(result == "fail"){
                                           //showToast("Authentication failed.Try again");
                                           ModalService.init('templates/login.html', $scope).then(function(modal){
                                                                                                  modal.show();
                                                                                                  
                                                                                                  
                                                                                                  });
                                           
                                           navigator.notification.alert('Please click on Save as button under the heading Sync and Sign your invoice on computer after login is successful',null, "Save as");
                                           
                                           
                                           }
                                           else if(result == "ok"){
                                           //alert(result);
                                           if(feature == "save"){
                                           $scope.updateToWeb();
                                           }
                                           else{
                                           checkBeforeSave(file);
                                           }
                                           
                                           }
                                           
                                           });
            
            
            }
            else if(buttonIndex == 1){
            /// dropbox
            var checksuccess = function() {
            //alert(" true");
            $state.go('tab.saveToDropbox');
            
            };
            var checkfailure = function() {
            
            var loginsuccess = function() {
            console.log("login success.");
            $state.go('tab.saveToDropbox');
            
            
            };
            var loginfailure = function() {
            
            console.log("fail.login again.");
            var promise = dropbox.link();
            promise.done(loginsuccess);
            promise.always(delayedCheck);
            promise.fail(loginfailure);
            
            };
            
            
            var delayedCheck = function() {
            $timeout(function(){
                     var promise = dropbox.checkLink();
                     },1000);
            };
            var promise = dropbox.link();
            promise.done(loginsuccess);
            promise.always(delayedCheck);
            promise.fail(loginfailure);
            
            };
            
            var promise = dropbox.checkLink();
            promise.done(checksuccess);
            promise.fail(checkfailure);
            
            }
            }
            
            
            navigator.notification.confirm(
                                           'Choose storage to continue saving file',
                                           onSelectStorage,
                                           'Backup Storage',
                                           ['Save to Dropbox', 'Save to Server', 'Save to Dropbox as a PDF File', 'Cancel']
                                           );
            
            
            }
            
            
            navigator.notification.confirm(
                                           'The file has been temporarily successfully saved on the device. Please make sure to save it on our server and dropbox. To continue press Yes',
                                           onConfirm,
                                           'Backup Storage',
                                           ['No', 'Yes']
                                           );
            
            };
            

            
    $scope.print = function(){
            //showPrintDialog();
            checkBeforeUse("print",null);
    };
        
    $scope.sendCSV = function(){
            exportAsCsv();
    };
            
    $scope.referToAFriend = function(){
            refer();
    
    };
    $scope.writeToUs = function(){
            showFeedback();
    
    };
    $scope.visitUs = function(){
            loadWebsite();
    
    };
            
            
   // save and save as starts here
            $scope.updateToWeb = function(){
            
            var fname = getName();
            //alert(fname);
            if(fname == "default"){
            navigator.notification.alert("Cannot update default file",null,"Save");
            return;
            }
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
                    showToast("Login required.Please log in and continue");
                    return;
                    }
                    else if(result == "ok"){
                    
                    console.log("logged in");
                    console.log("logged in can continue");
                    
                    
                    var message={};
                    message.url='http://aspiringapps.com/webapp';
                    message.type="POST";
                    message.format = 'json';
                    message.data={action:"savecurrentfile",fname:fname,data:val1,appname:"Vehicle Maintenance"};
                    
                    //$scope.chk = "false";
                    $scope.show("Updating file "+fname);
                    request(message,function(result){
                            //alert(result);
                            if(result == "ok"){
                            showToast("File "+fname+" updated successfully");
                            //$scope.chk= "true";
                            $scope.hide();
                            }
                            else{
                            showToast("File "+fname+" is not updated.Try again");
                            //$scope.chk = "true";
                            $scope.hide();
                            }
                            
                            });
                    
                    
                    
                    
                    }
                    
                    });
            
    };
            
            
   $scope.saveAsCloud = function(){
            
            CloudService.checkLogin().then(function(response){
                                           var result= response.data.result;
                                           if(result == "fail"){
                                           ModalService.init('templates/login.html', $scope).then(function(modal){
                                                                                                  modal.show();
                                                                                                  });
                                           }
                                           else if(result == "ok"){
                                           //logged in
                                           checkBeforeSave("");
                                           }
                                           });
        
   };
            
            
            
    /// cloud save and save as ends
            
    /// message as pdf starts
    $scope.sharePDF = function(){
            checkBeforeShare();
    };
        
    /// message as pdf ends
            
            
            /// export as pdf starts here
    $scope.sendPDF = function(val){
            //checkBeforeSend();
            
            function onConfirm(buttonIndex){
            if(buttonIndex == 3) return;
            else if(buttonIndex == 1){
            checkBeforeSend(val);
            }
            else if(buttonIndex == 2){
            checkBeforeSaveToDropbox(val);
            }
            }
            
            navigator.notification.confirm(
                                           'Save PDF',
                                           onConfirm,
                                           'PDF',
                                           [ 'Email', 'Dropbox','Cancel']
                                           );
            
    };
            
    $scope.saveToiBooks = function(){
            saveToDevice();
    };


    $scope.passwordProtection = function(){
            passwordProtectionProcess();
    };
            
            
    
            
})

.controller('HomeCtrl', function($scope , App , $ionicPopover, $ionicModal, $ionicPopup) {
   
  loadAndStartUpApp();
  $scope.footers = App.footers();

  $scope.name = App.name();
  if($scope.name  == "default"){
        $scope.name = "Default";
  }
            
  $scope.activateSheet = function(index){
    activateFooterBtn(index);
    $scope.name = App.name();
    if($scope.name  == "default"){
      $scope.name = "Default";
    }
  };

  $scope.$on('$ionicView.beforeEnter', function() {
                       
    $scope.name = App.name();
    if($scope.name  == "default"){
       $scope.name = "Default";
    }
   //  $scope.updateFooterButtons();
       
    });

    var devicefind = getDeviceType();
    $scope.device = devicefind;

    $ionicPopover.fromTemplateUrl('templates/home-options.html', {
                                  scope: $scope,
                                  }).then(function(popover) {
                                          $scope.popoverA = popover;
                                          });

    $scope.openOptionsPopover = function($event) {
            $scope.popoverA.show($event);
    };

    $scope.closeOptionsPopover = function($event) {
            $scope.popoverA.hide();
    };
            
            
    /************************  Choose template  ************************/
    var template = '<ion-popover-view><ion-content><div class="list"><a class="item" ng-click="switchTemplate(1)"> Default</a><a class="item" ng-click="switchTemplate(2)">Checkbook</a></div></ion-content></ion-popover-view>';



    $scope.popover = $ionicPopover.fromTemplate(template, {
                                    scope: $scope
                                    });

    $scope.openTemplatePopver = function($event){
    $scope.popover.show($event);
    };

    $scope.closeTemplatePopver = function() {
    $scope.popover.hide();
    };


    $scope.switchTemplate = function(val){
    var choice = '';  var devicefind = getDeviceType(); var footers = [];

    switch(val){
    case 1: choice = "default";
    footers = App.footers();
    break;

    case 2: if(devicefind == "iPad" || devicefind == "default"){
    choice = "checkbook";
    footers = App.checkbook();
    }
    break;

    default: choice = "default";
    footers = App.footers();
    break;

    }

    navigator.notification.confirm('Changing the template would erase the contents of the existing workbook. Tap Ok to continue',
                       function(buttonIndex){
                       if(buttonIndex == 1) return;
                       changeTemplate(val);
                       $scope.closeTemplatePopver();
                       window.localStorage.setItem("choice", choice);
                       $scope.name = "Default"; selectedFile = "default";
                       $scope.footers = footers;
                       },
                       'Switch Template',
                       ['Cancel', 'Ok']);



    };



    $scope.updateFooterButtons = function(){
    // console.log("Test..");
    if(selectedFile == "default"){
    if(!window.localStorage.getItem("choice")){
    $scope.footers = App.footers();
    console.log("1. "+JSON.stringify($scope.footers));
    }
    else{
    var choice  = window.localStorage.getItem("choice");
    if(choice == "checkbook"){
    $scope.footers = App.checkbook();
    console.log("2.checkbook "+JSON.stringify($scope.footers));
    }
    else{
    $scope.footers = App.footers();
    console.log("2.else "+JSON.stringify($scope.footers));
    }

    }

    }
    else{
    var template = checkIfCustomTemplate(selectedFile);
    if(template == "checkbook"){
    $scope.footers = App.checkbook();
    console.log("3.checkbook "+JSON.stringify($scope.footers));
    }
    else{
    $scope.footers = App.footers();
    console.log("3.else "+JSON.stringify($scope.footers));
    }


    // alert(JSON.stringify($scope.footers));
    }

    };
            
            
            $scope.sort = function(){
            sortFunction("B");
            
            };
            
            
            
            
            // Create the login modal that we will use later
            $ionicModal.fromTemplateUrl('templates/sheets.html', {
                                        scope: $scope
                                        }).then(function(modal) {
                                                $scope.modalRename = modal;
                                                
                                                });
            
            
            
            
            $scope.initRename = function(){
            $scope.sheets = $scope.footers();///** list radio button
            var check = checkIfCustomTemplate('');
            if(check == ''){
                check = "default";
            }

            // alert(check);
            if(check == "default"){
            $scope.sheets = App.footers();///** list radio button
            }
            else if(check == "checkbook"){
            $scope.sheets = App.checkbook();///** list radio button
            }
            
            $scope.modalRename.show();
            $scope.closeOptionsPopover();
            };
            
            $scope.closeList = function(){
            $scope.modalRename.hide();
            };
            
            $scope.selectedButton = function(sheet){
            $scope.toRename = sheet;
            };
            
            $scope.doRename = function(){
            // console.log($scope.toRename.name);
            $scope.showPopup($scope.toRename.name, $scope.toRename.index);
            $scope.modalRename.hide();
            };
            
            
            $scope.showPopup = function(sheet, index){
            
            $scope.data = {}
            
            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
                                           template: '<input type="text" ng-model="data.newname">',
                                           title: 'Rename '+sheet+' ',
                                           subTitle: 'Enter the new sheet name',
                                           scope: $scope,
                                           buttons: [
                                                     { text: 'Cancel' },
                                                     {
                                                     text: '<b>Rename</b>',
                                                     type: 'button-positive',
                                                     onTap: function(e) {
                                                     if (!$scope.data.newname) {
                                                     //don't allow the user to close unless he types a new name
                                                     e.preventDefault();
                                                     } else {
                                                     return $scope.data.newname;
                                                     }
                                                     }
                                                     },
                                                     ]
                                           });
            myPopup.then(function(res) {
                         $scope.data = { index: index, newname: res };
                         // alert(JSON.stringify($scope.data));
                         var bool = renameCallback($scope.data);
                         // alert(bool);
                         if(bool){
                         for(var i in $scope.footers){
                         if($scope.footers[i].index == $scope.data.index){
                         $scope.footers[i].name = $scope.data.newname;
                         }
                         }
                         }
                         
                         });
            
            };


            
})

.controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate) {
            
            // Called to navigate to the main app
            $scope.startApp = function() {
            $state.go('tab.home');
            window.localStorage['didTutorial'] = "true";
            
            };
            $scope.next = function() {
            $ionicSlideBoxDelegate.next();
            };
            $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
            };
            
            // Called each time the slide changes
            $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
            };
})


.controller('SaveToDropboxCtrl', function($scope, DropboxService) {
        $scope.files = DropboxService.localFilesAll();
            
        if($scope.files == ""){
            showToast("No local files saved. Save as and continue");
        }
        
        $scope.doRefresh = function() {
            //alert("1");
            console.log('Refreshing!');
            
            $scope.files= DropboxService.localFilesAll();
             //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            
        };

            
            
            $scope.upload = function(){
            var oldList = $scope.files;
            //clear list
            //alert("all files:"+JSON.stringify($scope.files));
            $scope.fileNames = [];
            //cycle through list
            angular.forEach(oldList, function(x) {
                            //add any non-done items to todo list
                            //alert("name:"+x.text);
                            
                            if(x.checked == "false"){
                            
                            }
                            else{
                            //alert(x.checked);
                            $scope.fileNames.push(x.text);
                            }
                            });
            console.log("checked files: "+JSON.stringify($scope.fileNames));
            showToast("Saving selected files to dropbox..");
            dropboxHandler.recursiveSaveToDropbox($scope.fileNames);
            };

            
     
   
})

.controller('ListDropboxFilesCtrl', function($scope, DropboxService , $timeout) {
            $scope.files = DropboxService.dropboxFilesAll();
            
            $timeout(function(){
                     $scope.doRefresh();
                     },1000);
            
            $scope.doRefresh = function() {
            //alert("1");
            console.log('Refreshing!');
            
            $scope.files = DropboxService.dropboxRefreshAll();

            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            
            };
            
            $scope.remove = function(file){
            
            function onConfirm(buttonIndex) {
            //alert('You selected button ' + buttonIndex);
            if(buttonIndex == 1) return;
            DropboxService.remove(file);
            
            $scope.doRefresh();
            }
            
            
            
            navigator.notification.confirm(
                                           'Confirm delete: '+file+' from dropbox?', // message
                                           onConfirm,            // callback to invoke with index of button pressed
                                           'Delete',           // title
                                           ['Cancel','Ok']         // buttonLabels
                                           );
            
            
            };
            
})

.controller('DropboxLocalSaveCtrl' , function($scope, DropboxService) {
            
            $scope.files = DropboxService.dropboxFilesAll();
            
            $scope.doRefresh = function() {
            //alert("1");
            console.log('Refreshing!');
            
            $scope.files = DropboxService.dropboxRefreshAll();
            

            $scope.$broadcast('scroll.refreshComplete');
            
            };
            
            $scope.saveLocal = function(){
            var oldList = $scope.files;
            //clear list
            //alert("all files:"+JSON.stringify($scope.files));
            $scope.fileNames = [];
            //cycle through list
            angular.forEach(oldList, function(x) {
                            //add any non-done items to todo list
                            //alert("name:"+x.text);
                            
                            if(x.checked == "false"){
                            
                            }
                            else{
                            //alert(x.checked);
                            $scope.fileNames.push(x.text);
                            }
                            });
            console.log("checked files: "+JSON.stringify($scope.fileNames));
            showToast("Moving files to device..");
            dropboxHandler.recursiveSave($scope.fileNames);
            
            };
                                              
})

.controller('ListFilesWebCtrl', function($scope, $timeout , $ionicLoading , $interval, $state, CloudService ,$ionicHistory, $ionicActionSheet){
            
            $scope.data = {
            showDelete: false
            };
            
            $scope.listFilesInWeb = function(){
            
            CloudService.checkLogin().then(function(response){
                   var result= response.data.result;
                                           
                   if(result == "fail"){
                   showToast("Login required. Please login to continue");
                   
                   }
                   else if(result == "ok"){
                   //logged in
                   var files = new Array();
                   var message ={action:"listdir",appname:"Vehicle Maintenance"};
                   
                   showToast("Syncing..");
                   
                   CloudService.request(message).then(function(response){
                                                      
                                                      console.log('Success:list '+JSON.stringify(response));
                                                      
                                                      var result= response.data.result;
                                                      
                                                      if (result == "ok") {
                                                      //alert(response["data"].length);
                                                      
                                                      for (i=0; i < response.data.data.length; i++) {
                                                      
                                                      var filename = response.data.data[i];
                                                      files.push(filename);
                                                      
                                                      }
                                                      //alert(JSON.stringify(files));
                                                      $scope.files=  files;
                                                      }
                                                      
                                                      
                                                      });
                                           
                                           
               }
               });
            
            };
            
            $scope.$on('$ionicView.beforeEnter', function() {
                       $scope.listFilesInWeb();
            });
            
            $scope.doRefresh = function(){
            
            console.log('Refreshing!');
            $scope.listFilesInWeb();
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            
            };
            
            $scope.remove = function(file){
            
            function onConfirm(buttonIndex) {
            //alert('You selected button ' + buttonIndex);
            if(buttonIndex == 1) return;
            
            CloudService.checkLogin().then(function(response){
               var result= response.data.result;
               if(result == "fail"){
               showToast("Login required. Please login to continue");
               
               }
               else if(result == "ok"){
               //logged in
               
               var message ={action:"deletefile",appname:"Vehicle Maintenance",fname:file};
               
               
               
               CloudService.request(message).then(function(response){
                                                  
                      console.log('Success:list '+JSON.stringify(response));
                      
                      var result= response.data.result;
                      //alert(result);
                      if (result == "ok") {
                      //alert(response["data"].length);
                      
                      showToast("File "+file+" successfully deleted.");
                      selectedFile = "default";
                      $scope.doRefresh();
                      
                      }
                      
                      
                      });
               
               
               }
               });        
            
            }
            
            
            
            navigator.notification.confirm(
                                           'Confirm delete: '+file+' from web?', // message
                                           onConfirm,            // callback to invoke with index of button pressed
                                           'Delete',           // title
                                           ['Cancel','Ok']         // buttonLabels
                                           );
            };
            
            
            $scope.view = function(file){
            
            if(file!= "default"){
            
            var message ={action:"getfile",appname:"Vehicle Maintenance",fname:file};
            
            $ionicLoading.show({ template: 'Loading file...' });
            CloudService.request(message).then(function(response){
               console.log('Success:view '+JSON.stringify(response));
$ionicLoading.hide();
               
               var result= response.data.result;
               //alert(result);
               if (result == "ok") {
               //alert(response["data"].length);
               
               var filedata = response.data.data;
               //console.log(filedata);
               SocialCalc.WorkBookControlInsertWorkbook(decodeURIComponent(filedata));
               SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state = "start";
               SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand('redisplay', '');
               selectedFile = file;
               $state.go('tab.home');
               }
                                               
            });
            }
            
            };
            
            
            
            $scope.showActionsheet = function(filename){
            $ionicActionSheet.show({
                                   titleText: 'More Options',
                                   buttons: [
                                             { text: '<i class="icon ion-edit"></i>Edit' },
                                             ],
                                   destructiveText: '<i class="icon ion-ios-trash"></i>Delete',
                                   cancelText: 'Cancel',
                                   cancel: function() {
                                   console.log('CANCELLED');
                                   },
                                   buttonClicked: function(index) {
                                   console.log('BUTTON CLICKED',index);
                                   if(index == 0){
                                   //$scope.addSign(link);
                                   $timeout(function(){
                                            $scope.view(filename);},100);
                                   
                                   }
                                   return true;
                                   },
                                   destructiveButtonClicked: function() {
                                   console.log('DESTRUCT');
                                   $scope.remove(filename);
                                   //$scope.deleteSign(link);
                                   return true;
                                   }
                                   });
            };
                      
})



.controller('AccountCtrl', function($scope ,$ionicModal, $timeout, $interval , CloudService) {
  
    
  $scope.settings = {
    dropbox:false,
    web:false
  };
            
  $scope.$on('$ionicView.beforeEnter', function() {
         $scope.checkDropboxLogin();
         $scope.checkCloudLogin();
  });
       
  $scope.checkCloudLogin = function(){
            CloudService.checkLogin().then(function(response){
                 console.log("checklogin: "+JSON.stringify(response));
                 var result = response.data.result;
                 if(result == "fail"){
                      $scope.settings.web = false;
                 }
                 else if(result == "ok"){
                   $scope.settings.web = true;
                    
                   //alert($scope.web.checked);
                   console.log("logged in");
                 }
            });
  };
  $scope.checkDropboxLogin = function(){
            
            var checksuccess = function() {
            //alert(" true");
            $scope.settings.dropbox = true;
            };
            var checkfailure = function() {
            //alert("false");
            $scope.settings.dropbox = false;
            };
            
            var promise = dropbox.checkLink();
            promise.done(checksuccess);
            promise.fail(checkfailure);
            
  };
            
    $scope.updateLoginLogout = function(){
            console.log("updating login logout..");
            //alert($scope.settings.dropbox);
            //dropbox toggle starts here
            if(!$scope.settings.dropbox){
            //log out
                var logoutfailure = function(){
                console.log("logout again.");
                $scope.settings.dropbox = true;
                };
                var logoutsuccess = function(){
                console.log("logout done.");
                $scope.settings.dropbox = false;
                };
                
                var promise = dropbox.unlink();
                promise.done(logoutsuccess);
                promise.fail(logoutfailure);
            
            }
            else{
            
            //log in
            
                    var loginsuccess = function() {
                    console.log("login success.");
                    $scope.settings.dropbox = true;
                    
                    };
                    var loginfailure = function() {
                    
                    console.log("fail.login again.");
                    $scope.settings.dropbox = false;
                    };
                    
                    
                    var delayedCheck = function() {
                    var chk = $interval(function(){
                                        var promise = dropbox.checkLink();
                                        promise.done(function(){
                                                     console.log("chk interval canceled");
                                                     $scope.settings.dropbox = true;
                                                     $interval.cancel(chk);
                                                     
                                                     
                                                     });
                                        promise.fail(function(){
                                                     console.log("in interval");
                                                     $scope.settings.dropbox = false;
                                                     });
                                        
                                        },1000);
                    
                    };
                    var promise = dropbox.link();
                    promise.done(loginsuccess);
                    promise.always(delayedCheck);
                    promise.fail(loginfailure);
            
            
            }
            
            };// dropbox toggle ends here
            
            
$scope.cloudUpdateLoginLogout = function(){

console.log("cloud toggle");

if($scope.settings.web){
///login
$scope.login();
}
else{

var data={action:"logout",appname:"Vehicle Maintenance"};

CloudService.request(data).then(function(response){
                            
                            console.log('Success logout :'+JSON.stringify(response));
                            
                            var result= response.data.result;
                            if(result == "fail"){
                            $scope.settings.web = true ;
                            
                            }
                            else if(result == "ok"){
                            $scope.settings.web = false;
                            
                            }
                            });

}

};


/// login starts here
// Form data for the login modal
$scope.loginData = {};
$scope.registerData = {};
$scope.spin = {show: false};

// Create the login modal that we will use later
$ionicModal.fromTemplateUrl('templates/login.html', {
                        scope: $scope
                        }).then(function(modal) {
                                $scope.modalA = modal;
                                });

$ionicModal.fromTemplateUrl('templates/register.html', {
                        scope: $scope
                        }).then(function(modal) {
                                $scope.modalB = modal;
                                });

// Triggered in the login modal to close it
$scope.closeLogin = function() {
$scope.modalA.hide();
};

// Open the login modal
$scope.login = function() {
$scope.modalA.show();

};

$scope.removeLogin = function(){
$scope.modalA.remove();
};

$scope.removeRegister = function(){
$scope.modalB.remove();
};


$scope.closeRegister = function() {
$scope.modalB.hide();
};

// Open the login modal
$scope.openRegister = function() {
$scope.modalB.show();

};

$scope.doLogin = function() {
//console.log('Doing login', $scope.loginData);
//alert(JSON.stringify($scope.loginData));
$scope.spin.show = true;

var uuid = $scope.loginData.email;
uuid = uuid.toLowerCase();
//alert(uuid);
var pass = $scope.loginData.password;

var message = {action:"login",uuid:uuid,password:pass,deviceId:device.uuid,appname:"Vehicle Maintenance"};

CloudService.request(message).then(function(response){
                                   
       console.log('Success:login '+JSON.stringify(response));
       $scope.spin.show = false;
       
       var result= response.data.result;
       //alert(result);
       if(result == "fail"){
       $scope.settings.web =  false;
       showToast("Password or email incorrect.Try again");
       $scope.loginData = {};
       $scope.closeLogin();
       
       }
       else if(result == "ok"){
       $scope.settings.web =  true;
       $scope.closeLogin();
       showToast("Login successful");
       $scope.checkCloudLogin();
       $scope.loginData = {};
    
       var message = {action:"getInapp",appname:"Vehicle Maintenance"};
                                   
        // cloudInapp
       CloudService.saveInit();
       CloudService.restoreInit();

       
       
       }
});
};
            
            $scope.doRegister = function(){
            $scope.spin.show = true;
            var uuid = $scope.registerData.email;
            uuid = uuid.toLowerCase();
            //alert(uuid);
            var pass = $scope.registerData.password;
            //alert(pass);
            
            var message={action:"register",uuid:uuid,password:pass,appname:"Vehicle Maintenance"};
            
            CloudService.request(message).then(function(response){
                                               
                   console.log('Success:register '+JSON.stringify(response));
                   $scope.spin.show = false;
                   
                   var result= response.data.result;
                   //alert(result);
                   if(result == "fail"){
                   $scope.settings.web = false ;
                   $scope.registerData = {};
                   $scope.closeRegister();
                   
                   }
                   else if( result== "exist"){
                   //alert("try again");
                   showToast("User already exists.Login to continue");
                   $scope.registerData = {};
                   $scope.closeRegister();
                   $scope.settings.web = false ;
                   }
                   else if(result == "ok"){
                   
                   $scope.closeRegister();
                   showToast("Registration successful");
                   $scope.registerData = {};
                   $scope.settings.web = false ;
                   CloudService.saveInit();
                   CloudService.restoreInit();

                   
                   }
            });
            
            
            };
            
            $scope.startRegistration = function(){
            
            $scope.closeLogin();
            $timeout(function(){
                     $scope.openRegister();
                     },10);
            
            };
            
            $scope.startLogin = function(){
            $scope.closeRegister();
            $timeout(function(){
                     $scope.login();
                     },10);
            
            };
            
            $scope.$on("$destroy", function(){
                       $interval.cancel(chk);
                       $scope.modalA.remove();
                       $scope.modalB.remove();
                       
                       });

})

.controller('PurchaseCtrl', function($scope, Items ,CloudService, $timeout ,$ionicLoading, $interval, ModalService, $ionicActionSheet) {
            
            
    $scope.items = Items.all(); // load  and display the inapp items
      
    
    $scope.show = function() {
            $ionicLoading.show({
                               template: 'Purchasing...'
                               });
    };
    $scope.hide = function(){
            $ionicLoading.hide();
    };

   //alert(JSON.stringify($scope.items));
    

    $scope.purchase = function(item){ // trigerred when buy is clicked.Starts the purchase
    // alert(item);
    var id;
    if(item == "save"){
         id = "2017vhmCloud";
    }
    else if(item == "fb-tw-sms-whatsapp"){
         id = "2017vhm10share";
    }
    else{
        var products = JSON.parse(window.localStorage.getItem("inapplocal"));
        for(i in products){
        if(products[i].Id == "2017vhm10share") continue;
        if(item == products[i].Feature)
        id = products[i].Id;
        }

    }

    //alert(id);
    $scope.purchasePDF(id);
    };

    $scope.purchasePDF = function(id){
        if(!IAP.loaded){
        loadProducts();
        
        }
        if(!window.localStorage.getItem("inapplocal")) item.init();
        //alert(id);
        var products=JSON.parse(window.localStorage.getItem('inapplocal'));
        
        if(id == "2017vhm10Pdf" || id == "2017vhm25Pdf" || id == "2017vhm50Pdf" || id == "2017vhm100Pdf"){
            for(var i=0;i<4;i++){
            
            if(products[i].Purchase=='Yes'){
            return;
            }
            }
        }
        else if(id == "2017vhm10share"){
            if(products[4].Purchase == "Yes")
            return;
        }
        else if(id == "2017vhmCloud"){
            var p = JSON.parse(window.localStorage.getItem('cloudInapp'));
            if(p[0].Purchase == "Yes")
            return;
        }
            
        /*** 500 & 1000 times Save as, Print and Email ***/
        else if(id == "2017vhmSavePrintEmail"){

            if(products[5].Purchase == "Yes"){
                var left = parseInt(products[5].Own) - parseInt(products[5].Consumed);
                if(left > 3) return;
            }
            else if(products[7].Purchase == "Yes"){
                var left = parseInt(products[7].Own) - parseInt(products[7].Consumed);
                if(left > 30) return;
            }
            else if(products[8].Purchase == "Yes"){
                var left = parseInt(products[8].Own) - parseInt(products[8].Consumed);
                if(left > 30) return;
            }

        }
        else if(id == "2017vhm500SavePrintEmail"){

            if(products[7].Purchase == "Yes"){
                var left = parseInt(products[7].Own) - parseInt(products[7].Consumed);
                if(left > 30) return;

            }
            else if(products[5].Purchase == "Yes"){
                var left = parseInt(products[5].Own) - parseInt(products[5].Consumed);
                if(left > 3) return;

            }
            else if(products[8].Purchase == "Yes"){
                var left = parseInt(products[8].Own) - parseInt(products[8].Consumed);
            if(left > 30) return;
            }
        }

        else if(id == "2017vhm1000SavePrintEmail"){

            if(products[8].Purchase == "Yes"){
                var left = parseInt(products[8].Own) - parseInt(products[8].Consumed);
                if(left > 30) return;

            }
            else if(products[7].Purchase == "Yes"){
                var left = parseInt(products[7].Own) - parseInt(products[7].Consumed);
                if(left > 30) return;

            }
            else if(products[5].Purchase == "Yes"){
                var left = parseInt(products[5].Own) - parseInt(products[5].Consumed);
                if(left > 3) return;

            }
        }
        
        //alert(id);
        $scope.show();
        $timeout(function(){
                          $scope.hide();
                          IAP.buy(id);
                          },1000);
            
            
            var chkPur = $interval(function(){
                                   if(purchaseInterval == true){
                                   console.log("cancel interval");
                                   $interval.cancel(chkPur);
                                   $scope.items = Items.all();
                                   purchaseInterval = false;
                                   
                                   }
                                   else if(purchaseInterval == "fail"){
                                   console.log("cancel interval");
                                   $interval.cancel(chkPur);
                                   $scope.items = Items.all();
                                   purchaseInterval = false;
                                   }
                                   else{
                                   console.log("purchase incomplete");
                                   }
                                   
                                   },1000);
            
    };

    $scope.doRefresh = function() {
        //alert("1");
        console.log('Refreshing!');

        $scope.items = Items.all();
        

        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');

    };
            
            
            $scope.showActionsheet = function(item){
            /// alert(JSON.stringify(item));
            
            $ionicActionSheet.show({
                                   titleText: 'Options',
                                   buttons: [
                                             { text: '<i class="icon ion-ios-cart"></i>Buy' },
                                             ],
                                   cancelText: 'Cancel',
                                   cancel: function() {
                                   console.log('CANCELLED');
                                   },
                                   buttonClicked: function(index) {
                                   console.log('BUTTON CLICKED',index);
                                   if(index == 0){
                                   ///$scope.addSign(link);
                                   $scope.purchasePDF(item.id);
                                   }
                                   return true;
                                   }
                                   });
            };


    
    $scope.$on('$ionicView.beforeEnter', function() {
                   
       $scope.doRefresh();
       
    });
    $scope.restore = function(){
        CloudService.checkLogin().then(function(response){
                                       
                   //console.log('Success:'+JSON.stringify(response));
                   var result= response.data.result;
                   if(result == "fail"){
                       //  showToast("Login required.Please login to continue");
                       //  return;
                       
                       ModalService.init('templates/login.html', $scope).then(function(modal){
                                                                              modal.show();
                                                                              $scope.closeLogin = function() {
                                                                              $scope.modalA.hide();
                                                                              };
                                                                              });
                                       
                                       
                                       
                                       
                   }
                   else {
                    
                   var message = {action:"getInapp",appname:"Vehicle Maintenance"};
                    
                   
                   CloudService.restore(message).then(function(responses){
                                                      console.log('Success:restore '+JSON.stringify(responses));
                                                      
                                                      var results= responses.data.result;
                                                      
                                                      
                                                      
                                                      if (results == "no" || results == "fail") {
                                                      }
                                                      else{
                                                      window.localStorage.setItem("inapplocal",results);
                                                      console.log("product list restored: "+results);
                                                      showToast("Products restored successfully");
                                                      
                                                      }
                                                      });
                   }
                   
                   
                   });
    };


})

.controller('LocalSaveWebCtrl', function($scope, CloudService, $ionicLoading){
            
            
            $scope.listFilesInWeb = function(){
            
            CloudService.checkLogin().then(function(response){
                                           var result= response.data.result;
                                           
                                           if(result == "fail"){
                                           showToast("Login required. Please login to continue");
                                           
                                           }
                                           else if(result == "ok"){
                                           //logged in
                                           var files = new Array();
                                           var message ={action:"listdir",appname:"Vehicle Maintenance"};
                                           
                                           showToast("Listing files stored in server..");
                                           
                                           CloudService.request(message).then(function(response){
                                                                              
                                                                              console.log('Success:list '+JSON.stringify(response));
                                                                              
                                                                              var result= response.data.result;
                                                                              
                                                                              if (result == "ok") {
                                                                              //alert(response["data"].length);
                                                                              
                                                                              for (i=0; i < response.data.data.length; i++) {
                                                                              
                                                                              var filename = response.data.data[i];
                                                                              files.push({"text":filename,"checked":"false"});
                                                                              
                                                                              }
                                                                              //alert(JSON.stringify(files));
                                                                              $scope.files=  files;
                                                                              }
                                                                              
                                                                              
                                                                              });
                                           
                                           
                                           }
                                           });
            
            };
            
            $scope.$on('$ionicView.beforeEnter', function() {
                       $scope.listFilesInWeb();
                       });
            
            $scope.doRefresh = function(){
            
            console.log('Refreshing!');
            $scope.listFilesInWeb();
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            
            };
            
            $scope.saveLocal = function(){
            var oldList = $scope.files;
            //clear list
            //alert("all files:"+JSON.stringify($scope.files));
            $scope.fileNames = [];
            //cycle through list
            angular.forEach(oldList, function(x) {
                            //add any non-done items to todo list
                            //alert("name:"+x.text);
                            
                            if(x.checked == false || x.checked == "false"){
                            
                            }
                            else{
                            //alert(x.checked);
                            $scope.fileNames.push(x.text);
                            }
                            });
            console.log("checked files: "+JSON.stringify($scope.fileNames));
            if($scope.fileNames != ""){
            //showToast("Moving files to device..");
            $scope.recursiveSaveLocalFromWeb($scope.fileNames);
            }
            };
            
            
            $scope.recursiveSaveLocalFromWeb = function(fileNames){
            
            if(fileNames.length ==0) return;
            filename = fileNames.pop();
            var message ={action:"getfile",appname:"Vehicle Maintenance",fname:filename};
            
            
            CloudService.checkLogin().then(function(response){
                                           var result= response.data.result;
                                           
                                           if(result == "fail"){
                                           showToast("Login required. Please login to continue");
                                           
                                           }
                                           else if(result == "ok"){
                                           $ionicLoading.show({ template: 'Saving file '+filename+' to device' });
                                           CloudService.request(message).then(function(response){
                                                                              //console.log('Success:view '+JSON.stringify(response));
                                                                              $ionicLoading.hide();
                                                                              var result= response.data.result;
                                                                              //alert(result);
                                                                              if (result == "ok") {
                                                                              //alert(response["data"].length);
                                                                              
                                                                              var filedata = response.data.data;
                                                                              window.localStorage.setItem(filename, filedata);
                                                                              
                                                                              showToast(filename+" moved successfully");
                                                                              
                                                                              $scope.recursiveSaveLocalFromWeb(fileNames);
                                                                              }
                                                                              });
                                           
                                           
                                           }
                                           });
            
            
            
            
            
            
            };
            })

.controller('DiscoverCtrl', function($scope, MoreAppService){
            
            // tabClicked("Discover");
            
            $scope.bundles = {'show': true};
            
            $scope.openApp = function(link){
                window.open(link, '_blank', 'location=yes');
            };
            
            $scope.appbundles = MoreAppService.allbundles();
            $scope.apps = MoreAppService.allapps();
            
            });
