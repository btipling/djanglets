%x tag var attribval djtag singlequote doublequote
%s comment escape

%{
  if (!global.state) {
    console.log("running");
    global.state = ['INITIAL'];
  }
  function setState(state, self) {
    var previousState;
    previousState = global.state[global.state.length - 1];
    global.state.push(state);
    self.begin(state);
  }
  function prevState(self) {
    var previousState;
    global.state.pop();
    previousState = global.state[global.state.length - 1];
    self.begin(previousState);
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
                                  prevState(this);
                                  return "CLOSE_TAG"
                                }
<tag>"/>"                       {
                                  prevState(this);
                                  return "SELF_TAG_CLOSER" 
                                }
<tag>["\"'"]                    {
                                  setState('attribval', this)
                                  return "BEG_QUOTE"
                                }
<tag>\s+                        /* ignore */
<attribval>["\"'"]              {
                                  prevState(this);
                                  return "END_QUOTE"
                                }
<attribval>"{%"\s*              {
                                  setState('djtag', this);
                                  return "OPEN_DJTAG";
                                }
<attribval>"{{"\*               {
                                  setState('var', this);
                                  return "OPEN_VAR";
                                }
<attribval>[^"\"'"]+            return "ATTRIB_CONTENT"
<tag>"="                        return "EQUAL"

<INITIAL>"<!--"                 {
                                  setState('comment', this)
                                  return "COMMENT_BEG"
                                }
<comment>"-->"                  {
                                  prevState(this);
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
                                  prevState(this);
                                  return "CLOSE_VAR";
                                }
<INITIAL,tag>"{%"\s*            {
                                  setState('djtag', this);
                                  return "OPEN_DJTAG";
                                }
<djtag>"%}"                     {
                                  prevState(this);
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
<djtag,var>":"                      return "COLON";
<djtag,var>"|"                 return "PIPE";
<djtag,var>\-?[0-9]+(?:\.[0-9]+)?   return "NUMBER";
<djtag,var>\s+                      /* ignore */
<djtag,var>"\""                     {
                                  console.log("got double quote at beg");
                                  setState('doublequote', this);
                                  console.log("done setting quotes and stuff beg");
                                  return "BEG_DJTAG_QUOTE";
                                }
<doublequote>([^"\""])+         return "STRING_CONTENT";
<doublequote>"\""               {
                                  console.log("got double quote at end");
                                  prevState(this);
                                  console.log("done setting quotes and stuff end");
                                  return "END_DJTAG_QUOTE";
                                }
<djtag,var>"'"                      {
                                  setState('singlequote', this);
                                  return "BEG_DJTAG_QUOTE";
                                }
<singlequote>([^"'"])+          return "STRING_CONTENT";
<singlequote>"'"                {
                                  prevState(this);
                                  return "END_DJTAG_QUOTE";
                                }
<INITIAL>"&#x"\d{4}";"          return "HTML_ENTITY";
<INITIAL>"&"\w+";"              return "HTML_ENTITY";
<tag,djtag>\w+                  return "WORD";
<var>[\w"."]+                   return "WORD";
<INITIAL>"\{"                   {
                                  setState('escape', this);
                                }
<escape>.                       {
                                  prevState(this);
                                }
<<EOF>>                         return "EOF"
<INITIAL>([^"<"\s])+            return "CONTENT"

%%
