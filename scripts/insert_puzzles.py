import os
import pandas as pd
from pymongo import MongoClient

client = MongoClient(os.environ['MONGODB_URL'])
db = client[os.environ['MONGODB_DB_NAME']]
collection = db[os.environ['MONGODB_PUZZLE_COLLECTION_NAME']]

df = pd.read_csv('lichess_db_puzzle.csv')

selected_puzzles = df.head(5)

collection.insert_many(selected_puzzles.to_dict(orient='records'))
