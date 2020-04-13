!function(t){var e={};function r(n){if(e[n])return e[n].exports;var a=e[n]={i:n,l:!1,exports:{}};return t[n].call(a.exports,a,a.exports,r),a.l=!0,a.exports}r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)r.d(n,a,function(e){return t[e]}.bind(null,a));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=0)}([function(t,e,r){"use strict";var n=this&&this.__awaiter||function(t,e,r,n){return new(r||(r=Promise))((function(a,i){function o(t){try{c(n.next(t))}catch(t){i(t)}}function l(t){try{c(n.throw(t))}catch(t){i(t)}}function c(t){var e;t.done?a(t.value):(e=t.value,e instanceof r?e:new r((function(t){t(e)}))).then(o,l)}c((n=n.apply(t,e||[])).next())}))},a=this&&this.__generator||function(t,e){var r,n,a,i,o={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]};return i={next:l(0),throw:l(1),return:l(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function l(i){return function(l){return function(i){if(r)throw new TypeError("Generator is already executing.");for(;o;)try{if(r=1,n&&(a=2&i[0]?n.return:i[0]?n.throw||((a=n.return)&&a.call(n),0):n.next)&&!(a=a.call(n,i[1])).done)return a;switch(n=0,a&&(i=[2&i[0],a.value]),i[0]){case 0:case 1:a=i;break;case 4:return o.label++,{value:i[1],done:!1};case 5:o.label++,n=i[1],i=[0];continue;case 7:i=o.ops.pop(),o.trys.pop();continue;default:if(!(a=(a=o.trys).length>0&&a[a.length-1])&&(6===i[0]||2===i[0])){o=0;continue}if(3===i[0]&&(!a||i[1]>a[0]&&i[1]<a[3])){o.label=i[1];break}if(6===i[0]&&o.label<a[1]){o.label=a[1],a=i;break}if(a&&o.label<a[2]){o.label=a[2],o.ops.push(i);break}a[2]&&o.ops.pop(),o.trys.pop();continue}i=e.call(t,o)}catch(t){i=[6,t],n=0}finally{r=a=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,l])}}},i=this&&this.__read||function(t,e){var r="function"==typeof Symbol&&t[Symbol.iterator];if(!r)return t;var n,a,i=r.call(t),o=[];try{for(;(void 0===e||e-- >0)&&!(n=i.next()).done;)o.push(n.value)}catch(t){a={error:t}}finally{try{n&&!n.done&&(r=i.return)&&r.call(i)}finally{if(a)throw a.error}}return o},o=this&&this.__spread||function(){for(var t=[],e=0;e<arguments.length;e++)t=t.concat(i(arguments[e]));return t};Object.defineProperty(e,"__esModule",{value:!0});var l=r(1),c=r(2),u=function(){function t(t,e){this.layersList=[];var r=document.createElement("canvas");r.style.backgroundColor="#111",r.style.width=t+"px",r.style.height=e+"px";var n=r.getContext("2d");n.canvas.width=t,n.canvas.height=e,this.canvasContext=n;var a=new l.ImageLoader(n);this.LoadImage=a.LoadImage.bind(a)}return Object.defineProperty(t.prototype,"Layers",{get:function(){var t=this;return{Add:function(){return t.layersList.push(null),t.layersList.length-1},Get:function(e){return t.layersList[e]},Remove:function(e){return t.layersList.splice(e,1),t.redrawLayers(t.layersList)},Clean:function(e){return t.layersList[e]=null,t.redrawLayers(t.layersList)},Redraw:function(){t.redrawLayers(t.layersList)}}},enumerable:!0,configurable:!0}),t.prototype.redrawLayers=function(t){var e=this;t.length>0&&this.canvasContext.clearRect(0,0,this.canvasContext.canvas.width,this.canvasContext.canvas.height),t.forEach((function(t,r){t&&("html"in t?e.DrawImage(t,r,!1):"path"in t&&e.DrawPath(t,r,!1))}))},t.prototype.DrawImage=function(t,e,r){var n=this;if(void 0===e&&(e=0),void 0===r&&(r=!0),void 0===this.layersList[e])throw new Error("Layer with given index did not exist");this.layersList[e]=t;return function(t){n.canvasContext.globalAlpha=t.alpha,n.canvasContext.drawImage(t.html,t.left,t.top,t.width,t.height),n.canvasContext.globalAlpha=1}(t),r&&this.redrawLayers(this.layersList),this},t.prototype.DrawPath=function(t,e,r){if(void 0===e&&(e=0),void 0===r&&(r=!0),void 0===this.layersList[e])throw new Error("Layer with given index did not exist");this.layersList[e]=t;var n=this.canvasContext,a=function(t){if(t.alpha&&(n.globalAlpha=t.alpha),n.beginPath(),t.path.forEach((function(e,r){0==r&&2==e.length?n.moveTo(e[0],e[1]):(n.strokeStyle=t.color,2==e.length?n.lineTo.apply(n,o(e)):n.arc.apply(n,o(e)))})),t.fill){var e=n.fillStyle;n.fillStyle=t.fill,n.fill(),n.fillStyle=e}n.stroke(),n.closePath(),t.alpha&&(n.globalAlpha=1)};return Array.isArray(t.path[0][0])?t.path.forEach((function(e){return a({color:t.color,fill:t.fill||void 0,alpha:t.alpha,path:e})})):a(t),r&&this.redrawLayers(this.layersList),this},t.prototype.DrawRect=function(t,e){void 0===e&&(e=0),this.DrawPath({color:t.stroke||"transparent",fill:t.fill,alpha:t.alpha,path:[[t.x,t.y],[t.x+t.width,t.y],[t.x+t.width,t.y+t.height],[t.x,t.y+t.height],[t.x,t.y]]},e)},t}();window.addEventListener("load",(function(){return n(void 0,void 0,void 0,(function(){var t,e,r,n;return a(this,(function(a){switch(a.label){case 0:return t=new u(420,240),document.body.append(t.canvasContext.canvas),e=t.Layers.Add(),r=t.Layers.Add(),[4,t.LoadImage("2.jpg",{horizontal:"top",vertical:"center"})];case 1:return n=a.sent(),[4,c.linearFadeEffect(0,1,4500,(function(r){n.alpha=r,t.DrawImage(n,e)}))];case 2:return a.sent(),[4,c.linearFadeEffect(0,.4,500,(function(e){console.log(e),t.DrawRect({fill:"white",x:10,y:180,width:400,height:50,alpha:e},r)}))];case 3:return a.sent(),t.Layers.Redraw(),[2]}}))}))}))},function(t,e,r){"use strict";var n=this&&this.__rest||function(t,e){var r={};for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&e.indexOf(n)<0&&(r[n]=t[n]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(n=Object.getOwnPropertySymbols(t);a<n.length;a++)e.indexOf(n[a])<0&&Object.prototype.propertyIsEnumerable.call(t,n[a])&&(r[n[a]]=t[n[a]])}return r},a=this&&this.__values||function(t){var e="function"==typeof Symbol&&Symbol.iterator,r=e&&t[e],n=0;if(r)return r.call(t);if(t&&"number"==typeof t.length)return{next:function(){return t&&n>=t.length&&(t=void 0),{value:t&&t[n++],done:!t}}};throw new TypeError(e?"Object is not iterable.":"Symbol.iterator is not defined.")};Object.defineProperty(e,"__esModule",{value:!0});var i=function(){function t(t){this.canvasContext=t}return t.prototype.LoadImage=function(t,e){var r=this;void 0===e&&(e={horizontal:"center",vertical:"center"});var i=new Image;return i.src=t,new Promise((function(t,o){var l,c;i.addEventListener("load",(function(){var a=r.calculateImageCoverSize(i),o=a.width,l=a.height,c=n(a,["width","height"]),u=function(t){return"top"==e[t]?0:"center"==e[t]?c["vertical"==t?"left":"top"]/2:c["vertical"==t?"left":"top"]},h={top:u("horizontal"),left:u("vertical")};t({html:i,height:l,width:o,top:h.top,left:h.left,alpha:1})}));try{for(var u=a(["cancel","error","abort"]),h=u.next();!h.done;h=u.next()){var s=h.value;i.addEventListener(s,(function(){return o()}))}}catch(t){l={error:t}}finally{try{h&&!h.done&&(c=u.return)&&c.call(u)}finally{if(l)throw l.error}}}))},t.prototype.calculateImageCoverSize=function(t){var e={width:this.canvasContext.canvas.width,height:this.canvasContext.canvas.height},r=e.width/e.height,n=t.naturalWidth/t.naturalHeight,a={width:0,height:0,top:0,left:0};function i(){var r=t.naturalWidth-e.width;a.width=e.width;var i=t.naturalWidth-r,o=t.naturalHeight-Math.round(r/n);return{height:o,width:i,top:-(o-e.height),left:0}}function o(){var r=t.naturalHeight-e.height,a=t.naturalHeight-r,i=t.naturalWidth-Math.round(r*n);return{height:a,width:i,top:0,left:-(i-e.width)}}return(a=i()).height<e.height&&(a=o()),r<2&&(a=o()).width<e.width&&(a=i()),a},t}();e.ImageLoader=i},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.linearFadeEffect=function(t,e,r,n){var a=(e-t)/r*4;t>e&&(a=-a);var i=0;return new Promise((function(o){var l=function(){clearInterval(c),o()},c=setInterval((function(){n(i),i+=a,t>e?i<=e&&l():i>=e&&l()}),1);setTimeout(l,r+10)}))}}]);