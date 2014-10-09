%x tag var attribval djtag singlequote doublequote
%s comment escape

%{
  var prevState = 'INITIAL',
    currentState = 'INITIAL';
  function setState(state, self) {
    prevState = currentState;
    currentState = state;
    self.begin(state);
  }
%}

%%
<INITIAL>\s+                    return "SPACE"
<INITIAL>"<"/\w+                {
                                  setState('tag', this);
                                  return "OPEN_TAG"
                                }
<INITIAL>"</"/\w+               {
                                  setState('tag', this);
                                  return "TAG_CLOSER"
                                }
<tag>">"                        {
                                  setState('INITIAL', this);
                                  return "CLOSE_TAG"
                                }
<tag>"/>"                       {
                                  setState('INITIAL', this);
                                  return "SELF_TAG_CLOSER" 
                                }
<tag>["\"'"]                    {
                                  setState('attribval', this)
                                  return "BEG_QUOTE"
                                }
<tag>\s+                        /* ignore */
<attribval>["\"'"]              {
                                  setState('tag', this)
                                  return "END_QUOTE"
                                }
<attribval>"{%"\s*              {
                                  setState('djtag', this);
                                  return "OPEN_DJTAG";
                                }
<attribval>[^"\"'"]+            return "ATTRIB_CONTENT"
<tag>"="                        return "EQUAL"

<INITIAL>"<!--"                 {
                                  setState('comment', this)
                                  return "COMMENT_BEG"
                                }
<comment>"-->"                  {
                                  setState('INITIAL', this);
                                  return "COMMENT_END"
                                }
<comment>\s                     {
                                  return "COMMENT_CONTENT"
                                }
<comment>.                      {
                                  return "COMMENT_CONTENT"
                                }
<INITIAL,tag>"{{"\s*            {
                                  setState('var', this);
                                  return "OPEN_VAR";
                                }
<var>\s*"}}"                    {
                                  setState('INITIAL', this);
                                  return "CLOSE_VAR";
                                }
<INITIAL,tag>"{%"\s*            {
                                  setState('djtag', this);
                                  return "OPEN_DJTAG";
                                }
<djtag>"%}"                     {
                                  setState(prevState, this);
                                  return "CLOSE_DJTAG";
                                }
<djtag>\s*","                   return "COMMA";
<djtag>"for"                    return "FOR";
<djtag>"endfor"                 return "ENDFOR";
<djtag>"if"                     return "IF";
<djtag>"elif"                   return "ELIF";
<djtag>"else"                   return "ELSE";
<djtag>"endif"                  return "ENDIF";
<djtag>"extends"                return "EXTENDS";
<djtag>"include"                return "IF";
<djtag>"or"                     return "OR";
<djtag>"and"                    return "AND";
<djtag>"in"                     return "IN";
<djtag>"not"                    return "NOT";
<djtag>"=="                     return "EQUALS";
<djtag>"!="                     return "NOT_EQUALS";
<djtag>">"                      return "GREATER_THAN";
<djtag>"<"                      return "LESS_THAN";
<djtag>">="                     return "GREATER_THAN_EQUALS";
<djtag>"<="                     return "LESS_THAN_EQUALS";
<djtag>"True"                   return "TRUE";
<djtag>"False"                  return "FALSE";
<djtag>":"                      return "COLON";
<djtag>"|"                      return "PIPE";
<djtag>\-?[0-9]+(?:\.[0-9]+)?   return "NUMBER";
<djtag>\s+                      /* ignore */
<djtag>"\""                     {
                                  setState('doublequote', this);
                                  return "BEG_DJTAG_QUOTE";
                                }
<doublequote>"\""               {
                                  setState('djtag', this);
                                  return "END_DJTAG_QUOTE";
                                }
<djtag>"'"                      {
                                  setState('singlequote', this);
                                  return "BEG_DJTAG_QUOTE";
                                }
<singlequote>"'"                {
                                  setState('djtag', this);
                                  return "END_DJTAG_QUOTE";
                                }
<singlequote,doublequote>.      return "STRING_CONTENT";
<INITIAL>"&#x"\d{4}";"          return "HTML_ENTITY";
<INITIAL>"&"\w+";"              return "HTML_ENTITY";
<tag,djtag>\w+                  return "WORD";
<var>[\w"."]+                   return "WORD";
<INITIAL>"\{"                   {
                                  setState('escape', this);
                                }
<escape>.                       {
                                  setState('INITIAL', this);
                                }
<<EOF>>                         return "EOF"
<INITIAL>([^"<"\s])+            return "CONTENT"

%%
