import re

pattern = re.compile(r"[a-z]{5}")

valid_guesses = []

with open("prim-11.0-public-all-S-lemma-frequency (1)", "r", encoding="utf-8") as file:
    content = file.readlines()
    for row in content:
        noun = row.split()[1]
        if pattern.fullmatch(noun):
            if noun not in valid_guesses:
                valid_guesses.append(noun)

solutions = valid_guesses[:2500]
print(solutions[:100])