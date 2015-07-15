require(dplyr)
require(gdata)

lookup <- read.csv("reference-data/CTRY14_RGN14_CTY14_LAD14_WD14_UK_LU.csv", stringsAsFactors = F)
lookup_2011 <- read.csv("reference-data/WD11_CMWD11_LAD11_EW_LU.csv", stringsAsFactors = F)
reference_geography <- read.csv("../uk_centrepoint_1507080040.csv", stringsAsFactors = F)

# Read the original data. This was taken from an email from Jesse to the ambassadors team on 
# 17 June 2015, labelled as "Children’s Society data for 2011, 16-17 year olds". 
england <- read.xls("source-data/Centrepoint/England districts for datakind.xlsx", sheet = 1, stringsAsFactors = F, na.strings = c("", "\\"))
