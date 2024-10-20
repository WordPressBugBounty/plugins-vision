define("ace/mode/doc_comment_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";function o(){this.$rules={start:[{token:"comment.doc.tag",regex:"@[\\w\\d_]+"},o.getTagRule(),{defaultToken:"comment.doc",caseInsensitive:!0}]}}var i=e("../lib/oop"),e=e("./text_highlight_rules").TextHighlightRules;i.inherits(o,e),o.getTagRule=function(e){return{token:"comment.doc.tag.storage.type",regex:"\\b(?:TODO|FIXME|XXX|HACK)\\b"}},o.getStartRule=function(e){return{token:"comment.doc",regex:"\\/\\*(?=\\*)",next:e}},o.getEndRule=function(e){return{token:"comment.doc",regex:"\\*\\/",next:e}},t.DocCommentHighlightRules=o}),define("ace/mode/golang_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules"],function(e,t,n){function o(){var t=this.createKeywordMapper({keyword:"else|break|case|return|goto|if|const|select|continue|struct|default|switch|for|range|func|import|package|chan|defer|fallthrough|go|interface|map|range|select|type|var","constant.language":"nil|true|false|iota","support.function":"new|close|cap|copy|panic|panicln|print|println|len|make|delete|real|recover|imag|append","support.type":"string|uint8|uint16|uint32|uint64|int8|int16|int32|int64|float32|float64|complex64|complex128|byte|rune|uint|int|uintptr|bool|error"},""),e="\\\\(?:[0-7]{3}|x\\h{2}|u{4}|U\\h{6}|[abfnrtv'\"\\\\])".replace(/\\h/g,"[a-fA-F\\d]");this.$rules={start:[{token:"comment",regex:"\\/\\/.*$"},r.getStartRule("doc-start"),{token:"comment.start",regex:"\\/\\*",next:"comment"},{token:"string",regex:/"(?:[^"\\]|\\.)*?"/},{token:"string",regex:"`",next:"bqstring"},{token:"constant.numeric",regex:"'(?:[^\\'\ud800-\udbff]|[\ud800-\udbff][\udc00-\udfff]|"+e.replace('"',"")+")'"},{token:"constant.numeric",regex:"0[xX][0-9a-fA-F]+\\b"},{token:"constant.numeric",regex:"[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"},{token:["keyword","text","entity.name.function"],regex:"(func)(\\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\\b"},{token:function(e){return"("==e[e.length-1]?[{type:t(e.slice(0,-1))||"support.function",value:e.slice(0,-1)},{type:"paren.lparen",value:e.slice(-1)}]:t(e)||"identifier"},regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b\\(?"},{token:"keyword.operator",regex:"!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|==|=|!=|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^="},{token:"punctuation.operator",regex:"\\?|\\:|\\,|\\;|\\."},{token:"paren.lparen",regex:"[[({]"},{token:"paren.rparen",regex:"[\\])}]"},{token:"text",regex:"\\s+"}],comment:[{token:"comment.end",regex:"\\*\\/",next:"start"},{defaultToken:"comment"}],bqstring:[{token:"string",regex:"`",next:"start"},{defaultToken:"string"}]},this.embedRules(r,"doc-",[r.getEndRule("start")])}var i=e("../lib/oop"),r=e("./doc_comment_highlight_rules").DocCommentHighlightRules,e=e("./text_highlight_rules").TextHighlightRules;i.inherits(o,e),t.GolangHighlightRules=o}),define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"],function(e,t,n){"use strict";function o(){}var i=e("../range").Range;(function(){this.checkOutdent=function(e,t){return!!/^\s+$/.test(e)&&/^\s*\}/.test(t)},this.autoOutdent=function(e,t){var n=e.getLine(t).match(/^(\s*\})/);if(!n)return 0;var o=n[1].length,n=e.findMatchingBracket({row:t,column:o});if(!n||n.row==t)return 0;n=this.$getIndent(e.getLine(n.row));e.replace(new i(t,0,t,o-1),n)},this.$getIndent=function(e){return e.match(/^\s*/)[0]}}).call(o.prototype),t.MatchingBraceOutdent=o}),define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(e,t,n){"use strict";var o=e("../../lib/oop"),l=e("../../range").Range,e=e("./fold_mode").FoldMode,t=t.FoldMode=function(e){e&&(this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+e.start)),this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+e.end)))};o.inherits(t,e),function(){this.foldingStartMarker=/([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/,this.foldingStopMarker=/^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/,this.singleLineBlockCommentRe=/^\s*(\/\*).*\*\/\s*$/,this.tripleStarBlockCommentRe=/^\s*(\/\*\*\*).*\*\/\s*$/,this.startRegionRe=/^\s*(\/\*|\/\/)#?region\b/,this._getFoldWidgetBase=this.getFoldWidget,this.getFoldWidget=function(e,t,n){var o=e.getLine(n);if(this.singleLineBlockCommentRe.test(o)&&!this.startRegionRe.test(o)&&!this.tripleStarBlockCommentRe.test(o))return"";n=this._getFoldWidgetBase(e,t,n);return!n&&this.startRegionRe.test(o)?"start":n},this.getFoldWidgetRange=function(e,t,n,o){var i=e.getLine(n);if(this.startRegionRe.test(i))return this.getCommentRegionBlock(e,i,n);var r=i.match(this.foldingStartMarker);if(r){var a=r.index;if(r[1])return this.openingBracketBlock(e,r[1],n,a);var g=e.getCommentFoldRange(n,a+r[0].length,1);return g&&!g.isMultiLine()&&(o?g=this.getSectionRange(e,n):"all"!=t&&(g=null)),g}if("markbegin"!==t&&(r=i.match(this.foldingStopMarker))){a=r.index+r[0].length;return r[1]?this.closingBracketBlock(e,r[1],n,a):e.getCommentFoldRange(n,a,-1)}},this.getSectionRange=function(e,t){for(var n=(g=e.getLine(t)).search(/\S/),o=t,i=g.length,r=t+=1,a=e.getLength();++t<a;){var g,s=(g=e.getLine(t)).search(/\S/);if(-1!==s){if(s<n)break;var c=this.getFoldWidgetRange(e,"all",t);if(c){if(c.start.row<=o)break;if(c.isMultiLine())t=c.end.row;else if(n==s)break}r=t}}return new l(o,i,r,e.getLine(r).length)},this.getCommentRegionBlock=function(e,t,n){for(var o=t.search(/\s*$/),i=e.getLength(),r=n,a=/^\s*(?:\/\*|\/\/|--)#?(end)?region\b/,g=1;++n<i;){t=e.getLine(n);var s=a.exec(t);if(s&&(s[1]?g--:g++,!g))break}if(r<n)return new l(r,o,n,t.length)}}.call(t.prototype)}),define("ace/mode/golang",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/golang_highlight_rules","ace/mode/matching_brace_outdent","ace/mode/behaviour/cstyle","ace/mode/folding/cstyle"],function(e,t,n){function o(){this.HighlightRules=a,this.$outdent=new g,this.foldingRules=new c,this.$behaviour=new s}var i=e("../lib/oop"),r=e("./text").Mode,a=e("./golang_highlight_rules").GolangHighlightRules,g=e("./matching_brace_outdent").MatchingBraceOutdent,s=e("./behaviour/cstyle").CstyleBehaviour,c=e("./folding/cstyle").FoldMode;i.inherits(o,r),function(){this.lineCommentStart="//",this.blockComment={start:"/*",end:"*/"},this.getNextLineIndent=function(e,t,n){var o=this.$getIndent(t),i=this.getTokenizer().getLineTokens(t,e),r=i.tokens;i.state;return r.length&&"comment"==r[r.length-1].type||"start"==e&&t.match(/^.*[\{\(\[]\s*$/)&&(o+=n),o},this.checkOutdent=function(e,t,n){return this.$outdent.checkOutdent(t,n)},this.autoOutdent=function(e,t,n){this.$outdent.autoOutdent(t,n)},this.$id="ace/mode/golang"}.call(o.prototype),t.Mode=o}),window.require(["ace/mode/golang"],function(e){"object"==typeof module&&"object"==typeof exports&&module&&(module.exports=e)});