/**********************************************/
/* Copyright 2011, Aspiring Investments, Corp */
/**********************************************/
enyo.kind(
    { name: "enyo.Canon.AlarmClock_new", pack:"center", kind: "VFlexBox", style:"background-image: url('images/wallpapers/Space2.jpg');", components: [		
	  {content:"", flex:1},
	  {kind: "VFlexBox", style: "border-width:0px;border-style:none",components: [
	       {kind:"HFlexBox", pack:"center", style: "border-width:0px;border-style:none", components:[
		    {name:"h1", kind: "Image", src: ""},
		    {name:"h2", kind: "Image", src: ""},
		    {name:"c1", kind: "Image", src: "images/ccolon.png"},
		    {name:"m1", kind: "Image", src: ""},
		    {name:"m2", kind: "Image", src: ""},
		    {name:"c2", kind: "Image", src: "images/ccolon.png"},
		    {name:"s1", kind: "Image", src: ""},
		    {name:"s2", kind: "Image", src: ""},
		    {name:"ampm", kind: "Image", src: ""}
		]},
	       {
		   kind: "Spacer"
	       },
	       {
		   kind: "Spacer"
	       },
	       {kind: "HFlexBox", pack:"center", style:"border-width:0px;border-style:none", components: [
		    {name:"Date", content:"", style: "color:#FFFFFF;font-size:40px;"}
		]}
	   ]},
	  {content:"", flex:1},
	  {kind: "HFlexBox", components: [
               { name:"almnotif", kind:"Image", src: "images/alarm-on.png", popup: "atTimeSetTime", onclick: "showAlarmSettingDialog"
	       },
	       {
		   name:"almtimestring", style:"color:#FFFFFF;", content: "Sat, 10:00 am"
	       },
               {flex:1},
               { name:"toolbox", kind:"Image", src: "images/tools.png",  popup:"mainTools", onclick:"showPopUp"}
	   ]
	  },
	  {
	      name: "mainTools", kind: "ModalDialog", components: [
                  {
		      kind: "VFlexBox", components: [
			  {
			      kind: "Item", className: "enyo-first", components: [
				  {kind:"Button", label:"Set Alarm", popup: "atTimeSetTime", onclick: "showAlarmSettingDialog"}
			      ]
			  },
			  {
			      kind: "Item", className: "enyo-secondary", components: [
				  {kind:"Button", label:"Select Wallpaper", popup: "wallpaperdialog", onclick: "showPopUp"}
			      ]
			  },
			  {
			      kind: "Item", className: "enyo-secondary", components: [
				  {kind:"Button", label:"Select Alarm Ringtone", onclick: "showFilePicker"}
			      ]				 
			  },
			  {
			      kind: "Item", className: "enyo-last", components: [
				  {kind:"Button", label:"Done", popup: "mainTools", onclick: "closePopUp"}
			      ]
			  }
		      ]
		      
		  }
	      ]
	  },
	  {
	      name: "wallpaperdialog",
	      kind: "ModalDialog",
	      noScroller: true,
	      components: [
		  
		  {kind: "PrevNextBanner", onPrevious: "previousImage", onNext: "nextImage", components: [
		       {kind: "Spacer"},
		       {kind: "Spacer"}
		   ]},
		  {name: "imageView", kind: "BasicImageView", flex: 1, onSnap: "snapImage", width: "400px", height: "400px", images: [
		       "images/wallpapers/Space1.jpg",
		       "images/wallpapers/Space2.jpg",
		       "images/wallpapers/Space3.jpg",
		       "images/wallpapers/Space4.jpg",
		       "images/wallpapers/Space5.jpg",
		       "images/wallpapers/Space6.jpg",
		       "images/wallpapers/Space7.jpg",
               "images/wallpapers/Space8.jpg",
               "images/wallpapers/Space9.jpg",
               "images/wallpapers/Space10.jpg",
               "images/wallpapers/Space11.jpg",
               "images/wallpapers/Space12.jpg",
               "Images/wallpapers/Space13.jpg"
                                                                                                                              
		   ]},
		  {kind: "HFlexBox", components: [
		       {kind: "Button", flex:1, caption: "Preview", onclick: "wallpaperPreview"},
		       {kind: "Button", flex:1, caption: "Done", popup: "wallpaperdialog", onclick: "wallpaperDone"},
		       {kind: "Button", flex:1, caption: "Cancel", popup: "wallpaperdialog", onclick: "wallpaperCancel"}
		       
		   ]},
		  
	      ],
	  },
	  {name:"atTimeSetTime",kind: "ModalDialog", components: [
	       {
		   kind: "VFlexBox", components: [
		       {
			   kind: "Item", className: "enyo-first", components: [
			       {
				   kind: "HFlexBox", components: [ 				     
				       {
					   content:"Alarm Enable"
				       },
				       {
					   flex: 1
				       },
				       {
					   kind: "ToggleButton",
					   state: true,
					   name: "alarmenabled"
				       }
				   ]
			       }
			       
			   ]
		       },
		       {
			   kind: "Item", className: "enyo-secondary", components: [
			       {kind:"TimePicker", className: "picker-hbox", label:"Time", name:"alarmTimePicker"},
			       {
				   flex: 1
			       }
			   ]
		       },
		       {
			   kind: "Item", className: "enyo-secondary", components: [
			       {kind:"Button", label:"Repeat", popup:"atTimeSetDays", onclick: "showAtTimeSetDays", name: "repeat"}
			   ]
		       },
		       {
			   kind: "Item", className: "enyo-last", components: [
			       {kind:"HFlexBox", components: [
				    {kind: "Button", flex:1, caption: "Done", onclick: "setAlarmSubmit"},
				    {kind: "Button", flex:1, caption: "Cancel", popup: "atTimeSetTime", onclick: "setAlarmCancel"}
				]}
			   ]
		       }
		   ]
	       }
	   ]},
	  {name:"atTimeSetDays",kind: "ModalDialog", components: [
	       {kind:"VFlexBox", caption:"Play Alarm on:",components: [
		    {kind:"HFlexBox", components: [
			 {name:"mon", kind: "CheckBox", style:"margin-right:20px;"},
			 {content: "Monday"}
		     ]},
		    {kind:"HFlexBox", components: [
			 {name:"tue", kind: "CheckBox", style:"margin-right:20px;"},
			 {content: "Tuesday"}
		     ]},
		    {kind:"HFlexBox", components: [
			 {name:"wed", kind: "CheckBox", style:"margin-right:20px;"},
			 {content: "Wednesday"}
		     ]},
		    {kind:"HFlexBox", components: [
			 {name:"thu", kind: "CheckBox", style:"margin-right:20px;"},
			 {content: "Thursday"}
		     ]},
		    {kind:"HFlexBox", components: [
			 {name:"fri", kind: "CheckBox", style:"margin-right:20px;"},
			 {content: "Friday"}
		     ]},
		    {kind:"HFlexBox", components: [
			 {name:"sat", kind: "CheckBox", style:"margin-right:20px;"},
			 {content: "Saturday"}
		     ]},
		    {kind:"HFlexBox", components: [
			 {name:"sun", kind: "CheckBox", style:"margin-right:20px;"},
			 {content: "Sunday"},
		     ]},
		    {kind:"HFlexBox", components: [
			 {kind: "Button", flex:1, caption: "Done", popup: "atTimeSetDays", onclick: "closeAtTimeSetDays"},
			 {kind: "Button", flex:1, caption: "Cancel", popup: "atTimeSetDays", onclick: "closePopUp"}
		     ]}
		]}
	   ]},
	  {name: "alarmModalDialog", kind:"ModalDialog", components: [
	       {kind:"HFlexBox", components: [	       
		    {kind:"Button", flex: 1, caption: "Snooze", onclick:"snoozealarm"},
		    {kind:"Button", flex: 1, caption: "Stop Alarm", onclick:"stopalarm"}
		]}
	   ]},
	  { name: "calAlarm", kind: "PalmService", service: "palm://com.palm.power/timeout", method: "set", onSuccess: "onSetAlarmSuccess", onFailure: "onSetAlarmFail"},
	  { name: "clAlarm", kind: "PalmService", service: "palm://com.palm.power/timeout", method: "clear", onSuccess: "onClearAlarmSuccess", onFailure: "onClearAlarmFail"},
	  { kind: "ApplicationEvents",
	    onApplicationRelaunch: "applicationRelaunched", onWindowDeactivated: "windowDeactivated"
	  },
	  {name: "sound", kind: "Sound", src: "/media/internal/ringtones/Anticipation.mp3" /*, preload: true */},
	  {name:'filePicker', kind: "FilePicker", fileType:["ringtone"], currentRingtonePath:"/media/internal/ringtones/Anticipation.mp3", onPickFile: "handlePickResult", onCancel: "pickFileCancel", onSelect: "pickFileSelect"}
      ],
      // these are constants
      CSnoozeTime: 10*60,       // how long is the snooze
      CSnoozeStr: "00:10:00",   // snooze time as a str
      CLimitStr: "00:20:00",    // after this time a ringing alarm is shut off to prevent battery drainage
      CMaxInStr: "23:00:00",
      CMaxInStrTime: 23*3600,
      showAtTimeSetDays: function() {
	  this.$.atTimeSetDays.openAtCenter();
	  var almobj = this.getAlarmObj();

	  if (this.tmpdays && this.tmpdays != "") {
	      for (var idx=0; idx<7; idx++) {
		  if (this.tmpdays.charAt(idx) == "1") {
		      this.$[this.getShortDayFromNo(idx)].setChecked(true);
		  } else {
		      this.$[this.getShortDayFromNo(idx)].setChecked(false);
		  }		  		      
	      }
	      return;
	  }

	  if (almobj && almobj.valid) {
	      for (var idx=0; idx<7; idx++) {
		  if (almobj.days && almobj.days.charAt(idx) == "1") {
		      this.$[this.getShortDayFromNo(idx)].setChecked(true);
		  } else {
		      this.$[this.getShortDayFromNo(idx)].setChecked(false);
		  }		  
	      }	      
	  } else {
	      for (var idx=0; idx<7; idx++) {
		  // alldays
		  this.$[this.getShortDayFromNo(idx)].setChecked(true);		  
	      }
	  }
	  
      },
      closeAtTimeSetDays: function() {
	  var daystr = ""
	  this.tmpdays = ""
	  for (var idx=0; idx<7; idx++) {
	      if (this.$[this.getShortDayFromNo(idx)].getChecked()) {
		  this.tmpdays = this.tmpdays+"1"
		  if (daystr == "") {
		      daystr = daystr+this.getShortDayFromNo(idx)
		  } else {
		      daystr = daystr+","+this.getShortDayFromNo(idx);	  
		  }
	      } else {
		  this.tmpdays = this.tmpdays+"0"
	      }
	  }
	  if (daystr == "mon,tue,wed,thu,fri") {
	      this.$.repeat.setCaption("Repeat (Weekdays)");
	  } else if (this.tmpdays == "0000000") {
	      this.$.repeat.setCaption("Days");	      
	  } else if (this.tmpdays == "1111111") {
	      this.$.repeat.setCaption("Days (all)");	      
	  } 
	  else {
	      this.$.repeat.setCaption("Days ("+daystr+")");
	  }
	  this.$.atTimeSetDays.close();	  
      },
      showAlarmSettingDialog: function() {
	  // set the dialog attributes according to the cookie
	  this.$.atTimeSetTime.openAtCenter();	  
	  this.tmpdays = ""
	  var almobj = this.getAlarmObj();
	  if (almobj == null) {
	      // set alm to enable
	      this.$.alarmenabled.setState(true);
	      // set repeat to weekdays
	      this.$.repeat.setCaption("Days (all)");
	      this.tmpdays = "1111111";
	  } else {
	      this.tmpdays = almobj.days;
	      this.$.alarmenabled.setState(almobj.valid);
	      if (almobj.valid) {
		  var daystr = ""
		  for (var idx=0; idx<7; idx++) {
		      if (almobj.days && almobj.days.charAt(idx) == "1") {
			  if (daystr == "") {
			      daystr = daystr+this.getShortDayFromNo(idx)
			  } else {
			      daystr = daystr+","+this.getShortDayFromNo(idx);	  
			  }
		      }
		  }
		  if (daystr == "mon,tue,wed,thu,fri") {
		      this.$.repeat.setCaption("Days (weekdays)");
		  } 
		  else if (daystr == "sun,mon,tue,wed,thu,fri,sat") {
		      this.$.repeat.setCaption("Days (all)");		      
		  }
		  else if (daystr != "") {
		      this.$.repeat.setCaption("Days ("+daystr+")");
		  } else {
		      this.$.repeat.setCaption("Days");		      
		  }
		  var time = new Date();
		  time.setHours(almobj.ampm=="AM"?almobj.hour:12+almobj.hour);
		  time.setMinutes(almobj.min);
		  this.$.alarmTimePicker.setValue(time);
	      }
	  }

      },
      resizeHandler: function() {
	  console.log("resized");
          //this.$.imageView.resize();
	  //this.setwallpaper();
      },
      previousImage: function() {
	  this.$.imageView.previous();
      },
      nextImage: function() {
	  this.$.imageView.next();
      },
      snapImage: function(inSender, inValue) {
	  this.previewValue = inValue;
	  console.log("selectedwallpaper is "+inValue);
      },
      wallpaperPreview: function() {
	  if (!this.previewValue) { 
	      this.previewValue = 0;
	  }
	  console.log("selected wallpaper is "+this.previewValue);
	  this.applyStyle("background-image", "url("+"'"+this.images[this.previewValue]+"'"+")");
      },      
      wallpaperDone: function() {
	  console.log("selected wallpaper is "+this.previewValue);
	  this.applyStyle("background-image", "url("+"'"+this.images[this.previewValue]+"'"+")");
	  this.setAlarmSetting("wallpaper", this.previewValue+"");
	  this.$.wallpaperdialog.close();
      },
      wallpaperCancel: function() {
	  var selectedVal = parseInt(this.getAlarmSetting("wallpaper"));
	  console.log("old value is: "+selectedVal)
	  this.applyStyle("background-image", "url("+"'"+this.images[selectedVal]+"'"+")");
	  this.$.wallpaperdialog.close();
      },
      alarmExpiry: function(inSender, inResponse) {
	  // play the alarm
	  console.log("ALARM EXPIRED !!!")

	  if (this.getAlarmState() == "none") {
	      this.$.sound.audio.loop = true;
	      this.$.atTimeSetTime.close();
	      this.$.atTimeSetDays.close();	  
	      this.$.alarmModalDialog.close();
	      this.$.alarmModalDialog.openAtCenter();
	      if (this.getAlarmSetting("ringtone")) {
		  this.$.sound.setSrc(this.getAlarmSetting("ringtone"));
	      } 
	      this.$.sound.play();		  
	      
	      this.$.sound.audio.loop = true;
	      /* set the next alarm */
	      this.setAlarmState("ringing");
	      /* set the limit timer */
	      this.setLimitTimer(this.CLimitStr); // in 0 hrs, 10 min, 0 sec
	  } else {
	      console.log("ignoring since state is not none")
	  }
	  /* set the next alarm */
	  var alarmobj = this.getAlarmObj();
	  this.setAlarm(alarmobj);
	  this.updateNextAlarm();
      },
      windowDeactivated: function() {
	console.log("window deactivated");  
      },
      applicationRelaunched: function(inSender, inResponse) {
	  console.log("Application Relaunched ");
	  //this.inherited(arguments);
	  this.applySettings();
	  this.startClock();
	  // check if alarm has expired, if so call alarmexpiry
	  this.checkAlarmExpiry();
	  this.checkLimitTimerExpiry();
	  this.updateNextAlarm();
	  
      },
      create: function() {
	  console.log("Application Created ");
	  this.images = ["images/wallpapers/Space1.jpg",
			 "images/wallpapers/Space2.jpg",
			 "images/wallpapers/Space3.jpg",
			 "images/wallpapers/Space4.jpg",
			 "images/wallpapers/Space5.jpg",
			 "images/wallpapers/Space6.jpg",
			 "images/wallpapers/Space7.jpg"
             "images/wallpapers/Space8.jpg",
             "images/wallpapers/Space9.jpg",
             "images/wallpapers/Space10.jpg",
             "images/wallpapers/Space11.jpg",
             "images/wallpapers/Space12.jpg",
             "Images/wallpapers/Space13.jpg"
                     
                     ];
	  this.inherited(arguments);
	  this.applySettings();
	  this.startClock();
	  // check if alarm has expired, if so call alarmexpiry
	  this.checkAlarmExpiry();
	  this.checkLimitTimerExpiry();
	  this.updateNextAlarm();

      },
      isThereAlarmNow: function() {
	  var alarmobj = this.getAlarmObj();
	  if (alarmobj==null || alarmobj.valid == false) {
	      return false;
	  }	  
	  var almhour = parseInt(alarmobj.hour);
	  var almmin = parseInt(alarmobj.min);
	  if ((alarmobj.ampm == "PM") && (parseInt(alarmobj.hour) != 12))  {
	      almhour = almhour+12;
	  }
	  if ((alarmobj.ampm == "AM") && (parseInt(alarmobj.hour) == 12))  {
	      almhour = 0;
	  }
	  console.log("isThereAlmNow: "+almhour+":"+almmin);
	  var now = new Date();
	  var nowday = now.getDay();
	  var nowhour = now.getHours();
	  var nowmin = now.getMinutes();
	  var nowsec = now.getSeconds();
	  // hour, min and day have to match and nowsec must be less than 10
	  if (alarmobj.days && (alarmobj.days.charAt(nowday) == "1") &&
	     (almhour == nowhour) && (almmin == nowmin) && (nowsec <= 10)) {
	      return true;
	  }
	  return false;
      },
      checkAlarmExpiry: function() {
	  var alarmobj = this.getAlarmObj();
	  if (alarmobj==null || alarmobj.valid == false) {
	      console.log("alarm is not valid !");
	      return;
	  }
	  if (this.isThereAlarmNow()) {
	      console.log("alarm is expired in check!!");
	      setTimeout(enyo.bind(this, "alarmExpiry"), 3000);
	      //this.alarmExpiry();
	  }
	  else {
	      console.log("no alarm now");
	      // set the next alarm
	      setTimeout(enyo.bind(this, "setNextAlarm"), 1000);
	  }
      },
      setNextAlarm: function() {
	  // sets the next alarm
	  console.log("setting next alarm");
	  var alarmobj = this.getAlarmObj();
	  if (alarmobj==null || alarmobj.valid == false) {
	      return;
	  }
	  this.setAlarm(alarmobj);
      },
      clearAlarm: function() {
	  var params = {
	      key: enyo.fetchAppId() + '.timer',
	  };
	  this.$.clAlarm.setParams(params);
	  this.$.clAlarm.call();
      },
      closePopUp: function(inSender) {
	  this.$[inSender.popup].close();
      },
      getAlarmId: function() {
	  return enyo.fetchAppId()+".alarm3";  
      },
      applySettings: function() {
	  // apply wallpaper
	  if (this.getAlarmSetting("wallpaper") != null) {
	      console.log("wallpaper is "+this.getAlarmSetting("wallpaper"));
	      this.selectedValue = parseInt(this.getAlarmSetting("wallpaper"));
	  } else {
	      this.selectedValue = 0;
	      this.setAlarmSetting("wallpaper", this.selectedValue);
	  }
	  this.applyStyle("background-image", "url("+"'"+this.images[this.selectedValue]+"'"+")");
	  // apply sound
	  if (this.getAlarmSetting("ringtone") == null) {
	      console.log("ringtone is "+this.getAlarmSetting("ringtone"));
	      this.setAlarmSetting("ringtone", "/media/internal/ringtones/Anticipation.mp3");
	  }
	  
      },
      getAlarmSettingId: function() {
	return enyo.fetchAppId()+".alarmsettings3";  
      },
      setAlarmSetting: function(setting, val) {
	  var settingid = this.getAlarmSettingId();  
	  var cookie = enyo.getCookie(settingid);	  
	  var obj = {};
	  if (cookie) {
	      obj = JSON.parse(cookie);
	  } 
	  obj[setting] = val;
	  enyo.setCookie(settingid, JSON.stringify(obj));
	  console.log(setting+" is "+obj[setting]);
      },
      getAlarmSetting: function(setting) {
	  var settingid = this.getAlarmSettingId();  	  
	  var cookie = enyo.getCookie(settingid);	  
	  if (cookie) {
	      var obj = JSON.parse(cookie);
	      console.log(setting+" is "+obj[setting]);
	      return obj[setting];
	  }
	  return null;
      },
      getDayNo: function(str) {
	  switch(str) {
	  case "mon": return 1;
	  case "tue": return 2;
	  case "wed": return 3;
	  case "thu": return 4;
	  case "fri": return 5;
	  case "sat": return 6;
	  case "sun": return 0;
	  }
      },
      getShortDayFromNo: function(no) {
	  switch(no) {
	  case 1: return "mon";
	  case 2: return "tue";
	  case 3: return "wed";
	  case 4: return "thu";
	  case 5: return "fri";
	  case 6: return "sat";
	  case 0: return "sun";
	  }	  
      },
      getDayFromNo: function(num) {
	  switch(num) {
	  case 1: return "Monday";
	  case 2: return "Tuesday";
	  case 3: return "Wednesday";
	  case 4: return "Thursday";
	  case 5: return "Friday";
	  case 6: return "Saturday";
	  case 0: return "Sunday";
	  }
      },
      getDiffInSec: function(alarmobj) { //computes time difference in seconds between current time and time in alarmobj

	  if (alarmobj == null || alarmobj.days == null || alarmobj.days == "0000000") {
	      console.log("FOUND NO DAY SET in getDiff !!");
	      return 7*24*3600;
	  }

	  var hour = parseInt(alarmobj.hour);
	  var min = parseInt(alarmobj.min);
	  var sec = parseInt(alarmobj.sec);
	  if ((alarmobj.ampm == "PM") && (parseInt(alarmobj.hour) != 12))  {
	      hour = hour+12;
	  }
	  if ((alarmobj.ampm == "AM") && (parseInt(alarmobj.hour) == 12))  {
	      hour = 0;
	  }
	  console.log(hour+":"+min+":"+sec);
	  var secfrom0000 = hour*60*60+min*60+sec;
	  var time = new Date();
	  var day = time.getDay();

	  var cursecfrom0000 = (time.getHours())*60*60 + (time.getMinutes())*60 + time.getSeconds();
	  var diffsec = 0;


	  var i = 0;
	  var cnt = (day+1)%7;
	  for(i = 0; i<7; i++) {
	      if(alarmobj.days && alarmobj.days.charAt(cnt) == "1") {
		  break;
	      }
	      else {
		  cnt++;
		  cnt = (cnt == 7?0:cnt);
	      }
	  }
	  console.log("cnt = "+cnt+" day is: "+day);
	  console.log(diffsec+","+cursecfrom0000+","+secfrom0000);

	  if (secfrom0000 >= cursecfrom0000 && (alarmobj.days && alarmobj.days.charAt(day) == "1")) {
	      diffsec = secfrom0000-cursecfrom0000;
	  }
	  else {
	      cursecfrom0000 = day*24*3600 + cursecfrom0000;
	      secfrom0000 = cnt*24*3600 + secfrom0000;

	      if (secfrom0000 >= cursecfrom0000) {
		  diffsec = secfrom0000-cursecfrom0000;
	      } else {
		  diffsec = 7*24*3600 -cursecfrom0000+secfrom0000;
	      }
	  }
	  console.log(diffsec+","+cursecfrom0000+","+secfrom0000);
	  return diffsec;
      },
      getSoundId: function() {
	  return enyo.fetchAppId()+".sound";  
      },
      handlePickResult: function(insender, msg) {
	  console.log("selected file is:"+JSON.stringify(msg))
	  if (msg.length > 0) {
	      console.log(msg[0].fullPath);
	      this.$.sound.setSrc(msg[0].fullPath);
	      this.setAlarmSetting("ringtone",msg[0].fullPath);
	      this.$.filePicker.setCurrentRingtonePath(msg[0].fullPath);
	  }
      },
      getAlarmObj: function() {
	  var cookie = enyo.getCookie(this.getAlarmId());
	  if (!cookie) {
	      return null;
	  }
	  var obj = JSON.parse(cookie);
	  return obj;
      },
      launch: function() {
	  console.log("launching...");  
      },
      onClearAlarmSuccess: function() {
	  console.log("alarm clear OK...");
      },
      onClearAlarmFail: function(inSender, inResponse) {
	  console.log("alarm clear FAIL..."+enyo.json.stringify(inResponse))
      },
      onSetAlarmFail: function(inSender, inResponse) {
	  console.log("alarm set FAIL..."+enyo.json.stringify(inResponse));
      },
      onSetAlarmSuccess: function() {
	  console.log("alarm set OK...");
      },
      hasSnoozeExpired: function() {
	  var alarmobj = this.getAlarmObj();
	  var time = (new Date()).getTime();
	  console.log(time+" "+alarmobj.snoozestart);
	  var diffsec = Math.abs(time-alarmobj.snoozestart)/1000;
	  var snoozetime = this.CSnoozeTime;
	  if (Math.abs(snoozetime-diffsec) < 10) {
	      return true;
	  }
	  return false;
	  
      },
      checkLimitTimerExpiry: function() {
	  var alarmobj = this.getAlarmObj();
	  if (!alarmobj) {
	      return;
	  }
	  if (alarmobj.state == "ringing" || (alarmobj.state == "snoozing" && this.hasSnoozeExpired())) {
	      setTimeout(enyo.bind(this, "limitTimerExpiry"), 1000);
	  } 
	  if (alarmobj.state == "snoozing" && !(this.hasSnoozeExpired())) {
	      // this is a wierd scenario where the app is closed while snoozing
	      this.setAlarmState("none");
	      this.clearLimitTimer();
	  }
      },
      limitTimerExpiry: function() {
	console.log("limit timer expiry");
	  if (this.getAlarmState() == "ringing") {
	      this.stopalarm();	      
	  } 
	  if (this.getAlarmState() == "snoozing") {
	      this.$.alarmModalDialog.close();
	      this.$.alarmModalDialog.openAtCenter();
	      if (this.getAlarmSetting("ringtone")) {
		  this.$.sound.setSrc(this.getAlarmSetting("ringtone"));
	      } 
	      this.$.sound.play();
	      this.$.sound.audio.loop = true;
	      /* set the next alarm */
	      this.setAlarmState("ringing");
	      /* set the limit timer */
	      this.setLimitTimer(this.CLimitStr); // in 0 hrs, 10 min, 0 sec
	      this.updateNextAlarm();
	  }
      },
      getAlarmState: function() {
	  var alarmobj = this.getAlarmObj();
	  if (alarmobj.state) {
	      return alarmobj.state;
	  }
	  return "none";
      },
      setAlarmState: function(state) {
	  var alarmobj = this.getAlarmObj();
	  alarmobj.state = state;
	  if (state == "snoozing") {
	      alarmobj.snoozestart = (new Date()).getTime();
	      console.log("snoozestart = "+  alarmobj.snoozestart);
	  }
	  enyo.setCookie(this.getAlarmId(),JSON.stringify(alarmobj));	  	  
      },
      clearLimitTimer: function() {
	  var params = {
	      key: enyo.fetchAppId() + '.limittimer',
	  };
	  this.$.clAlarm.setParams(params);
	  this.$.clAlarm.call();
      },
      setLimitTimer: function(instr) {
	  // set a limit timer of 10 minutes
	  //var instr = "00:01:00"; 
	  console.log("limit timer: "+instr);
	  var params = {
	      key: enyo.fetchAppId() + '.limittimer',
		  in: instr,
	      wakeup: true,
	      uri: 'palm://com.palm.applicationManager/open',
	      params: {
		  'id': enyo.fetchAppId(),
		  'params': {
		      action: 'limitTimerExpiry'
		  }
	      }
	  };
	  this.$.calAlarm.setParams(params);
	  this.$.calAlarm.call();
      },
      setAlarm: function(alarmobj) {
	  // compute the diff
	  var diffsec = this.getDiffInSec(alarmobj);
	  var instr = this.CMaxInStr;

	  if (diffsec < (this.CMaxInStrTime)) {
	      var diffinhours = Math.floor(diffsec/3600);
	      var diffinmin = Math.floor(Math.floor(diffsec - diffinhours*3600) / 60);
	      var diffinsec = diffsec - diffinhours*3600 - diffinmin*60;
	      instr = diffinhours+":"+diffinmin+":"+diffinsec; 
	  }
	  console.log("SETTING ALARM")
          console.log(JSON.stringify(alarmobj))
	  console.log(instr);
	  
	  var params = {
	      key: enyo.fetchAppId() + '.timer',
	      //at: "07/20/2011 00:01:01",
	      //at: datestr,
	      //in: "25:00:30",
	      in: instr,
	      wakeup: true,
	      uri: 'palm://com.palm.applicationManager/open',
	      params: {
		  'id': enyo.fetchAppId(),
		  'params': {
		      action: 'checkAlarmExpiry'
		  }
	      }
	  };
	  this.$.calAlarm.setParams(params);
	  this.$.calAlarm.call();
      },
      setAlarmCancel: function() {
	  this.$.atTimeSetTime.close();
	  //this.$.atTimeSetDays.close();
      },
      updateNextAlarm: function() {
	  var cook = enyo.getCookie(this.getAlarmId());
	  if(cook) {
	      var cookie = JSON.parse(cook);
	  }
	  if (cook == null || !cookie.valid || cookie.days == "0000000") {
              this.$.almnotif.setSrc("images/alarm-off.png");
	      this.$.almtimestring.setContent("No alarms");	      
	      return;
	  }
	  if (this.getAlarmState() == "ringing") {
	      this.$.almtimestring.setContent("Alarm Ringing");
	      return;
	  }
	  if (this.getAlarmState() == "snoozing") {
	      this.$.almtimestring.setContent("Snoozing");
	      return;
	  }

	  var time = new Date();
	  var cursec = time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds();
	  var hr = cookie.ampm=="AM"?(cookie.hour==12?0:cookie.hour):(cookie.hour==12?12:12+cookie.hour);
	  var almsec = hr * 3600  + cookie.min * 60 + cookie.sec;
	  var day = time.getDay();
	  var i = 0;
	  var cnt = (day+1)%7;
	  for(i = 0; i<7; i++) {
	      if(cookie.days && cookie.days.charAt(cnt) == "1") {
		  break;
	      }
	      else {
		  cnt++;
		  cnt = (cnt == 7?0:cnt);
	      }
	  }
	  var minstr = ""+cookie.min;
	  if (cookie.min < 10) {
	      minstr = "0"+minstr;
	  }
	  if ((cursec < almsec && cookie.days.charAt(day) == "1")) {
	      // no days
	      if (cursec < almsec) {
		  this.$.almtimestring.setContent(this.getDayFromNo(day)+", "+ cookie.hour + ":"+ minstr +" "+ cookie.ampm);
	      } else {
		  this.$.almtimestring.setContent(this.getDayFromNo((day+1)%7)+", "+cookie.hour + ":"+ minstr +" "+ cookie.ampm);
	      }
	  } else {
	     // figure out the next day 
	      this.$.almtimestring.setContent(this.getDayFromNo(cnt%7)+", "+ cookie.hour + ":"+ minstr +" "+ cookie.ampm);	      
	  }
	  console.log(cnt+" "+day+" "+cook);

	  //	  this.$.almtimestring.setContent(this.getDayFromNo(cnt) + ", "+cookie.hour + ":"+ cookie.min +" "+ cookie.ampm);
          this.$.almnotif.setSrc("images/alarm-on.png");
      },	
      setAlarmSubmit: function(inSender, inResponse) {
	  var time = this.$.alarmTimePicker.getValue();
	  console.log(time.getHours() + 1);
	  // do some validation that the alarm makes sense
	  var hr = time.getHours();
	  var str ="";
	  var s;
	  var i =0;
	  //for(i =0; i<7; i++) {
	  //    var s = this.getShortDayFromNo(i);
	  //    str = str + ((this.$[s] && this.$[s].getChecked())?"1":"0");

	  //}
	  str = this.tmpdays;
	  var alarmobj = {
	      valid: this.$.alarmenabled.getState(),
	      hour: hr==0?12:hr>=13?hr-12:hr,
	      min: time.getMinutes(),
	      sec: 0,
	      ampm: hr>=12?"PM":"AM",
	      days: str,
	      state: "none"
	  };
	  enyo.setCookie(this.getAlarmId(),JSON.stringify(alarmobj));
	  if (alarmobj.valid) {
	      this.setAlarm(alarmobj);
	      this.setAlarmState("none");
	      this.clearLimitTimer();
	  } else {
	      this.clearAlarm();
	      this.setAlarmState("none");
	      this.clearLimitTimer();	      
	  }

	  this.$.atTimeSetTime.close();
	  this.updateNextAlarm();
      },
      setCurrentTime: function() {
	  var time = new Date();
	  var currtime = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
	  var sections=currtime.split(":")
	  var x = parseInt(sections[0]);
	  var am = true;
	  if(x>=12) am = false;
	  if (x==0) //If hour field is 0 (aka 12 AM)
	      sections[0]="12";
	  else if(x>=13) {
	      sections[0]=x-12+"";
	  }
	  if(sections[0].length == 1) {
	      this.$.h1.setSrc("images/c0.png");
	      this.$.h2.setSrc("images/c"+sections[0].charAt(0)+".png");
	  }
	  else {
	      this.$.h1.setSrc("images/c"+sections[0].charAt(0)+".png");
	      this.$.h2.setSrc("images/c"+sections[0].charAt(1)+".png");
	  }
	  if(sections[1].length == 1) {
	      this.$.m1.setSrc("images/c0.png");
	      this.$.m2.setSrc("images/c"+sections[1].charAt(0)+".png");
	  }
	  else {
	      this.$.m1.setSrc("images/c"+sections[1].charAt(0)+".png");
	      this.$.m2.setSrc("images/c"+sections[1].charAt(1)+".png");
	  }
	  if(sections[2].length == 1) {
	      this.$.s1.setSrc("images/c0.png");
	      this.$.s2.setSrc("images/c"+sections[2].charAt(0)+".png");
	  }
	  else {
	      this.$.s1.setSrc("images/c"+sections[2].charAt(0)+".png");
	      this.$.s2.setSrc("images/c"+sections[2].charAt(1)+".png");
	  }
	  this.$.ampm.setSrc("images/c" + (am?"am":"pm") + ".png");
	  var day;
	  var month;
	  switch(time.getDay()) {
	  case 0: day = "Sunday"; break;
	  case 1: day = "Monday"; break;
	  case 2: day = "Tuesday"; break;
	  case 3: day = "Wednesday"; break;
	  case 4: day = "Thursday"; break;
	  case 5: day = "Friday"; break;
	  case 6: day = "Saturday"; break;
	  }
	  switch(time.getMonth()) {
	  case 0: month = "January"; break;
	  case 1: month = "February"; break;
	  case 2: month = "March"; break;
	  case 3: month = "April"; break;
	  case 4: month = "May"; break;
	  case 5: month = "June"; break;
	  case 6: month = "July"; break;
	  case 7: month = "August"; break;
	  case 8: month = "September"; break;
	  case 9: month = "October"; break;
	  case 10: month = "November"; break;
	  case 11: month = "December"; break;
	  }
	  this.$.Date.setContent(day + ", " + month + " " + time.getDate() + " " + time.getFullYear());
      },
      showSetAlarm: function() {
	  this.$.modalDialog.openAtCenter();
      },
      showPopUp: function(inSender) {
	  console.log("in show popup");
	  var p = this.$[inSender.popup];
	  if(p) {
	      p.openAtCenter();
	  } else {
	      console.log("in show popup, no popup");
	  }
      },
      showFilePicker: function(inSender, inEvent) {
	  this.$.filePicker.pickFile();
      },
      snoozealarm: function() {
	  console.log("snooze alarm");
	  this.$.sound.audio.pause();
	  this.$.alarmModalDialog.close();
	  this.setAlarmState("snoozing");
	  this.updateNextAlarm();
	  this.setLimitTimer(this.CSnoozeStr);
      },
      startClock: function() {
	  this.setCurrentTime();
	  this.timer= setInterval(enyo.bind(this, "setCurrentTime"), 1000);
      },
      stopalarm: function() {
	  console.log("stop alarm");
	  this.$.sound.audio.pause();
	  this.$.alarmModalDialog.close();
	  this.setAlarmState("none");
	  this.clearLimitTimer();
	  this.updateNextAlarm();
      },
      pickFileCancel: function() {
	  console.log("pickfile cancel")
      }
    });