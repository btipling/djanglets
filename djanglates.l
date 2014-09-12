
%%
\s+      /* skip whitespace */
"foo"\d  return "FOO"
<<EOF>>  return 'EOF'
. /* Do nothing for everything else */

%%
