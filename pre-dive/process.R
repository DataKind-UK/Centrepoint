require(dplyr)

lookup <- read.csv("CTRY14_RGN14_CTY14_LAD14_WD14_UK_LU.csv", stringsAsFactors = F)

chisoc <- read.csv("Giacecco's Children Society.csv", stringsAsFactors = F)

# Drop the columns starting by 'Total' as the information is redundant
chisoc <- chisoc[, !grepl("^Total", names(chisoc))]

# Fix errors in the original data
# - mistypes in the names of the regions
chisoc$X.1 <- ifelse(chisoc$X.1 == "North West Leicerstershire", "North West Leicestershire", chisoc$X.1)
chisoc$X.1 <- ifelse(chisoc$X.1 == "Vale of the White Horse", "Vale of White Horse", chisoc$X.1)
chisoc$X.1 <- ifelse(chisoc$X.1 == "Epsom and Erwell", "Epsom and Ewell", chisoc$X.1)
# - West Sussex listed as a district rather than a county
chisoc$X <- ifelse(chisoc$X.1 == "West Sussex CC", "County", chisoc$X)

# split the table in districts and counties
local_authorities <- chisoc[chisoc$X == "District", ]
counties <- chisoc[chisoc$X == "County", ]
rm(chisoc)

counties <- counties[, 2:ncol(counties)]
names(counties)[1] <- 'county_name'

local_authorities <- local_authorities[, 2:ncol(local_authorities)]
names(local_authorities)[1] <- 'la_name'

local_authorities <- left_join(local_authorities, lookup[, c("LAD14CD", "LAD14NM")], by = c("la_name" = "LAD14NM"))