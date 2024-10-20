define("ace/mode/c9search_highlight_rules",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";function r(){this.$rules={start:[{tokenNames:["c9searchresults.constant.numeric","c9searchresults.text","c9searchresults.text","c9searchresults.keyword"],regex:/(^\s+[0-9]+)(:)(\d*\s?)([^\r\n]+)/,onMatch:function(e,t,n){var e=this.splitRegex.exec(e),r=this.tokenNames,i=[{type:r[0],value:e[1]},{type:r[1],value:e[2]}];e[3]&&(" "==e[3]?i[1]={type:r[1],value:e[2]+" "}:i.push({type:r[1],value:e[3]}));var o,s=n[1],a=e[4],c=0;if(s&&s.exec)for(s.lastIndex=0;o=s.exec(a);){var u=a.substring(c,o.index),c=s.lastIndex;if(u&&i.push({type:r[2],value:u}),o[0])i.push({type:r[3],value:o[0]});else if(!u)break}return c<a.length&&i.push({type:r[2],value:a.substr(c)}),i}},{regex:"^Searching for [^\\r\\n]*$",onMatch:function(e,t,n){var r=e.split("");if(r.length<3)return"text";var i=0,o=[{value:r[i++]+"'",type:"text"},{value:e=r[i++],type:"text"},{value:"'"+r[i++],type:"text"}];for(" in"!==r[2]&&o.push({value:"'"+r[i++]+"'",type:"text"},{value:r[i++],type:"text"}),o.push({value:" "+r[i++]+" ",type:"text"}),r[i+1]?(s=r[i+1],o.push({value:"("+r[i+1]+")",type:"text"}),i+=1):--i;i++<r.length;)r[i]&&o.push({value:r[i],type:"text"});e&&(/regex/.test(s)||(e=a.escapeRegExp(e)),/whole/.test(s)&&(e="\\b"+e+"\\b"));var s=e&&function(e,t){try{return new RegExp(e,t)}catch(e){}}("("+e+")",/ sensitive/.test(s)?"g":"ig");return s&&(n[0]=t,n[1]=s),o}},{regex:"^(?=Found \\d+ matches)",token:"text",next:"numbers"},{token:"string",regex:"^\\S:?[^:]+",next:"numbers"}],numbers:[{regex:"\\d+",token:"constant.numeric"},{regex:"$",token:"text",next:"start"}]},this.normalizeRules()}var i=e("../lib/oop"),a=e("../lib/lang"),e=e("./text_highlight_rules").TextHighlightRules;i.inherits(r,e),t.C9SearchHighlightRules=r}),define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"],function(e,t,n){"use strict";function r(){}var i=e("../range").Range;(function(){this.checkOutdent=function(e,t){return!!/^\s+$/.test(e)&&/^\s*\}/.test(t)},this.autoOutdent=function(e,t){var n=e.getLine(t).match(/^(\s*\})/);if(!n)return 0;var r=n[1].length,n=e.findMatchingBracket({row:t,column:r});if(!n||n.row==t)return 0;n=this.$getIndent(e.getLine(n.row));e.replace(new i(t,0,t,r-1),n)},this.$getIndent=function(e){return e.match(/^\s*/)[0]}}).call(r.prototype),t.MatchingBraceOutdent=r}),define("ace/mode/folding/c9search",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(e,t,n){"use strict";var r=e("../../lib/oop"),l=e("../../range").Range,e=e("./fold_mode").FoldMode,t=t.FoldMode=function(){};r.inherits(t,e),function(){this.foldingStartMarker=/^(\S.*:|Searching for.*)$/,this.foldingStopMarker=/^(\s+|Found.*)$/,this.getFoldWidgetRange=function(e,t,n){var r=e.doc.getAllLines(n),i=r[n],o=/^(Found.*|Searching for.*)$/,s=o.test(i)?o:/^(\S.*:|\s*)$/,a=n,c=n;if(this.foldingStartMarker.test(i)){for(var u=n+1,h=e.getLength();u<h&&!s.test(r[u]);u++);c=u}else if(this.foldingStopMarker.test(i)){for(u=n-1;0<=u&&(i=r[u],!s.test(i));u--);a=u}if(a!=c){n=i.length;return s===o&&(n=i.search(/\(Found[^)]+\)$|$/)),new l(a,n,c,0)}}}.call(t.prototype)}),define("ace/mode/c9search",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/c9search_highlight_rules","ace/mode/matching_brace_outdent","ace/mode/folding/c9search"],function(e,t,n){"use strict";function r(){this.HighlightRules=s,this.$outdent=new a,this.foldingRules=new c}var i=e("../lib/oop"),o=e("./text").Mode,s=e("./c9search_highlight_rules").C9SearchHighlightRules,a=e("./matching_brace_outdent").MatchingBraceOutdent,c=e("./folding/c9search").FoldMode;i.inherits(r,o),function(){this.getNextLineIndent=function(e,t,n){return this.$getIndent(t)},this.checkOutdent=function(e,t,n){return this.$outdent.checkOutdent(t,n)},this.autoOutdent=function(e,t,n){this.$outdent.autoOutdent(t,n)},this.$id="ace/mode/c9search"}.call(r.prototype),t.Mode=r}),window.require(["ace/mode/c9search"],function(e){"object"==typeof module&&"object"==typeof exports&&module&&(module.exports=e)});