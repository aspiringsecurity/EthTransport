angular.module('starter.services', [])

.factory('LocalFiles', function($q){
         
   return{
         all:function(){
         
         var files = new Array();
         
         for (i=0; i < window.localStorage.length; i++) {
         //alert(i);
         if(window.localStorage.key(i).length >=30) continue;
         var filename = window.localStorage.key(i);
         if(filename=="logoArray") continue;
         if(filename=="inapp") continue;
         if(filename=="sound") continue;
         if(filename=="cloudInapp") continue;
         if(filename=="inapplocal") continue;
         if(filename=="inappPurchase") continue;
         if(filename=="flag") continue;
         if(filename=="share") continue;
         if(filename=="cellArray") continue;
         if(filename=="sk_receiptForProduct") continue;
         if(filename=="sk_receiptForTransaction") continue;
         if(filename=="didTutorial" || filename=="rename"|| filename == "choice") continue;
         
         var filedata = decodeURIComponent(window.localStorage.getItem(filename));
         var fileobj = JSON.parse(filedata);
         
         var d = new Date(fileobj['timestamp']);
         var timestamp = d.toLocaleString();
         
         if (fileobj["password"]){
            protected = true;
         }
         else{
            protected = false;
         }
         
         
         var d = new Date(fileobj['timestamp']);
         var timestamp = d.toLocaleString();
         
         //alert(filename);
         
         files.push({"name":filename,"timestamp":timestamp,"protected":protected});
         
         }
         
         var date = new Date().toLocaleString();
         files.push({"name":"default","timestamp":date,"protected":false});
         return files;
         
         
         },
         remove: function(file){
             if(file == "default" || file == "Untitled"){
             navigator.notification.alert("Cannot delete default file!",null,"Delete","Done");
             return false;
             }
             console.log("Removing: "+file);
             //files.splice(files.indexOf(file), 1);
             window.localStorage.removeItem(file);
             return true;
         },
         view: function(file){
             viewFile(file);
             return true;
         
         },
         findByName: function(name){
         
         var files = new Array();
         var deferred = $q.defer();
         
         for (i=0; i < window.localStorage.length; i++) {
         //alert(i);
         if(window.localStorage.key(i).length >=30) continue;
         var filename = window.localStorage.key(i);
         if(filename=="logoArray") continue; if(filename=="inapp") continue; if(filename=="sound") continue; if(filename=="cloudInapp") continue;
         if(filename=="inapplocal") continue; if(filename=="inappPurchase") continue; if(filename=="flag") continue;
         if(filename=="share") continue; if(filename=="cellArray") continue;
         if(filename=="sk_receiptForProduct") continue; if(filename=="sk_receiptForTransaction") continue; if(filename=="didTutorial" || filename=="rename"|| filename == "choice") continue;
         files.push(filename);
         
         }
         
         files.push("default");
         
         
         
         var results = files.filter(function(element) {
                                    var fullName = element;
                                    // alert("fullname"+fullName);
                                    
                                    return fullName.toLowerCase().indexOf(name.toLowerCase()) > -1;
                                    });
         deferred.resolve(results);
         return deferred.promise;
         
         
         }
         
   };
    
})

