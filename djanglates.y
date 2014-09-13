
%%

root
  : document { return "'" + $1 + "'" }
  ;

document
  : /* nothing */
  | complete_element EOF -> $$ = $1
  | complete_element SPACE EOF -> $$ = $1
  ;


complete_element
  : open_tag close_tag -> $$ = $1 + S2
  | open_tag element_content close_tag -> $$ = $1 + $2 + $3
  | self_closing_tag -> $$ = $1
  ;

open_tag
  : OPEN_TAG WORD CLOSE_TAG -> $$ = $1 + $2 + $3
  | OPEN_TAG WORD attributes CLOSE_TAG -> $$ = $1 + $2 + $3 + $4
  ;

close_tag
  : TAG_CLOSER WORD CLOSE_TAG -> $$ = $1 + $2 + $3
  ;

self_closing_tag
  : OPEN_TAG WORD SELF_TAG_CLOSER -> $$ = $1 + $2 + $3
  | OPEN_TAG WORD attributes SELF_TAG_CLOSER  {
                                          $$ = $1 + $2 + $3 + $4
                                          console.log("self_closing_tag", $$);
                                        }
  ;

element_content
  : complete_element
  | CONTENT
  | WORD
  | SPACE
  | variable
  | comment
  | element_content complete_element -> $$ = $1 + $2
  | element_content CONTENT -> $$ = $1 + $2
  | element_content WORD -> $$ = $1 + $2
  | element_content SPACE -> $$ = $1 + $2
  | element_content variable -> $$ = $1 + $2
  | element_content comment -> $$ = $1 + $2
  ;

attributes
  : attribute
  | SPACE
  | attributes attribute -> $$ = $1 + $2
  | attributes SPACE -> $$ = $1 + $2
  ;

attribute
  : WORD EQUAL quote attribute_content quote {
                                                      $$ = $1 + $2 + $3 + $4 + $5
                                                      console.log("attribute", $$);
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
  | CONTENT
  | SPACE
  | non_variable_attr_content WORD -> $$ = $1 + $2
  | non_variable_attr_content CONTENT -> $$ = $1 + $2
  | non_variable_attr_content SPACE -> $$ = $1 + $2
  ;

words
  : WORD
  | words SPACE -> $$ = $1 + $2
  | words WORD -> $$ = $1 + $2
  ;

variable
  : OPEN_VAR WORD CLOSE_VAR -> $$ = "'+" + $2 + "+'"
  ;

comment
  : COMMENT_BEGIN comment_content COMMENT_END -> $$ = $1 + $2 + $3
  ;

comment_content
  : COMMENT_CONTENT
  | comment_content COMMENT_CONTENT -> $$ = $1 + $2
  ;
%%
