%%

root
  : document {
      $$ = $1
    }
  ;

document
  : /* nothing */
  | complete_elements EOF -> $$ = $1
  ;

complete_elements
  : complete_element
  | SPACE
  | complete_elements complete_element
  | complete_elements SPACE
  ;

complete_element
  : open_tag close_tag -> $$ = $1 + S2
  | open_tag element_content close_tag -> $$ = $1 + $2 + $3
  | self_closing_tag -> $$ = $1
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
  | comment
  | element_content complete_element -> $$ = $1 + $2
  | element_content contents -> $$ = $1 + $2
  | element_content variable -> $$ = $1 + $2
  | element_content comment -> $$ = $1 + $2
  ;

attributes
  : attribute
  | TAG_SPACE
  | attributes attribute -> $$ = $1 + $2
  | attributes TAG_SPACE -> $$ = $1 + $2
  ;

attribute
  : WORD EQUAL quote attribute_content quote {
      yy.visitor.visitAttribute(yy.ast, $1, $4);
    }
  ;

quote
  : BEG_QUOTE -> $$ = '"'
  | END_QUOTE -> $$ = '"'
  ;

attribute_content
  : /* nothing */
  | ATTRIB_CONTENT
  ;

non_variable_attr_content
  : WORD
  | contents
  | TAG_SPACE
  | non_variable_attr_content WORD -> $$ = $1 + $2
  | non_variable_attr_content contents -> $$ = $1 + $2
  | non_variable_attr_content TAG_SPACE -> $$ = $1 + $2
  ;

words
  : WORD
  | words TAG_SPACE -> $$ = $1 + $2
  | words WORD -> $$ = $1 + $2
  ;

variable
  : OPEN_VAR WORD CLOSE_VAR -> yy.visitor.visitVariable(yy.ast, $2);
  ;

comment
  : COMMENT_BEGIN comment_content COMMENT_END -> $$ = $1 + $2 + $3
  ;

comment_content
  : COMMENT_CONTENT
  | comment_content COMMENT_CONTENT -> $$ = $1 + $2
  ;

contents
  : CONTENT -> yy.visitor.visitText(yy.ast, $1);
  | SPACE -> yy.visitor.visitText(yy.ast, " ");
  ;

%%