.factory('DropboxService', function(){
         
         var files = new Array();
         
         
         var promise = dropbox.checkLink();
         promise.fail(function(){
                      console.log("dropbox connection is unsuccessful");
                      showToast("Connection unsuccesful.Login to Dropbox");
                      });
         promise.done(function(){
                      //populate list
                      
                      var promise = dropbox.listFolder("/");
                      promise.fail(function(){
                                   console.log("dropbox connection is unsuccessful");
                                   showToast("Connection unsuccesful.Login to Dropbox");
                                   
                                   });
                      
                      promise.done(function(data){
                                   
                                   for (i=0; i<data.length; i++){
                                   if (data[i].isFolder) continue;
                                   filename = decodeURI(data[i].path.slice(1))
                                   if(filename=="logoArray") continue;
                                   if(filename=="inapp") continue;
                                   if(filename=="sound") continue;
                                   if(filename=="cloudInapp") continue;
                                   if(filename=="inapplocal") continue;
                                   if(filename=="inappPurchase") continue;
                                   if(filename=="flag") continue;
                                   if(filename=="share") continue;
                                   if(filename=="cellArray") continue;
                                   if(filename=="sk_receiptForProduct") continue;
                                   if(filename=="sk_receiptForTransaction") continue;
                                   
                                   files.push({"text":filename,"checked":"false"});
                                   }
                                   
                                   
                                   
                                   });
                      
                      
                      });
         
         
     return{
         localFilesAll: function(){
         
         var list = [];
         for (i=0; i < window.localStorage.length; i++) {
         //alert(i);
         if(window.localStorage.key(i).length >=30)continue;
         var filename = window.localStorage.key(i);
         if(filename=="logoArray") continue;if(filename=="inapp") continue;if(filename=="sound") continue;if(filename=="cloudInapp") continue;
         if(filename=="inapplocal") continue;if(filename=="inappPurchase") continue;if(filename=="flag") continue;if(filename=="share") continue;
         if(filename=="cellArray") continue;if(filename=="sk_receiptForProduct") continue;if(filename=="sk_receiptForTransaction") continue;
         if(filename=="didTutorial" || filename=="rename"|| filename == "choice") continue;
         
         
         
         //alert(filename);
         list.push({"text":filename,"checked":"false"});
         
         }
         
         return list;
         
         },
         dropboxFilesAll: function(){
         return files;
         },
         remove: function(fileStr){
         var promise = dropbox.deletePath("/"+fileStr);
         
         promise.fail(function(){
                      showToast("File could not be deleted.Try again");
                      });
         promise.done(function(data){
                      //alert(JSON.stringify(data));
                      //navigator.notification.alert("File deleted",null,applicationName);
                      });
         
         },
         dropboxRefreshAll:function(){
         var files = new Array();
         
         
         var promise = dropbox.checkLink();
         promise.fail(function(){
                      console.log("dropbox connection is unsuccessful");
                      showToast("Connection unsuccesful.Login to Dropbox");
                      });
         promise.done(function(){
                      //populate list
                      
                      var promise = dropbox.listFolder("/");
                      promise.fail(function(){
                                   console.log("dropbox connection is unsuccessful");
                                   showToast("Connection unsuccesful.Login to Dropbox");
                                   
                                   });
                      
                      promise.done(function(data){
                                   
                                   for (i=0; i<data.length; i++){
                                   if (data[i].isFolder) continue;
                                   filename = decodeURI(data[i].path.slice(1))
                                   if(filename=="logoArray") continue; if(filename=="inapp") continue; if(filename=="sound") continue; if(filename=="cloudInapp") continue;
                                   if(filename=="inapplocal") continue; if(filename=="inappPurchase") continue;if(filename=="flag") continue;
                                   if(filename=="share") continue;if(filename=="cellArray") continue;
                                   if(filename=="sk_receiptForProduct") continue;
                                   if(filename=="sk_receiptForTransaction") continue;
                                   if(filename=="didTutorial" || filename=="rename"|| filename == "choice") continue;
                                   
                                   files.push({"text":filename,"checked":"false"});
                                   
                                   }
                                   
                                   
                                   });
                      
                      
                      });
         return files;
         }
         
    };
      
})

