require(gdata)

# convert the population data to CSV
temp <- read.xls("data/ni/SAPE_SA_01_12.xls", sheet = 1)
temp <- temp[3:nrow(temp), c(1, 15)]
names(temp) <- c("sa2011", "population")
temp$population <- as.integer(gsub(",", "", temp$population))
temp <- temp[!is.na(temp$population), ]
write.table(temp, "data/ni/.temp.SAPE_SA_01_12.csv", col.names = FALSE, row.names = FALSE, sep= ",")

# convert the SA to LA lookup table to CSV
temp <- read.xls("data/ni/11DC_Lookup.xls", sheet = 1)
names(temp) <- c("sa2011", "lgd2014", "lgd2014name")
write.table(temp, "data/ni/.temp.11DC_Lookup.csv", col.names = FALSE, row.names = FALSE, sep= ",")
