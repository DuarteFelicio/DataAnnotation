CREATE TABLE [dbo].[Geonames]
(
	[geonameid]		INT				IDENTITY (1, 1) NOT NULL,
	[name]			VARCHAR(200)	NULL,
	[asciiname]				VARCHAR(200)	NULL,
	[alternatenames]	VARCHAR(8000)	NULL,
	[latitude]	decimal	null,
	[longitude]	decimal	null,
	[featureclass]	varchar(1)	null,
	[featurecode]	varchar(10)	null,
	[countrycode]	varchar(2)	null,
	[cc2]	varchar(200)	null,
	[admin1code]	varchar(20) null,
	[admin2code]	varchar(80) null,
	[admin3code]	varchar(20) null,
	[admin4code]	varchar(20) null,
	[population]	int null,
	[elevation]	int	null,
	[dem]	varchar(4000)	null,
	[timezone]	varchar(40) null,
	[modificationdate]	Date	null
);


