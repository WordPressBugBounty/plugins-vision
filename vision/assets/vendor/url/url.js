/* @license
 Url.js v3.0.0
 https://github.com/jillix/url.js
 Released under the MIT license
*/
!function(t){"use strict";var r,l=/^[a-z]+:/,y=/[-a-z0-9]+(\.[-a-z0-9])*:\d+/i,d=/\/\/(.*?)(?::(.*?))?@/,e=/^win/i,g=/:$/,m=/^\?/,q=/^#/,v=/(.*\/)/,w=/^\/{2,}/,o=/'/g,n=/%([ef][0-9a-f])%([89ab][0-9a-f])%([89ab][0-9a-f])/gi,s=/%([cd][0-9a-f])%([89ab][0-9a-f])/gi,i=/%([0-7][0-9a-f])/gi,p=/\+/g,h=/^\w:$/,A=/[^/#?]/,C="undefined"==typeof window&&"undefined"!=typeof global&&"function"==typeof require,I=C?t.require:null,S={protocol:"protocol",host:"hostname",port:"port",path:"pathname",query:"search",hash:"hash"},b={ftp:21,gopher:70,http:80,https:443,ws:80,wss:443};function j(){return C?r=r||"file://"+(process.platform.match(e)?"/":"")+I("fs").realpathSync("."):document.location.href}function a(t){return encodeURIComponent(t).replace(o,"%27")}function x(t){return(t=(t=(t=t.replace(p," ")).replace(n,function(t,r,e,o){r=parseInt(r,16)-224,e=parseInt(e,16)-128;if(0==r&&e<32)return t;o=(r<<12)+(e<<6)+(parseInt(o,16)-128);return 65535<o?t:String.fromCharCode(o)})).replace(s,function(t,r,e){r=parseInt(r,16)-192;if(r<2)return t;e=parseInt(e,16)-128;return String.fromCharCode((r<<6)+e)})).replace(i,function(t,r){return String.fromCharCode(parseInt(r,16))})}function z(t){for(var r=t.split("&"),e=0,o=r.length;e<o;e++){var n=r[e].split("="),s=decodeURIComponent(n[0].replace(p," "));s&&(n=void 0!==n[1]?x(n[1]):null,void 0===this[s]?this[s]=n:(this[s]instanceof Array||(this[s]=[this[s]]),this[s].push(n)))}}function F(t,r){!function(t,r,e){var o,n;r=r||j(),C?o=I("url").parse(r):(o=document.createElement("a")).href=r;var s,i=(p={path:!0,query:!0,hash:!0},(s=r)&&l.test(s)&&(p.protocol=!0,p.host=!0,y.test(s)&&(p.port=!0),d.test(s)&&(p.user=!0,p.pass=!0)),p),p=r.match(d)||[];for(n in S)i[n]?t[n]=o[S[n]]||"":t[n]="";if(t.protocol=t.protocol.replace(g,""),t.query=t.query.replace(m,""),t.hash=x(t.hash.replace(q,"")),t.user=x(p[1]||""),t.pass=x(p[2]||""),t.port=b[t.protocol]==t.port||0==t.port?"":t.port,!i.protocol&&A.test(r.charAt(0))&&(t.path=r.split("?")[0].split("#")[0]),!i.protocol&&e){var h=new F(j().match(v)[0]),a=h.path.split("/"),u=t.path.split("/"),c=["protocol","user","pass","host","port"],f=c.length;for(a.pop(),n=0;n<f;n++)t[c[n]]=h[c[n]];for(;".."===u[0];)a.pop(),u.shift();t.path=("/"!==r.charAt(0)?a.join("/"):"")+"/"+u.join("/")}t.path=t.path.replace(w,"/"),t.paths(t.paths()),t.query=new z(t.query)}(this,t,!r)}z.prototype.toString=function(){var t,r,e="",o=a;for(t in this){var n=this[t];if(!(n instanceof Function||null===n))if(n instanceof Array){var s=n.length;if(s)for(r=0;r<s;r++){var i=n[r];e+=e?"&":"",e+=o(t)+(null==i?"":"="+o(i))}else e+=(e?"&":"")+o(t)+"="}else e+=e?"&":"",e+=o(t)+(void 0===n?"":"="+o(n))}return e},F.prototype.clearQuery=function(){for(var t in this.query)this.query[t]instanceof Function||delete this.query[t];return this},F.prototype.queryLength=function(){var t,r=0;for(t in this.query)this.query[t]instanceof Function||r++;return r},F.prototype.isEmptyQuery=function(){return 0===this.queryLength()},F.prototype.paths=function(t){var r,e="",o=0;if(t&&t.length&&t+""!==t){for(this.isAbsolute()&&(e="/"),r=t.length;o<r;o++)t[o]=!o&&h.test(t[o])?t[o]:a(t[o]);this.path=e+t.join("/")}for(r=(t=("/"===this.path.charAt(o=0)?this.path.slice(1):this.path).split("/")).length;o<r;o++)t[o]=x(t[o]);return t},F.prototype.encode=a,F.prototype.decode=x,F.prototype.isAbsolute=function(){return this.protocol||"/"===this.path.charAt(0)},F.prototype.toString=function(){return(this.protocol&&this.protocol+"://")+(this.user&&a(this.user)+(this.pass&&":"+a(this.pass))+"@")+(this.host&&this.host)+(this.port&&":"+this.port)+(this.path&&this.path)+(this.query.toString()&&"?"+this.query)+(this.hash&&"#"+a(this.hash))},t[t.exports?"exports":"Url"]=F}("undefined"!=typeof module&&module.exports?module:window);