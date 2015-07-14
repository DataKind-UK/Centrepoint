require(dplyr)

lookup <- read.csv("CTRY14_RGN14_CTY14_LAD14_WD14_UK_LU.csv", stringsAsFactors = F)
lookup_2011 <- read.csv("WD11_CMWD11_LAD11_EW_LU.csv", stringsAsFactors = F)
reference_geography <- read.csv("../uk_centrepoint_1507080040.csv", stringsAsFactors = F)

chisoc <- read.csv("children_society_16_17_no.csv", stringsAsFactors = F)
names(chisoc)[1] <- "type"
names(chisoc)[2] <- "name"

# Drop the columns without a header and the ones starting by 'Total', as the information is 
# redundant
chisoc <- chisoc[, !grepl("^Total", names(chisoc)) & !grepl("^X.", names(chisoc))]

# Fix errors in the original data
# - empty rows for which a type is defined
chisoc <- chisoc[chisoc$name != "", ]
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

# drop the type columns
counties <- counties[, 2:ncol(counties)]
local_authorities <- local_authorities[, 2:ncol(local_authorities)]

# associates the code to the districts
temp <- lookup[, c("LAD14CD", "LAD14NM")]
temp <- temp[!duplicated(temp), ]
local_authorities <- left_join(local_authorities, temp, by = c("name" = "LAD14NM"))

# drop the 'CC' postfix from the county names
counties$name <- sub(" CC$", "", counties$name)

# associate the code to the counties and 'explode' by local authority
temp <- lookup[lookup$CTY14CD != "", c("CTY14CD", "CTY14NM", "LAD14CD", "LAD14NM")]
temp <- temp[!duplicated(temp), ]
counties <- left_join(counties, temp, by = c("name" = "CTY14NM"))

# associate the Census 2011 code
temp <- lookup_2011[, c("LAD11NM", "LAD11CD")]
temp <- temp[!duplicated(temp), ]
counties <- left_join(counties, temp, by = c("LAD14NM" = "LAD11NM"))


# integrate with the population from the reference geography
counties <- left_join(counties, reference_geography[, c("la_code", "population")], by = c("LAD11CD" = "la_code"))


