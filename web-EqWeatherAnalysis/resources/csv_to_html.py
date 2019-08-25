import pandas as pd

df_cities = pd.read_csv("./cities.csv")

with open("./cities.html","w") as fileHTML:
    fileHTML.write(df_cities.to_html(index=False))


