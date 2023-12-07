import os
import pandas as pd
from pymongo import MongoClient

client = MongoClient(os.environ['MONGODB_URL'])
db = client[os.environ['MONGODB_DB_NAME']]
collection = db[os.environ['MONGODB_PUZZLE_COLLECTION_NAME']]

df = pd.read_csv('lichess_db_puzzle.csv')

# Select 1000 random puzzles
df_shuffled = df.sample(frac=1).reset_index(drop=True)
selected_puzzles = df_shuffled.head(1000)
collection.insert_many(selected_puzzles.to_dict(orient='records'))

client.close()