.factory('CloudService', function($http){
         
         return{
         
         checkLogin:function(){
         return $http.get("http://aspiringapps.com/webapp",{params:{action:"login"}});
         },
         request: function(message){
         return $http({ url:"http://aspiringapps.com/webapp",method:"POST",params:message});
         },
         restore:function(message){
         return $http.get("http://aspiringapps.com/restore",{params:message});
         },
         saveInit: function(){
         
         $http.get("http://aspiringapps.com/webapp",{params:{action:"getInapp",appname:"Vehicle Maintenance"}}).
         success(function(response) {
                 // this callback will be called asynchronously
                 // when the response is available
                 var result = response.result;
                 //alert(result);
                 if (result == "no" || result == "fail") {
                 //update save
                 
                 
                 var message = {action:"update",appname:"Vehicle Maintenance"};
                 $http({url:"http://aspiringapps.com/webapp",method:"POST",params:message}).
                 success(function(responses){
                         var results = responses.result;
                         ////alert("sencond:"+result);
                         if(results == "ok"){
                         var productList=[{"Feature": "save","Id": "2017vhmCloud","Purchase":"Yes","Consumed":0,"Own":5}];
                         window.localStorage.setItem("cloudInapp",JSON.stringify(productList));
                         console.log("cloud product list created: "+JSON.stringify(productList));
                         }
                         else{
                         console.log("Failed initialisation");
                         }
                         
                 }).
                 error(function(e){
                       
                 });
                 
                 }
                 else{
                 
                 var items;
                 if(result.own == 0){
                 items=[{"Feature": "save","Id": "2017vhmCloud","Purchase":"No","Consumed":result.consumed,"Own":result.own}];
                 }
                 else{
                 items=[{"Feature": "save","Id": "2017vhmCloud","Purchase":"Yes","Consumed":result.consumed,"Own":result.own}];
                 }
                 
                 
                 window.localStorage.setItem("cloudInapp",JSON.stringify(items));
                 console.log("cloud product list created from server: "+JSON.stringify(items));
                 //return "success";
                 
                 }
                 }).
         error(function(e) {
               // called asynchronously if an error occurs
               // or server returns response with an error status.
               });
         
         
         
         
         },
         restoreInit: function(){
         
         $http.get("http://aspiringapps.com/restore",{params:{action:"getInapp",appname:"Vehicle Maintenance"}}).
         success(function(response) {
                 // this callback will be called asynchronously
                 // when the response is available
                 var result = response.result;
                 //alert(result);
                 if(result == "no" || result == "fail"){
                 
                 if(!window.localStorage.getItem("inapplocal")){
                   var productList=[];
                   productList.push({"Feature": "10Pdf","Id": "2017vhm10Pdf","Purchase":"No","Consumed":0,"Own":0 });
                   productList.push({"Feature": "25Pdf","Id": "2017vhm25Pdf","Purchase":"No","Consumed":0,"Own":0 });
                   productList.push({"Feature": "50Pdf","Id": "2017vhm50Pdf","Purchase":"No","Consumed":0,"Own":0 });
                   productList.push({"Feature": "100Pdf","Id": "2017vhm100Pdf","Purchase":"No","Consumed":0,"Own":0});
                   productList.push({"Feature": "fb-tw-sms-whatsapp","Id": "2017vhm10share","Purchase":"No","Consumed":0,"Own":0});
                    productList.push({"Feature": "email-print-save","Id": "2017vhmSavePrintEmail","Purchase":"Yes","Consumed":0,"Own":5});
                    productList.push({"Feature": "pdf-ibooks","Id": "2017vhmSavePdf","Purchase":"No","Consumed":0,"Own":0});
                    productList.push({"Feature": "email-second-print-save","Id": "2017vhm500SavePrintEmail","Purchase":"No","Consumed":0,"Own":0});/*** 500 & 1000 times Save as, Print and Email ***/
                    productList.push({"Feature": "email-third-print-save","Id": "2017vhm1000SavePrintEmail","Purchase":"No","Consumed":0,"Own":0});

                   window.localStorage.setItem("inapplocal",JSON.stringify(productList));
                   console.log("product list created: "+JSON.stringify(productList));
                   var products = JSON.stringify(productList);
                   setCloudRestoreItems(products);
                   //alert(result);
                   console.log("init:end");
                 }
                 var products = window.localStorage.getItem("inapplocal");
                 setCloudRestoreItems(products);
                 
                 
                 }
                 else{
                 //window.localStorage.setItem("inapplocal",result);
                 //console.log("product list from server: "+result);
                 
                 }
                 }).
         error(function(e) {
               // called asynchronously if an error occurs
               // or server returns response with an error status.
               });
         
         
         }
         };
         
         
})

