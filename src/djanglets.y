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
  : begin_open_tag CLOSE_TAG -> yy.visitor.visitEndOpenTag(yy.ast);
  | begin_open_tag tag_contents CLOSE_TAG -> yy.visitor.visitEndOpenTag(yy.ast);
  ;

begin_open_tag
  : OPEN_TAG WORD -> yy.visitor.visitOpenElement(yy.ast, $2);
  ;

close_tag
  : TAG_CLOSER WORD CLOSE_TAG -> yy.visitor.visitCloseElement(yy.ast, $2);
  ;

self_closing_tag
  : begin_open_tag SELF_TAG_CLOSER {
      yy.visitor.visitSelfClosingElement(yy.ast, $2);
    }
  | begin_open_tag tag_contents SELF_TAG_CLOSER  {
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
  : ATTRIB_CONTENT -> yy.visitor.visitAttributeContent(yy.ast, $1);
  ;

quote
  : BEG_QUOTE -> yy.visitor.visitAttribute(yy.ast);
  | END_QUOTE -> yy.visitor.visitEndAttribute(yy.ast);
  ;

html_entity
  : HTML_ENTITY -> yy.visitor.visitHTMLEntity(yy.ast, $1);
  ;

variable
  : OPEN_VAR djtag_variable CLOSE_VAR -> $$ = yy.visitor.visitVariable(yy.ast, $2);
  ;

djtag
  : open_djtag djtag_content close_djtag
  ;

open_djtag
  : OPEN_DJTAG -> yy.visitor.visitDJTag(yy.ast);
  ;

close_djtag
  : CLOSE_DJTAG -> yy.visitor.visitEndDJTag(yy.ast);
  ;

djtag_content
  : WORD -> yy.visitor.visitDJTagWord(yy.ast, $1);
  | ELSE -> yy.visitor.visitDJTagWord(yy.ast, $1);
  | ENDIF -> yy.visitor.visitDJTagWord(yy.ast, $1);
  | ENDFOR -> yy.visitor.visitDJTagWord(yy.ast, $1);
  | INCLUDE string -> yy.visitor.visitInclude(yy.ast, $2);
  | EXTENDS string -> yy.visitor.visitExtends(yy.ast, $2);
  | BLOCK string -> yy.visitor.visitBlock(yy.ast, $1);
  | WORD djtag_variable -> yy.visitor.visitCustomDJTag(yy.ast, $1, $2);
  | FOR iterator_expression ->  yy.visitor.visitDJTagWord(yy.ast, $1);
  | IF boolean_expressions -> yy.visitor.visitDJTagWord(yy.ast, $1);
  | ELIF boolean_expressions ->  yy.visitor.visitDJTagWord(yy.ast, $1);
  ;

string
  : BEG_DJTAG_QUOTE STRING_CONTENT END_DJTAG_QUOTE -> $$ = $2
  ;

djtag_variable
  : WORD -> $$ = yy.visitor.visitDJTagVariable(yy.ast, $1);
  | WORD filters -> $$ = yy.visitor.visitDJTagVariable(yy.ast, $1);
  ;

filters
  : filter
  | filters filter
  ;

filter
  : PIPE WORD -> yy.visitor.visitFilter(yy.ast, $2, null);
  | PIPE WORD COLON string -> yy.visitor.visitFilter(yy.ast, $2, $4);
  ;

iterator_expression
  : djtag_variable IN djtag_variable -> yy.visitor.visitItertator(yy.ast, $1, null, $3);
  | djtag_variable COMMA djtag_variable IN djtag_variable {
    yy.visitor.visitItertator(yy.ast, $1, $3, $5);
  }
  ;

boolean_expressions
  : boolean_expression -> yy.visitor.visitExtendBoolean(yy.ast, null);
  | boolean_expressions boolean_operator boolean_expression {
      yy.visitor.visitExtendBoolean(yy.ast, $2);
  }
  ;

boolean_expression
  : NOT boolean_token -> yy.visitor.visitBooleanExpression(true, $2, null, null);
  | boolean_token -> yy.visitor.visitBooleanExpression(false, $1, null, null);
  | boolean_token comparison_operator boolean_token {
      yy.visitor.visitBooleanExpression(false, $1, $2, $3);
  }
  | boolean_token comparison_operator NOT boolean_token {
      yy.visitor.visitBooleanExpression(true, $1, $2, $3);
  }
  ;

comparison_operator
  : EQUALS
  | NOT_EQUALS
  | GREATER_THAN
  | LESS_THAN
  | GREATER_THAN_EQUALS
  | LESS_THAN_EQUALS
  | IN
  | NOT_IN
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
