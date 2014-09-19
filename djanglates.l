%x tag var attribval
%s comment

%%
<INITIAL,tag>\s+                return "SPACE"
<INITIAL>"<"/\w+                {
                                  this.begin('tag');
                                  return "OPEN_TAG"
                                }
<INITIAL>"</"/\w+               {
                                  this.begin('tag');
                                  return "TAG_CLOSER"
                                }
<tag>">"                        {
                                  this.begin('INITIAL');
                                  return "CLOSE_TAG"
                                }
<tag>"/>"                       {
                                  this.begin('INITIAL');
                                  return "SELF_TAG_CLOSER" 
                                }
<tag>["\"'"]                    {
                                  this.begin('attribval')
                                  return "BEG_QUOTE"
                                }
<attribval>["\"'"]              {
                                  this.begin('tag')
                                  return "END_QUOTE"
                                }
<attribval>[^"\"'"]+            return "ATTRIB_CONTENT"
<tag>"="                        return "EQUAL"

<INITIAL>"<!--"                 {
                                  this.begin('comment')
                                  return "COMMENT_BEGIN"
                                }
<comment>"-->"                  {
                                  this.begin('INITIAL');
                                  return "COMMENT_END"
                                }
<comment>\s+                    {
                                  return "COMMENT_CONTENT"
                                }
<comment>.+                     {
                                  return "COMMENT_CONTENT"
                                }


<INITIAL,tag>"{{"              {
                                  this.begin('var');
                                  return "OPEN_VAR"
                                }
<var>"}}"                       {
                                  this.begin('INITIAL');
                                  return "CLOSE_VAR"
                                }
<var,tag>\w+                   return "WORD"

<<EOF>>                         return "EOF"
.                               return "CONTENT"

%%
