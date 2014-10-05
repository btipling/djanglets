%%

root
  : document {
      $$ = $1
    }
  ;

document
  : /* nothing */
  | complete_elements EOF
  ;

complete_elements
  : complete_element
  | SPACE
  | complete_elements complete_element
  | complete_elements SPACE
  ;

complete_element
  : open_tag close_tag
  | open_tag element_content close_tag
  | self_closing_tag
  ;

open_tag
  : OPEN_TAG WORD CLOSE_TAG -> yy.visitor.visitOpenElement(yy.ast, $2);
  | OPEN_TAG WORD attributes CLOSE_TAG -> yy.visitor.visitOpenElement(yy.ast, $2);
  ;

close_tag
  : TAG_CLOSER WORD CLOSE_TAG -> yy.visitor.visitCloseElement(yy.ast, $2);
  ;

self_closing_tag
  : OPEN_TAG WORD SELF_TAG_CLOSER {
      yy.visitor.visitSelfClosingElement(yy.ast, $2);
    }
  | OPEN_TAG WORD attributes SELF_TAG_CLOSER  {
      yy.visitor.visitSelfClosingElement(yy.ast, $2);
    }
  ;

element_content
  : complete_element
  | contents
  | variable
  | djtag
  | comment
  | html_entity
  | element_content complete_element
  | element_content contents
  | element_content variable
  | element_content djtag
  | element_content comment
  | element_content html_entity
  ;

attributes
  : attribute
  | TAG_SPACE
  | attributes attribute
  | attributes TAG_SPACE
  ;

attribute
  : WORD EQUAL quote attribute_content quote {
      yy.visitor.visitAttribute(yy.ast, $1, $4);
    }
  ;

quote
  : BEG_QUOTE
  | END_QUOTE
  ;

attribute_content
  : /* nothing */
  | ATTRIB_CONTENT
  ;

non_variable_attr_content
  : WORD
  | contents
  | TAG_SPACE
  | non_variable_attr_content WORD
  | non_variable_attr_content contents
  | non_variable_attr_content TAG_SPACE
  ;

words
  : WORD
  | words TAG_SPACE
  | words WORD
  ;

html_entity
  : HTML_ENTITY -> yy.visitor.visitHTMLEntity(yy.ast, $1);
  ;

variable
  : OPEN_VAR WORD CLOSE_VAR -> yy.visitor.visitVariable(yy.ast, $2);
  ;

djtag
  : OPEN_DJTAG WORD SPACE WORD SPACE CLOSE_DJTAG -> yy.visitor.visitComputeDjtag(yy.ast, $2, $4);
  | OPEN_DJTAG WORD SPACE CLOSE_DJTAG -> yy.visitor.visitSignalDjtag(yy.ast, $2);
  /* {% for value in something %} */
  | OPEN_DJTAG WORD SPACE WORD SPACE WORD SPACE WORD SPACE CLOSE_DJTAG {
      yy.visitor.visitForDjtag(yy.ast, $2, null, $4, $6, $8);
    }
  /* {% for key, value in something %} */
  | OPEN_DJTAG WORD SPACE WORD COMMA SPACE WORD SPACE WORD SPACE WORD SPACE CLOSE_DJTAG {
      yy.visitor.visitForDjtag(yy.ast, $2, $4, $7, $9, $11);
    }
  ;

djtag
  : open_djtag djtag_contents CLOSE_DJTAG
  ;

open_djtag
  : OPEN_DJTAG {
      console.log("Open djtag", trim($s.substr(1).trim()));
    }
  ;

djtag_contents
  : djtag_content
  | djtag_contents djtag_content
  ;

djtag_content
  : SPACE
  | string
  | variable
  | WORD
  | boolean_expressions
  ;

string
  : BEGIN_QUOTE STRING_CONTENT END_QUOTE -> console.log("string", $2);
  ;

variable
  : WORD filters
  ;

filters
  : filter
  | filters filter
  ;

filter
  : PIPE WORD
  | PIPE WORD COLON STRING
  ;

boolean_expressions
  :  boolean_expression
  |  boolean_expressions boolean_operator boolean_expression
  ;

boolean_expression
  : variable
  | boolean_token SPACE EQUALS SPACE boolean_token
  | boolean_token SPACE NOT_EQUALS SPACE boolean_token
  ;

boolean_token
  : variable
  | string
  ;

boolean_operator
  : OR
  | AND
  ;

comment
  : COMMENT_BEGIN comment_content COMMENT_END
  ;

comment_content
  : COMMENT_CONTENT
  | comment_content COMMENT_CONTENT
  ;

contents
  : CONTENT -> yy.visitor.visitText(yy.ast, $1);
  | SPACE -> yy.visitor.visitText(yy.ast, " ");
  ;

%%