.factory('App', function() {
  
 var footerList;
         var device = getDeviceType();
         if(device == "iPad" || device == "default"){
         footerList = [{
                       index: 1,
                       name: 'Maintenance 1'
                       }, {
                       index: 2,
                       name: 'Maintenance 2'
                       },{
                       index: 3,
                       name: 'Sample Maintenance 1'
                       },{
                       index: 4,
                       name: 'Sample Maintenance 2'
                       }];
         }
         else if(device == "iPhone" || device == "iPod"){
         footerList = [{
                       index: 1,
                       name: 'Maintenance 1'
                       }, {
                       index: 2,
                       name: 'Maintenance 2'
                       },{
                       index: 3,
                       name: 'Sample Maintenance 1'
                       },{
                       index: 4,
                       name: 'Sample Maintenance 2'
                       }];
         }
     
  return {
    footers: function() {
     var footers = footerList;
     
     if(!window.localStorage.getItem("rename")){
         return footers;
     }
     else{
         var footerObj = JSON.parse(window.localStorage.getItem("rename"));
         var savedList = footerObj['home'];
     
     
         if(savedList){
            for(var i in footers){
                for(var j in savedList){
                    if(footers[i].index == savedList[j].index){
                        footers[i].name = savedList[j].name;
                    }
                }
            }
        }
     
     }
    return footerList;
    },
    name : function(){
      return selectedFile;
    },
    checkbook: function(){
         var footers;
         
         if(!window.localStorage.getItem("rename")){
         if(device == "iPad" || device == "default"){
         footers = [{index: 1,name: 'Ledger 1'}, {index: 2,name: 'Ledger 2'},{index: 3,name: 'Ledger 3'},{index: 4,name: 'Ledger 4'},{ index: 5,name: 'Ledger 5' }];
         }
         else{
         footers = [{index: 1,name: 'Ledger 1'}, {index: 2,name: 'Ledger 2'},{index: 3,name: 'Ledger 3'},{index: 4,name: 'Ledger 4'},{ index: 5,name: 'Ledger 5' }];
         }
         }
         else{
         var footerObj = JSON.parse(window.localStorage.getItem("rename"));
         var footerList = footerObj['ledger'];
         
         if(device == "iPad" || device == "default"){
         footers = [{index: 1,name: 'Ledger 1'}, {index: 2,name: 'Ledger 2'},{index: 3,name: 'Ledger 3'},{index: 4,name: 'Ledger 4'},{ index: 5,name: 'Ledger 5' }];
         }
         else{
         footers = [{index: 1,name: 'Ledger 1'}, {index: 2,name: 'Ledger 2'},{index: 3,name: 'Ledger 3'},{index: 4,name: 'Ledger 4'},{ index: 5,name: 'Ledger 5' }];
         }
         
         if(footerList){
         for(var i in footers){
         for(var j in footerList){
         if(footers[i].index == footerList[j].index){
         footers[i].name = footerList[j].name;
         }
         }
         }
         }
         
         }
     return footers;
    }
         
  };
})

.factory('Items',function(){
         
         
         
         
         return {
         all: function(){
         
         var items = new Array();
         if(!window.localStorage.getItem("inapplocal")){
         //alert("no");
         //item.init();
         var productList=[];
         productList.push({"Feature": "10Pdf","Id": "2017vhm10Pdf","Purchase":"No","Consumed":0,"Own":0 });
         productList.push({"Feature": "25Pdf","Id": "2017vhm25Pdf","Purchase":"No","Consumed":0,"Own":0 });
         productList.push({"Feature": "50Pdf","Id": "2017vhm50Pdf","Purchase":"No","Consumed":0,"Own":0 });
         productList.push({"Feature": "100Pdf","Id": "2017vhm100Pdf","Purchase":"No","Consumed":0,"Own":0});
         productList.push({"Feature": "fb-tw-sms-whatsapp","Id": "2017vhm10share","Purchase":"No","Consumed":0,"Own":0});
         productList.push({"Feature": "email-print-save","Id": "2017vhmSavePrintEmail","Purchase":"Yes","Consumed":0,"Own":5});
         productList.push({"Feature": "pdf-ibooks","Id": "2017vhmSavePdf","Purchase":"No","Consumed":0,"Own":0});
         productList.push({"Feature": "email-second-print-save","Id": "2017vhm500SavePrintEmail","Purchase":"No","Consumed":0,"Own":0});/*** 500 & 1000 times Save as, Print and Email ***/
         productList.push({"Feature": "email-third-print-save","Id": "2017vhm1000SavePrintEmail","Purchase":"No","Consumed":0,"Own":0})
         
         window.localStorage.setItem("inapplocal",JSON.stringify(productList));
         console.log("product list created local: "+JSON.stringify(productList));
         
         
         }
         
         var products= JSON.parse(window.localStorage.getItem('inapplocal'));
         
         var desc;var price=0;
         
         for(var i=0;i<products.length;i++){
         
         if(products[i].Feature == "10Pdf"){
         desc = "Send upto 10 PDFs";
         price = 0.99;
         }
         else if(products[i].Feature == "25Pdf"){
         desc = "Send upto 25 PDFs";
         price = 1.99;
         }
         else if(products[i].Feature == "50Pdf"){
         desc = "Send upto 50 PDFs";
         price = 2.99;
         }
         else if(products[i].Feature == "100Pdf"){
         desc = "Send upto 100 PDFs";
         price = 3.99;
         }
         else if(products[i].Feature == "fb-tw-sms-whatsapp"){
         desc = "Share upto 10 PDFs";
         price = 0.99;
         }
         else if(products[i].Feature == "email-print-save"){
         desc = "10 times Email, Print and Save as";
         price = 0.99;
         }
         else if(products[i].Feature == "pdf-ibooks"){
         desc = "Email 10 PDFs via Gmail";
         price = 0.99;
         }
         /*** 500 & 1000 times Save as, Print and Email ***/
         else if(products[i].Feature == "email-second-print-save"){
         desc = "500 times Email, Print and Save as";
         price = 4.99;
         }
         else if(products[i].Feature == "email-third-print-save"){
         desc = "1000 times Email, Print and Save as";
         price = 6.99;
         }
         else{
         continue;
         }
         
         var left = parseInt(products[i].Own)-parseInt(products[i].Consumed);
         
         if(products[i].Purchase == "Yes"){
         items.push({"name":products[i].Feature,"units":left ,"show":"true","desc":desc, "id":products[i].Id, "price": price});
         }
         else{
         items.push({"name":products[i].Feature,"units":left ,"show":"false","desc":desc, "id":products[i].Id , "price": price});
         }
         }
         
         ////cloudinapp
         
         if(window.localStorage.getItem("cloudInapp")){
         desc = "Sync and backup 10 files to server";
         var p = JSON.parse(window.localStorage.getItem("cloudInapp"));
         var l = parseInt(p[0].Own)-parseInt(p[0].Consumed);
         
         var price = 0.99;
         if(p[0].Purchase == "Yes"){
         items.push({"name":p[0].Feature,"units":l ,"show":"true","desc":desc, "id":p[0].Id , "price": price});
         }
         else{
         items.push({"name":p[0].Feature,"units":l ,"show":"false","desc":desc, "id":p[0].Id , "price": price});
         }
         }
         //alert(JSON.stringify(items));
         return items;
         }
         };
})

