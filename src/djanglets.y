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
  : attribute
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
  | variable
  ;

attribute_string
  : ATTRIB_CONTENT
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
  | non_variable_attr_content WORD
  | non_variable_attr_content contents
  ;

words
  : WORD
  | words WORD
  ;

html_entity
  : HTML_ENTITY -> yy.visitor.visitHTMLEntity(yy.ast, $1);
  ;

variable
  : OPEN_VAR djtag_variable CLOSE_VAR -> yy.visitor.visitVariable(yy.ast, $2);
  ;

djtag
  : open_djtag djtag_content close_djtag
  ;

open_djtag
  : OPEN_DJTAG -> console.log("OPEN_DJTAG");
  ;

close_djtag
  : CLOSE_DJTAG -> console.log("CLOSE_DJTAG");
  ;

djtag_content
  : WORD -> console.log("WORD", $1);
  | ELSE -> console.log("ELSE");
  | BLOCK -> console.log("BLOCK");
  | ENDIF -> console.log("ENDIF");
  | ENDFOR -> console.log("ENDFOR");
  | INCLUDE string -> console.log("INCLUDE", $2);
  | EXTENDS string -> console.log("EXTENDS", $2);
  | WORD djtag_variable -> console.log("word var", $2);
  | FOR iterator_expression -> console.log("FOR");
  | IF boolean_expressions -> console.log("IF", $2);
  | ELIF boolean_expressions -> console.log("ELIF", $2);
  ;

string
  : BEG_DJTAG_QUOTE STRING_CONTENT END_DJTAG_QUOTE -> console.log("string", $2);
  ;

djtag_variable
  : WORD
  | WORD filters
  ;

filters
  : filter
  | filters filter
  ;

filter
  : PIPE WORD
  | PIPE WORD COLON string
  ;

iterator_expression
  : djtag_variable IN djtag_variable -> console.log("single var for", $1, $3);
  | djtag_variable COMMA djtag_variable IN djtag_variable {
      console.log("double var for", $1, $3, $5);
  }
  ;

boolean_expressions
  : boolean_expression
  | boolean_expressions boolean_operator boolean_expression
  | boolean_expressions NOT boolean_operator boolean_expression
  ;

boolean_expression
  : NOT boolean_token
  | boolean_token
  | boolean_token comparison_operator boolean_token
  ;

comparison_operator
  : EQUALS
  | NOT_EQUALS
  | GREATER_THAN
  | LESS_THAN
  | GREATER_THAN_EQUALS
  | LESS_THAN_EQUALS
  | IN
  ;

boolean_token
  : djtag_variable
  | TRUE
  | FALSE
  | NUMBER
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
