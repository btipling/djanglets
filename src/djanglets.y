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
  | OPEN_TAG WORD tag_contents CLOSE_TAG -> yy.visitor.visitOpenElement(yy.ast, $2);
  ;

close_tag
  : TAG_CLOSER WORD CLOSE_TAG -> yy.visitor.visitCloseElement(yy.ast, $2);
  ;

self_closing_tag
  : OPEN_TAG WORD SELF_TAG_CLOSER {
      yy.visitor.visitSelfClosingElement(yy.ast, $2);
    }
  | OPEN_TAG WORD tag_contents SELF_TAG_CLOSER  {
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

tag_contents
  : tag_content
  | tag_contents tag_content
  ;

tag_content
  : TAG_SPACE
  | attribute
  | djtag
  ;

attribute
  : WORD EQUAL quote attribute_value quote {
      yy.visitor.visitAttribute(yy.ast, $1, $4);
    }
  ;

attribute_value
  : attribute_value_contents
  | attribute_value attribute_value_contents
  ;

attribute_value_contents
  : djtag
  | attribute_string
  ;

attribute_string
  : ATTRIBUTE_STRING
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
  | WORD
  | boolean_expressions
  ;

string
  : BEG_DJTAG_QUOTE STRING_CONTENT END_DJTAG_QUOTE -> console.log("string", $2);
  ;

djtag_variable
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
  : boolean_token SPACE BOOLEAN_EQUALS SPACE boolean_token
  | boolean_token SPACE BOOLEAN_NOT_EQUALS SPACE boolean_token
  ;

boolean_token
  : djtag_variable
  | string
  ;

boolean_operator
  : OR
  | AND
  ;

comment
  : COMMENT_BEG comment_content COMMENT_END
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
