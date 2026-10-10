#!/bin/sh
# Copie le site construit et le relie au faux Supabase local
D=$(dirname "$0"); rm -rf "$D/site"; mkdir -p "$D/site"
H="$D/../../dist/index.html"; [ -f "$H" ] || H="$D/../../../index.html"; cp "$H" "$D/site/"; V="$D/../../vendor"; [ -d "$V" ] || V="$D/../../../vendor"; cp -r "$V" "$D/site/"
sed -i 's#"supabaseUrl":"[^"]*"#"supabaseUrl":"http://127.0.0.1:8899/sb"#; s#"supabaseAnonKey":"[^"]*"#"supabaseAnonKey":"sb_publishable_test"#; s#"voixBase":"[^"]*"#"voixBase":"http://127.0.0.1:8899/hf"#' "$D/site/index.html"
grep -o '"supabaseUrl":"[^"]*"' "$D/site/index.html"
