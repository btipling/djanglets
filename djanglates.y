
%%

root
  : document { return "'" + $1 + "'" }
  ;

document
  : /* nothing */
  | complete_element EOF { $$ = $1 }
  | complete_element SPACE EOF { $$ = $1 }
  ;


complete_element
  : open_tag close_tag { $$ = $1 + S2 }
  | open_tag element_content close_tag { $$ = $1 + $2 + $3 }
  | self_closing_tag { $$ = $1 }
  ;

open_tag
  : OPEN_TAG WORD closing_tag { $$ = $1 + $2 + $3 }
  | OPEN_TAG WORD attributes closing_tag { $$ = $1 + $2 + $3 + $4 }
  ;

close_tag
  : OPEN_TAG TAG_CLOSER WORD closing_tag { $$ = $1 + $2 + $3 + $4}
  ;

self_closing_tag
  : OPEN_TAG WORD tag_closer CLOSE_TAG { $$ = $1 + $2 + $3 + $4 }
  | OPEN_TAG WORD attributes tag_closer CLOSE_TAG { $$ = $1 + $2 + $3 + $4 + $5 }
  ;

tag_closer
  : optional_space TAG_CLOSER { $$ = $1 + $2 }
  ;

closing_tag
  : CLOSE_TAG
  | spaces CLOSE_TAG { $$ = $1 + $2 } 
  ;

element_content
  : complete_element
  | CONTENT
  | WORD
  | SPACE
  | variable
  | element_content complete_element { $$ = $1 + $2 }
  | element_content CONTENT { $$ = $1 + $2 }
  | element_content WORD { $$ = $1 + $2 }
  | element_content SPACE { $$ = $1 + $2 }
  | element_content variable { $$ = $1 + $2 }
  ;

attributes
  : attribute
  | attributes attribute { $$ = $1 + $2 }
  ;

attribute
  : spaces WORD EQUAL quote attribute_content quote { $$ = $1 + $2 + $3 + $4 + $5 + $6}
  ;

quote
  : QUOTE { $$ = '"' }
  ;

attribute_content
  : /* nothing */
  | non_variable_attr_content
  | variable
  ;

non_variable_attr_content
  : WORD
  | CONTENT
  | SPACE
  | non_variable_attr_content WORD { $$ = $1 + $2 }
  | non_variable_attr_content CONTENT { $$ = $1 + $2 }
  | non_variable_attr_content SPACE { $$ = $1 + $2 }
  ;

words
  : WORD
  | words SPACE { $$ = $1 + $2 }
  | words WORD { $$ = $1 + $2 }
  ;

optional_space
  : /* nothing */
  | spaces
  ;

spaces
  : SPACE
  | spaces SPACE { $$ = $1 + $2 }
  ;

variable
  : OPEN_VAR WORD CLOSE_VAR { $$ = "'+" + $2 + "+'" }
  ;
%%
