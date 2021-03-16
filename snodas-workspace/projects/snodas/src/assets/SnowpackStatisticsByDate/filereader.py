import glob
array = glob.glob("*.csv")
array.sort(reverse=True)
with open("ListOfDates.txt", 'w') as output_file:
	for filename in array:
		filename = filename.replace("SnowpackStatisticsByDate_", "")
		filename = filename.replace(".csv","")
		output_file.write(filename + "\n")