.factory('ModalService',function($ionicModal, $timeout, CloudService){
         
         var promise;
         
         return{
         init: function(template, $scope){
         
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
         
         
         promise = $ionicModal.fromTemplateUrl(template, {
                                               scope: $scope,
                                               animation: 'slide-in-up'
                                               }).then(function(modal) {
                                                       
                                                       if(template.indexOf("login") == -1){
                                                       $scope.modalB = modal;
                                                       }
                                                       else{
                                                       $scope.modalA = modal;
                                                       }
                                                       
                                                       return modal;
                                                       });
         
         
         
         $scope.openModal = function(flag) {
         if(flag == "A"){
         $scope.modalA.show();
         }
         else{
         $scope.modalB.show();
         }
         
         };
         
         $scope.closeLogin = function() {
         $scope.modalA.hide();
         };
         
         $scope.closeRegister = function() {
         $scope.modalB.hide();
         };
         $scope.startRegistration = function(){
         
         $scope.closeLogin();
         $timeout(function(){
                  $scope.openModal("B");
                  },10);
         
         };
         
         $scope.startLogin = function(){
         $scope.closeRegister();
         $timeout(function(){
                  $scope.openModal("A");
                  },10);
         
         };
         // Form data for the login modal
         $scope.loginData = {};
         $scope.registerData = {};
         $scope.spin = {show: false};
         
         
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
                                            
                                            showToast("Password or email incorrect.Try again");
                                            $scope.loginData = {};
                                            $scope.closeLogin();
                                            
                                            }
                                            else if(result == "ok"){
                                            
                                            $scope.closeLogin();
                                            showToast("Login successful");
                                            
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
                                            
                                            $scope.registerData = {};
                                            $scope.closeRegister();
                                            
                                            }
                                            else if( result== "exist"){
                                            //alert("try again");
                                            showToast("User already exists.Login to continue");
                                            $scope.registerData = {};
                                            $scope.closeRegister();
                                            
                                            }
                                            else if(result == "ok"){
                                            
                                            $scope.closeRegister();
                                            
                                            $scope.registerData = {};
                                            // cloudInapp
                                            CloudService.saveInit();
                                            CloudService.restoreInit();
                                            showToast("Registration successful");
                                            }
                                            });
         
         
         };
         
         $scope.$on('$destroy', function() {
                    $scope.modalA.remove();
                    $scope.modalB.remove();
                    });
         
         
         return promise;
         
         
         }
         };
         
         })


