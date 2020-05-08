from bot import Niko
import pickle

#pickle test
pickle_test = { "lion": "yellow", "kitty": "red" }
print(pickle_test)
pickle.dump(pickle_test, open("save.p", "wb"))

pickle_out = pickle.load(open("save.p", "rb"))
print(pickle_out)

discord_niko_token = 'NjQwOTk1ODg5ODU0MjgzNzc4.XcB8sQ.nY1GQbKQtGiM7BbHbunZ73dALY8'
client = Niko()
client.run(discord_niko_token)