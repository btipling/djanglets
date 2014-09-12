
%%

root
  : foos EOF
    { return $1 }
  ;

foos
  : foo
  | foos foo { $$ = $1 + " " + $2 }
  ;

foo
  : FOO { $$ = $1 }
  ;

%%
