
%%
\s+     return "SPACE"
"<"     return "OPEN_TAG"
">"     return "CLOSE_TAG"
"/"     return "TAG_CLOSER"

"!"     /* return "COMMENT_BEGIN" */
"--"    /* return "COMMENT_BOUNDARY" */

["\"'"] return "QUOTE"
"="     return "EQUAL"

"{{"    return "OPEN_VAR"
"}}"    return "CLOSE_VAR"
\w+     return "WORD"

<<EOF>> return "EOF"
.       return "CONTENT"

%%