.factory('MoreAppService', function(){
         var appbundles = new Array();
         var apps = new Array();
         
         appbundles = [{name: 'Business Suite', desc: 'Get a comprehensive view of your business',
                        link: 'https://itunes.apple.com/us/app-bundle/id938557244?mt=8', src: 'img/bundles/businesssuite.png'},
                       
                       {name: 'Company Tools', desc: 'Generate quotes, invoices and ledgers',
                        link: 'https://itunes.apple.com/us/app-bundle/id938586228?mt=8', src: 'img/bundles/companytools.png'},
                       
                       {name: 'Invoicing Tools', desc: 'Send invoices and estimates',
                        link: 'https://itunes.apple.com/us/app-bundle/id938679017?mt=8', src: 'img/bundles/invoicingtools.png'},
                       
                       {name: 'Vehicle Maintenance Suite', desc: 'Managing your finances and do financial book keeping',
                        link: 'https://itunes.apple.com/us/app-bundle/id1084813631?mt=8', src: 'img/bundles/businessledgersuite.png'},
                       
                       {name: 'Portfolio Finance', desc: 'Financial book keeping',
                        link: 'https://itunes.apple.com/us/app-bundle/id942865286?mt=8', src: 'img/bundles/portfoliofinance.png'},
                       
                       {name: 'Monthly Budget Manger', desc: 'Get a comprehensive view of your personal finance',
                        link: 'https://itunes.apple.com/us/app-bundle/id938568713?mt=8', src: 'img/bundles/monthlybudgetmanager.png'},
                       
                       {name: 'Personal Finance Assistant', desc: 'Track and manage your checking account',
                        link: 'https://itunes.apple.com/us/app-bundle/id942855915?mt=8', src: 'img/bundles/personalfinanceassistant.png'},
                       
                       {name: 'Invoicing Suite', desc: 'Manage billing and payments',
                        link: 'https://itunes.apple.com/us/app-bundle/id1085519513?mt=8', src: 'img/bundles/invoicingsuite.png'}];
         
         
         apps = [{name: 'Invoice Suite', desc: 'Manage and send estimates and invoices on the go',
                  link: 'https://itunes.apple.com/us/app/invoice-suite/id465587615?ls=1&mt=8', src: 'img/apps/invoicesuite.png'},
                 
                 {name: 'Employee Schedule', desc: 'Track your employees',
                  link: 'https://itunes.apple.com/us/app/employee-schedule/id896088632?mt=8', src: 'img/apps/employeeschedule.png'},
                 
                 {name: 'Financial Statements', desc: 'Financial book keeping',
                  link: 'https://itunes.apple.com/us/app/financial-statements/id535113504?ls=1&mt=8', src: 'img/apps/financialstat.png'},
                 
                 {name: 'Purchase Order', desc: 'Create and send purchase orders',
                  link: 'https://itunes.apple.com/us/app/purchase-order/id488522018?ls=1&mt=8', src: 'img/apps/purchaseorder.png'},
                 
                 {name: 'Checkbook Register', desc: 'Manage your finances',
                  link: 'https://itunes.apple.com/us/app/check-book-register/id488517738?mt=8', src: 'img/apps/checkbook.png'},
                 
                 {name: 'Business Quote', desc: 'Send quotes,project bids and estimates',
                  link: 'https://itunes.apple.com/us/app/business-quote/id477522727?mt=8', src: 'img/apps/quote.png'},
                 
                 {name: 'Employee Schedule Pro', desc: 'Collaborate with your employees',
                  link: 'https://itunes.apple.com/us/app/employee-schedule-pro/id1097408035?mt=8', src: 'img/apps/empschedulepro.png'},
                 
                 {name: 'Business Invoices', desc: 'On field Invoicing app for small businesses',
                  link: 'https://itunes.apple.com/us/app/business-invoices/id1084984430?mt=8', src: 'img/apps/businessinvoices.png'},
                 
                 {name: 'Monthly Budget', desc: 'Track your income and expenses',
                  link: 'https://itunes.apple.com/us/app/monthly-budget-app/id626186401?mt=8', src: 'img/apps/monthlybudget.png'}];
         
         return{
         allbundles: function(){
         return appbundles;
         },
         allapps: function(){
         return apps;
         }
         };
         });





