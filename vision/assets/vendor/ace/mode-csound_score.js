define("ace/mode/csound_preprocessor_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";function o(){this.semicolonComments={token:"comment.line.semicolon.csound",regex:";.*$"},this.comments=[{token:"punctuation.definition.comment.begin.csound",regex:"/\\*",push:[{token:"punctuation.definition.comment.end.csound",regex:"\\*/",next:"pop"},{defaultToken:"comment.block.csound"}]},{token:"comment.line.double-slash.csound",regex:"//.*$"},this.semicolonComments],this.macroUses=[{token:["entity.name.function.preprocessor.csound","punctuation.definition.macro-parameter-value-list.begin.csound"],regex:/(\$[A-Z_a-z]\w*\.?)(\()/,next:"macro parameter value list"},{token:"entity.name.function.preprocessor.csound",regex:/\$[A-Z_a-z]\w*(?:\.|\b)/}],this.numbers=[{token:"constant.numeric.float.csound",regex:/(?:\d+[Ee][+-]?\d+)|(?:\d+\.\d*|\d*\.\d+)(?:[Ee][+-]?\d+)?/},{token:["storage.type.number.csound","constant.numeric.integer.hexadecimal.csound"],regex:/(0[Xx])([0-9A-Fa-f]+)/},{token:"constant.numeric.integer.decimal.csound",regex:/\d+/}],this.bracedStringContents=[{token:"constant.character.escape.csound",regex:/\\(?:[\\abnrt"]|[0-7]{1,3})/},{token:"constant.character.placeholder.csound",regex:/%[#0\- +]*\d*(?:\.\d+)?[diuoxXfFeEgGaAcs]/},{token:"constant.character.escape.csound",regex:/%%/}],this.quotedStringContents=[this.macroUses,this.bracedStringContents];var e=[this.comments,{token:"keyword.preprocessor.csound",regex:/#(?:e(?:nd(?:if)?|lse)\b|##)|@@?[ \t]*\d+/},{token:"keyword.preprocessor.csound",regex:/#include/,push:[this.comments,{token:"string.csound",regex:/([^ \t])(?:.*?\1)/,next:"pop"}]},{token:"keyword.preprocessor.csound",regex:/#[ \t]*define/,next:"define directive"},{token:"keyword.preprocessor.csound",regex:/#(?:ifn?def|undef)\b/,next:"macro directive"},this.macroUses];this.$rules={start:e,"define directive":[this.comments,{token:"entity.name.function.preprocessor.csound",regex:/[A-Z_a-z]\w*/},{token:"punctuation.definition.macro-parameter-name-list.begin.csound",regex:/\(/,next:"macro parameter name list"},{token:"punctuation.definition.macro.begin.csound",regex:/#/,next:"macro body"}],"macro parameter name list":[{token:"variable.parameter.preprocessor.csound",regex:/[A-Z_a-z]\w*/},{token:"punctuation.definition.macro-parameter-name-list.end.csound",regex:/\)/,next:"define directive"}],"macro body":[{token:"constant.character.escape.csound",regex:/\\#/},{token:"punctuation.definition.macro.end.csound",regex:/#/,next:"start"},e],"macro directive":[this.comments,{token:"entity.name.function.preprocessor.csound",regex:/[A-Z_a-z]\w*/,next:"start"}],"macro parameter value list":[{token:"punctuation.definition.macro-parameter-value-list.end.csound",regex:/\)/,next:"start"},{token:"punctuation.definition.string.begin.csound",regex:/"/,next:"macro parameter value quoted string"},this.pushRule({token:"punctuation.macro-parameter-value-parenthetical.begin.csound",regex:/\(/,next:"macro parameter value parenthetical"}),{token:"punctuation.macro-parameter-value-separator.csound",regex:"[#']"}],"macro parameter value quoted string":[{token:"constant.character.escape.csound",regex:/\\[#'()]/},{token:"invalid.illegal.csound",regex:/[#'()]/},{token:"punctuation.definition.string.end.csound",regex:/"/,next:"macro parameter value list"},this.quotedStringContents,{defaultToken:"string.quoted.csound"}],"macro parameter value parenthetical":[{token:"constant.character.escape.csound",regex:/\\\)/},this.popRule({token:"punctuation.macro-parameter-value-parenthetical.end.csound",regex:/\)/}),this.pushRule({token:"punctuation.macro-parameter-value-parenthetical.begin.csound",regex:/\(/,next:"macro parameter value parenthetical"}),e]}}var r=e("../lib/oop"),e=e("./text_highlight_rules").TextHighlightRules;r.inherits(o,e),function(){this.pushRule=function(c){return{regex:c.regex,onMatch:function(e,t,n,o){if(0===n.length&&n.push(t),Array.isArray(c.next))for(var r=0;r<c.next.length;r++)n.push(c.next[r]);else n.push(c.next);return this.next=n[n.length-1],c.token},get next(){return Array.isArray(c.next)?c.next[c.next.length-1]:c.next},set next(e){if(Array.isArray(c.next)){var t=c.next[c.next.length-1],n=t.length-1,o=e.length-1;if(n<o)for(;0<=n&&0<=o;){if(t.charAt(n)!==e.charAt(o)){for(var r=e.substr(0,o),s=0;s<c.next.length;s++)c.next[s]=r+c.next[s];break}n--,o--}}else c.next=e},get token(){return c.token}}},this.popRule=function(r){return{regex:r.regex,onMatch:function(e,t,n,o){return n.pop(),r.next?(n.push(r.next),this.next=n[n.length-1]):this.next=1<n.length?n[n.length-1]:n.pop(),r.token}}}}.call(o.prototype),t.CsoundPreprocessorHighlightRules=o}),define("ace/mode/csound_score_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/csound_preprocessor_highlight_rules"],function(e,t,n){"use strict";function o(){s.call(this),this.quotedStringContents.push({token:"invalid.illegal.csound-score",regex:/[^"]*$/});var e=this.$rules.start;e.push({token:"keyword.control.csound-score",regex:/[abCdefiqstvxy]/},{token:"invalid.illegal.csound-score",regex:/w/},{token:"constant.numeric.language.csound-score",regex:/z/},{token:["keyword.control.csound-score","constant.numeric.integer.decimal.csound-score"],regex:/([nNpP][pP])(\d+)/},{token:"keyword.other.csound-score",regex:/[mn]/,push:[{token:"empty",regex:/$/,next:"pop"},this.comments,{token:"entity.name.label.csound-score",regex:/[A-Z_a-z]\w*/}]},{token:"keyword.preprocessor.csound-score",regex:/r\b/,next:"repeat section"},this.numbers,{token:"keyword.operator.csound-score",regex:"[!+\\-*/^%&|<>#~.]"},this.pushRule({token:"punctuation.definition.string.begin.csound-score",regex:/"/,next:"quoted string"}),this.pushRule({token:"punctuation.braced-loop.begin.csound-score",regex:/{/,next:"loop after left brace"})),this.addRules({"repeat section":[{token:"empty",regex:/$/,next:"start"},this.comments,{token:"constant.numeric.integer.decimal.csound-score",regex:/\d+/,next:"repeat section before label"}],"repeat section before label":[{token:"empty",regex:/$/,next:"start"},this.comments,{token:"entity.name.label.csound-score",regex:/[A-Z_a-z]\w*/,next:"start"}],"quoted string":[this.popRule({token:"punctuation.definition.string.end.csound-score",regex:/"/}),this.quotedStringContents,{defaultToken:"string.quoted.csound-score"}],"loop after left brace":[this.popRule({token:"constant.numeric.integer.decimal.csound-score",regex:/\d+/,next:"loop after repeat count"}),this.comments,{token:"invalid.illegal.csound",regex:/\S.*/}],"loop after repeat count":[this.popRule({token:"entity.name.function.preprocessor.csound-score",regex:/[A-Z_a-z]\w*\b/,next:"loop after macro name"}),this.comments,{token:"invalid.illegal.csound",regex:/\S.*/}],"loop after macro name":[e,this.popRule({token:"punctuation.braced-loop.end.csound-score",regex:/}/})]}),this.normalizeRules()}var r=e("../lib/oop"),s=e("./csound_preprocessor_highlight_rules").CsoundPreprocessorHighlightRules;r.inherits(o,s),t.CsoundScoreHighlightRules=o}),define("ace/mode/csound_score",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/csound_score_highlight_rules"],function(e,t,n){"use strict";function o(){this.HighlightRules=c}var r=e("../lib/oop"),s=e("./text").Mode,c=e("./csound_score_highlight_rules").CsoundScoreHighlightRules;r.inherits(o,s),function(){this.lineCommentStart=";",this.blockComment={start:"/*",end:"*/"}}.call(o.prototype),t.Mode=o}),window.require(["ace/mode/csound_score"],function(e){"object"==typeof module&&"object"==typeof exports&&module&&(module.exports=e)});