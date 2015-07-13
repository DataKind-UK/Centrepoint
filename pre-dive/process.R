require(dplyr)

lookup <- read.csv("CTRY14_RGN14_CTY14_LAD14_WD14_UK_LU.csv", stringsAsFactors = F)

chisoc <- read.csv("children_society_16_17_no.csv", stringsAsFactors = F)
names(chisoc)[1] <- "type"
names(chisoc)[2] <- "name"

# Drop the columns without a header and the ones starting by 'Total', as the information is 
# redundant
chisoc <- chisoc[, !grepl("^Total", names(chisoc)) & !grepl("^X.", names(chisoc))]

# Fix errors in the original data
# - mistypes in the names of the regions
chisoc$name <- ifelse(chisoc$name == "North West Leicerstershire", "North West Leicestershire", chisoc$name)
chisoc$name <- ifelse(chisoc$name == "Vale of the White Horse", "Vale of White Horse", chisoc$name)
chisoc$name <- ifelse(chisoc$name == "Epsom and Erwell", "Epsom and Ewell", chisoc$name)
# - West Sussex listed as a district rather than a county
chisoc$type <- ifelse(chisoc$name == "West Sussex CC", "County", chisoc$type)

# split the table in districts and counties
local_authorities <- chisoc[chisoc$type %in% c("Unitary", "District"), ]
counties <- chisoc[chisoc$type == "County", ]
rm(chisoc)

counties <- counties[, 2:ncol(counties)]
names(counties)[1] <- 'county_name'

local_authorities <- local_authorities[, 2:ncol(local_authorities)]

# associates the code to the districts
temp <- lookup[, c("LAD14CD", "LAD14NM")]
temp <- temp[!duplicated(temp), ]
local_authorities <- left_join(local_authorities, temp, by = c("name" = "LAD14NM"))
