with open('static/eco-i18n.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line 845 (0-indexed 844) should NOT close the es object.
lines[844] = '\n'

with open('static/eco-i18n.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Fixed: removed premature closing brace from es object')
