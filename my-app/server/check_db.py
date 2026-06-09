import sqlite3, pandas as pd

con = sqlite3.connect("../data/game.db")
sessions   = pd.read_sql("SELECT * FROM sessions", con)
selections = pd.read_sql("SELECT * FROM selections", con)

# e.g. confusion matrix across all users
pd.crosstab(selections.true_category, selections.user_category)
a=1