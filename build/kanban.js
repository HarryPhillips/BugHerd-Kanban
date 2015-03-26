/*
*   @type javascript
*   @name config.js
*   @copy Copyright 2015 Harry Phillips
*/

/*
*   @type javascript
*   @name events.js
*   @copy Copyright 2015 Harry Phillips
*/

/*
*   @type javascript
*   @name states.js
*   @copy Copyright 2015 Harry Phillips
*/

/*
*   @type javascript
*   @name util.js
*   @copy Copyright 2015 Harry Phillips
*/

/*
*   @type javascript
*   @name coutner.js
*   @copy Copyright 2015 Harry Phillips
*/

/*
*   @type javascript
*   @name http.js
*   @copy Copyright 2015 Harry Phillips
*/

/*
*   @type javascript
*   @name node.js
*   @copy Copyright 2015 Harry Phillips
*/

/*
*   @type javascript
*   @name modal.js
*   @copy Copyright 2015 Harry Phillips
*/

/*
*   @type javascript
*   @name console.js
*   @copy Copyright 2015 Harry Phillips
*/

/*
*   @type javascript
*   @name gui.js
*   @copy Copyright 2015 Harry Phillips
*/

/*
*    @type javascript test
*    @name main.test.js
*    @copy Copyright 2015 Harry Phillips
*/

/*
*   @type javascript
*   @name main.js
*   @copy Copyright 2015 Harry Phillips
*/

/*
*   @type javascript
*   @name kanban.js
*   @copy Copyright 2015 Harry Phillips
*/

