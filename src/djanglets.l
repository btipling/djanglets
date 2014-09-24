%x tag var attribval block
%s comment escape

%%
<tag>\s+                        return "TAG_SPACE"
<INITIAL,block>\s+             return "SPACE"
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


<INITIAL,tag>"{{"\s*            {
                                  this.begin('var');
                                  return "OPEN_VAR"
                                }
<var>\s*"}}"                    {
                                  this.begin('INITIAL');
                                  return "CLOSE_VAR"
                                }
<INITIAL,tag>"{%"\s*            {
                                  this.begin('block');
                                  return "OPEN_BLOCK"
                                }
<block>"%}"                     {
                                  this.begin('INITIAL');
                                  return "CLOSE_BLOCK"
                                }
<var,tag,block>\w+             return "WORD"
<INITIAL>"\{"                   {
                                  this.begin("escape");
                                }
<escape>.                       {
                                  this.begin("INITIAL");
                                }
<<EOF>>                         return "EOF"
<INITIAL>([^"<"\s])+           return "CONTENT"

%%
