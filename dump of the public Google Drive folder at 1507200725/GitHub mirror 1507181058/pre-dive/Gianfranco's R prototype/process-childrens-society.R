process_childrens_society <- function () {

    require(dplyr)
    require(gdata)
    
    lookup <- read.csv("reference-data/CTRY14_RGN14_CTY14_LAD14_WD14_UK_LU.csv", stringsAsFactors = F)
    lookup_2011 <- read.csv("reference-data/WD11_CMWD11_LAD11_EW_LU.csv", stringsAsFactors = F)
    reference_geography <- read.csv("../uk_centrepoint_1507080040.csv", stringsAsFactors = F)
    
    # Read the original data. This was taken from an email from Jesse to the ambassadors team on 
    # 17 June 2015, labelled as "Children’s Society data for 2011, 16-17 year olds". 
    chisoc <- read.xls("source-data/The Children's Society 16-17.xlsx", sheet = 1, stringsAsFactors = F, na.strings = c("", "\\"))
    names(chisoc)[1] <- "name"
    
    # Drop the rows without an area name, the columns without a header, and the ones whose name starts 
    # by 'Total', as the information is redundant
    chisoc <- chisoc[!is.na(chisoc$name), !grepl("^Total", names(chisoc)) & !grepl("^X.", names(chisoc))]
    columns_with_statistics <- names(chisoc)[!(names(chisoc) %in% c('name'))]
    
    # Force everything to _numeric_ after replacing the '<something' values with the smallest integers 
    # not less than the specified
    for (columnName in columns_with_statistics) { 
        matches <- grepl("^<(\\d+)", chisoc[, columnName])
        chisoc[, columnName] <- as.numeric(sub("^<(\\d+)", "\\1", chisoc[, columnName], fixed = F))
        chisoc[matches, columnName] <- ceiling(chisoc[matches, columnName] / 2)
    }
    
    # Fix errors in the original data
    # - mistypes in the names of the regions
    chisoc$name <- ifelse(chisoc$name == "North West Leicerstershire", "North West Leicestershire", chisoc$name)
    chisoc$name <- ifelse(chisoc$name == "Vale of the White Horse", "Vale of White Horse", chisoc$name)
    chisoc$name <- ifelse(chisoc$name == "Epsom and Erwell", "Epsom and Ewell", chisoc$name)
    # - actual differences of spelling
    chisoc$name <- sub("Bristol", "Bristol, City of", chisoc$name)
    chisoc$name <- sub("Durham", "County Durham", chisoc$name)
    chisoc$name <- sub("Herefordshire", "Herefordshire, County of", chisoc$name)
    chisoc$name <- sub("Hull", "Kingston upon Hull, City of", chisoc$name)
    chisoc$name <- sub("Newcastle Upon Tyne", "Newcastle upon Tyne", chisoc$name)
    chisoc$name <- sub("St Helens", "St. Helens", chisoc$name)
    
    # split the table in districts and counties
    local_authorities <- chisoc[!grepl(" CC$", chisoc$name), ]
    counties <- chisoc[grepl(" CC$", chisoc$name), ]
    rm(chisoc)
    
    ### DISTRICTS

    # drop the postfix defining the type of authority
    for (re in c(
        " +Metropolitan District Council *$",
        " +Metropolitan Borough Council *$",
        " +Metropolitan Council *$",
        " +City Council *$",
        " +Council *$",
        " +County *$",
        " +Borough *$",
        " +LB *$"
    )) { local_authorities$name <- sub(re, "", local_authorities$name) }

    # associates the code to the districts and drop the name
    # note that thanks to the left_join, the counties will be ignored
    temp <- lookup[, c("LAD14CD", "LAD14NM")]
    temp <- temp[!duplicated(temp), ]
    local_authorities <- left_join(local_authorities, temp, by = c("name" = "LAD14NM"))
    local_authorities <- local_authorities[, c("LAD14CD", columns_with_statistics)]
    
    ### COUNTIES
    
    # drop the 'CC' postfix from the county names
    counties$name <- sub(" CC$", "", counties$name)
    
    # associate the code to the counties and 'explode' by local authority
    temp <- lookup[lookup$CTY14CD != "", c("CTY14CD", "CTY14NM", "LAD14CD", "LAD14NM")]
    temp <- temp[!duplicated(temp), ]
    counties <- left_join(counties, temp, by = c("name" = "CTY14NM"))
    
    # associate the Census 2011 code
    # note that thanks to the left_join, the counties will be ignored
    temp <- lookup_2011[, c("LAD11NM", "LAD11CD")]
    temp <- temp[!duplicated(temp), ]
    counties <- left_join(counties, temp, by = c("LAD14NM" = "LAD11NM"))
    
    # integrate with the population from the reference geography
    counties <- left_join(counties, reference_geography[, c("la_code", "population")], by = c("LAD11CD" = "la_code"))
    population_by_county <- counties %>% group_by(CTY14CD) %>% summarise(county_population = sum(population)) 
    
    # calculate what part of the county the local authority is a as a fraction of population
    counties <- left_join(counties, population_by_county, by = c("CTY14CD" = "CTY14CD"))
    counties$perc_of_population <- counties$population / counties$county_population
    counties <- counties[, !names(counties) %in% c("population", "county_population")]
    
    # adapt the statistics to the size of the local authority
    for (columnName in columns_with_statistics) { counties[,columnName] <- ceiling(counties[,columnName] * counties$perc_of_population); }
    
    # prepare to and merge back with local_authorities
    counties <- cbind(LAD14CD = counties$LAD14CD, counties[,columns_with_statistics])
    local_authorities <- rbind(local_authorities, counties)
    
    # and aggregate
    local_authorities <- local_authorities[, c("LAD14CD", columns_with_statistics)] %>% group_by(LAD14CD) %>% summarise_each(funs(sum))
    local_authorities
    
}