function kbsExpandObjectNode(element){"450px"!==element.parentNode.style.height?(element.parentNode.style.height="450px",element.className+=" kbs-rotate"):(element.parentNode.style.height="150px",element.className=element.className.replace("kbs-rotate",""))}if(define("config",{appName:"kbs",version:.7,enabled:!0,mode:"dev",offline:!1,test:!1,logs:{enabled:!0,gui:!0,filter:!1},gui:{enabled:!0,autorefresh:!0,console:{state:"kbs-close",autoscroll:!0,icons:{save:"file-text",clear:"trash",toggle:"terminal",close:"times",destroy:"exclamation-triangle",example:"plus-circle",expand:"caret-square-o-right"}}},events:{silent:!1},tooltips:{save:"Save the output buffer to text file",clear:"Clear all logs",toggle:"Minimise / Maximise",close:"Close the console",destroy:"Destroy this console instance"}}),define("src/events",["config"],function(config){function Events(){this.topics={}}return Events.prototype.subscribe=function(event,handler){this.topics[event]||(this.topics[event]=[]),this.topics[event].push(handler)},Events.prototype.publish=function(event,data){if(this.topics[event]){var i;for(i=0;i<this.topics[event].length;i+=1)this.topics[event][i](data);"object"!=typeof data&&(data={data:data})}else if(!config.events.silent)throw new Error("Event '"+event+"' does not exist!")},new Events}),define("src/status",{app:!1,gui:!1,console:!1}),define("src/util",["config","./events","./status"],function(config,events,status){var util={};return util.zerofy=function(num,len){for(;num.toString().length<(len||2);)num="0"+num;return num},util.spacify=function(str,len){for("string"!=typeof str&&(str=str.toString());str.length<len;)str=" "+str;return str},util.ftime=function(){var time=new Date,hours=util.zerofy(time.getHours()),minutes=util.zerofy(time.getMinutes()),seconds=util.zerofy(time.getSeconds()),millis=util.zerofy(time.getMilliseconds(),3);return hours+":"+minutes+":"+seconds+"."+millis},util.fdate=function(){var time=new Date,year=util.zerofy(time.getFullYear(),4),month=util.zerofy(time.getMonth(),2),date=util.zerofy(time.getDate(),2);return year+"-"+month+"-"+date},util.escapeRegEx=function(str){var result;return result=String(str).replace(/([\-()\[\]{}+?*.$\^|,:#<!\\])/g,"\\$1"),result=result.replace(/\x08/g,"\\x08")},util.isArray=function(){},util.contains=function(host,target,strict){var regex,i=0,occs=[];if(strict=strict||!1,!strict)return-1!==host.indexOf(target);if(target=util.escapeRegEx(target),regex=new RegExp("(\\W|^)"+target+"(\\W|$)"),util.isArray(host)){for(;i<host.length;)regex.test(host[i])&&occs.push(i),i+=1;return 0===occs.length?!1:occs.length>1?occs:occs[0]}return regex.test(host)?!0:!1},util.log=function(type,msg,opt){if(config.logs.enabled){var param,i=0,args=[],filter=config.logs.filter,output=[],str="",object=!1,guistr="",objstr="";for(param in arguments)arguments.hasOwnProperty(param)&&args.push(arguments[param]);if(args.length>2?"object"==typeof msg&&(object=msg,msg=opt):args.length>1?"object"==typeof type?(object=type,type="log"):"object"==typeof msg&&(object=msg,msg=""):(msg=type,type="log","object"==typeof msg&&(object=msg,msg="")),!filter||!util.contains(filter,type,!0))for(str+="["+config.appName+"] ",str+=util.ftime(),str+=util.spacify("["+type+"]",8)+":> ",str+=msg,output.push(str),config.logs.gui&&status.console&&(object&&(objstr="Object "+JSON.stringify(object,null,4)),guistr=str.replace(/\s/g," "),events.publish("gui/log",{msg:guistr,type:type,obj:objstr})),window.console[type]||(type="log"),object&&output.push(object);i<output.length;)window.console[type](output[i]),i+=1}},util.log("+ util.js loaded"),util}),define("src/counter",[],function(){function Counter(target,callback){var value=0;this.target=target,this.exec=callback,Object.defineProperty(this,"count",{get:function(){return value},set:function(newvalue){value=newvalue,value>=target&&this.exec()}})}return Counter}),define("src/http",["./util","./counter"],function(util){function Http(params){this.url=params.url,this.method=params.method||"GET",this.async=params.async||!0,this.data=JSON.stringify(params.data)||"nodata",this.callbacks={},this.callbacks.success=params.success||function(){},this.callbacks.fail=params.fail||function(){},self=this,params.send&&this.send(this.data)}var self;return Http.prototype.send=function(){var xml=new XMLHttpRequest;xml.open(this.method,this.url,this.async),xml.onreadystatechange=function(){4===this.readyState&&(200===this.status&&this.status<400?(util.log("okay","HTTP 200: "+this.url),self.callbacks.success(this.responseText)):(util.log("error","HTTP "+this.status+": "+self.url),self.callbacks.fail(this.responseText)))},console.log(self.data),xml.send(self.data),xml=null},Http}),define("src/node",["config"],function(){function Node(type,classes,id){this.element=document.createElement(type),this.element.className=classes||"",this.element.id=id||""}return Node.prototype.addChild=function(node){this.element.appendChild(node)},Node.prototype.createChild=function(type,classes,id){var node=new Node(type,classes,id);return this.addChild(node.element),node},Node}),define("src/modal",["./gui"],function(GUI){function Modal(){this.gui=new GUI}return Modal}),define("src/console",["config","./util","./events","./http","./status","./node","./modal"],function(config,util,events,Http,status,Node,Modal){function Console(instance){if(config.logs.gui){if(self=this,"undefined"==typeof instance)throw new Error("No GUI instance passed to Console");gui=instance,this.buildNodeTree(),events.publish("kbs/status",{component:"console",status:!0})}}var self,gui;return Console.prototype.write=function(args){var objtxt,out=self.wrapper.cons.out.element,log=new Node("div","kbs-log-node kbs-"+args.type),txt=document.createTextNode(args.msg),objwrap=new Node("pre","kbs-object"),objexp=new Node("i","fa fa-"+config.gui.console.icons.expand+" kbs-object-expand");log.addChild(txt),args.obj&&(objtxt=document.createTextNode(args.obj),objexp.element.setAttribute("onclick","kbsExpandObjectNode(this)"),objwrap.addChild(objexp.element),objwrap.addChild(objtxt),log.addChild(objwrap.element)),out.appendChild(log.element),self.refresh()},Console.prototype.createTool=function(toolbar,tool){if("undefined"==typeof toolbar)throw new Error("No toolbar passed to GUI.Console.createTool()");var icon;return icon=this.getIcon(tool),toolbar[tool]=toolbar.createChild("i","fa fa-"+icon+" kbs-tool kbs-"+tool),toolbar[tool].element.title=config.tooltips[tool]||"",toolbar[tool]},Console.prototype.getIcon=function(tool){return config.gui.console.icons[tool]||"plus"},Console.prototype.open=function(){var element=this.wrapper.element,classes=element.className;element.className=classes.replace(" kbs-close"," kbs-open")},Console.prototype.close=function(){var element=this.wrapper.element,classes=element.className;element.className=classes.replace(" kbs-open"," kbs-close")},Console.prototype.shrink=function(){},Console.prototype.full=function(){},Console.prototype.refresh=function(){var cons=self.wrapper.cons.element;cons.scrollTop=cons.scrollHeight},Console.prototype.clear=function(){var end,cons=this.wrapper.cons.element,out=this.wrapper.cons.out.element,start=(new Date).getTime();for(cons.removeChild(out);out.firstChild;)out.removeChild(out.firstChild);cons.appendChild(out),end=(new Date).getTime()-start,util.log("okay","cleared all logs in "+end+" ms")},Console.prototype.save=function(){{var time=util.ftime(),date=util.fdate(),file="log_"+date+"_"+time;new Http({url:"http://localhost/GitHub/Kanban/temp.php",send:!0,data:{date:date,time:time,file:file},success:function(response){alert(response)}})}},Console.prototype.destroy=function(){var modal=new Modal;util.log(modal);var confirm=!1;confirm&&this.wrapper.element.parentNode.removeChild(this.wrapper.element)},Console.prototype.buildNodeTree=function(){var wrapper,consclass,constools,constitle,titlenode,cons,consout;return consclass="kbs-cons-box "+config.gui.console.state,this.wrapper=wrapper=gui.createChild("div",consclass),constools=wrapper.constools=wrapper.createChild("div","kbs-cons-toolbar"),constitle=constools.constitle=constools.createChild("div","kbs-cons-title"),titlenode=document.createTextNode("Kanban v"+config.version),constitle.element.appendChild(titlenode),this.createTool(constools,"toggle").element.onclick=function(){var classes=wrapper.element.className,closed=-1!==classes.indexOf("kbs-close"),full=-1!==classes.indexOf("kbs-full");closed||full||(wrapper.element.className+=" kbs-full"),full&&(wrapper.element.className=wrapper.element.className.replace(" kbs-full","")),closed&&self.open()},this.createTool(constools,"save").element.onclick=function(){self.save()},this.createTool(constools,"destroy").element.onclick=function(){self.destroy()},this.createTool(constools,"clear").element.onclick=function(){self.clear()},this.createTool(constools,"close").element.onclick=function(){self.close()},wrapper.cons=cons=wrapper.createChild("div","kbs-cons"),consout=cons.out=cons.createChild("div","kbs-cons-out"),wrapper},Console}),define("src/gui",["require","config","src/util","src/events","src/node","src/counter","src/console"],function(require){function GUI(){self=this,this.tree=this.buildNodeTree(),this.console=new Console(this),events.publish("kbs/status",{component:"gui",status:!0})}var self,config=require("config"),util=require("src/util"),events=require("src/events"),Node=require("src/node"),Counter=require("src/counter"),Console=require("src/console");return util.log("+ gui.js loaded"),GUI.prototype.init=function(){var loader=new Counter(3,function(){events.publish("kbs/gui/loaded")}),mainlink=document.createElement("link"),themelink=document.createElement("link"),falink=document.createElement("link"),mainurl=window.KBS_BASE_URL+window.KBS_SRC_DIR+"css/main.css",themeurl=window.KBS_BASE_URL+window.KBS_SRC_DIR+"css/theme.css",faurl="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css",publish=function(){document.body.appendChild(self.tree.main.element),util.log("debug","+ attached gui tree"),util.log("debug","+ publishing 'kbs/loaded'"),events.publish("kbs/loaded")};events.subscribe("kbs/gui/loaded",publish),mainlink.rel="stylesheet",themelink.rel="stylesheet",falink.rel="stylesheet",mainlink.href=mainurl,themelink.href=themeurl,falink.href=faurl,mainlink.onload=function(){util.log("debug","+ main.css loaded"),loader.count+=1},themelink.onload=function(){util.log("debug","+ theme.css loaded"),loader.count+=1},falink.onload=function(){util.log("debug","+ font-awesome.css loaded"),loader.count+=1},config.offline||document.head.appendChild(falink),document.head.appendChild(mainlink),document.head.appendChild(themelink),config.gui.enabled&&(config.gui.autorefresh&&events.subscribe("gui/update",this.refresh),config.logs.gui&&events.subscribe("gui/log",this.console.write))},GUI.prototype.buildNodeTree=function(){var main,tree={};return tree.main=main=new Node("div","kbs-gui"),main.overlay=tree.main.createChild("div","kbs-overlay"),tree},GUI.prototype.refresh=function(){this.console.refresh()},GUI.prototype.addChild=function(node){this.tree.main.element.appendChild(node)},GUI.prototype.createChild=function(type,classes,id){var node=new Node(type,classes,id);return this.tree.main.element.appendChild(node.element),node},GUI.prototype.benchmark=function(){var end,cons=self.console.wrapper.cons.element,out=self.console.wrapper.cons.out.element,start=(new Date).getTime(),i=0;for(cons.removeChild(out);1e4>i;)util.log("debug","log #"+i),i+=1;cons.appendChild(out),end=(new Date).getTime()-start,util.log("debug","opt: "+end+"ms")},GUI.prototype.getCurrentInstance=function(){return self},GUI}),define("test/main.test",["require","src/util"],function(require,util){return{exec:function(test){util.log("test",'executing test: "'+test+'"'),require(["./"+test+".test"])}}}),define("src/main",["config","./events","./util","./status","./http","./gui","test/main.test"],function(config,events,util,status,http,GUI,tests){var kanban,exec,gui;config.enabled&&(events.subscribe("kbs/status",function(data){status[data.component]=data.status}),config.gui.enabled&&(gui=new GUI,gui.init()),exec=function(){window.KBS_END_TIME=(new Date).getTime()-window.KBS_START_TIME+"ms",util.log("okay",kanban,"Kanban initialised in "+window.KBS_END_TIME),"dev"===config.mode&&(window[config.appName]=kanban),events.publish("kbs/status",{component:"app",status:!0}),config.test&&tests.exec(["util"])},kanban={version:config.version,status:status,config:config,events:events,http:http,util:util,gui:gui},events.subscribe("kbs/loaded",exec))}),!window.KBS_GLOBAL_SET)var KBS_GLOBAL_SET=!0,KBS_START_TIME=(new Date).getTime(),KBS_END_TIME,KBS_BASE_URL="http://localhost/GitHub/",KBS_SRC_DIR="kanban/";!function(window){var require=window.require;require.config({paths:{src:"src",test:"test"}}),require(["src/main"])}(window),define("kanban",function(){});