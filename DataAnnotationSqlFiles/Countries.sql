CREATE TABLE [dbo].[Countries]
(
	[CountriesId]		INT				IDENTITY (1, 1) NOT NULL,
	[Name]				VARCHAR(500)	NOT NULL,
	[OriginalName]		VARCHAR(500)	NOT NULL,
    [IsoCodeA2]			VARCHAR(2)		NOT NULL,
    [IsoCodeA3]			VARCHAR(3)		NOT NULL,
	[Number]			INT				NOT NULL,
    CONSTRAINT [PK_CountriesId] PRIMARY KEY CLUSTERED ([CountriesId] ASC)
);

GO
CREATE NONCLUSTERED INDEX [IX_Countries_1]
    ON [dbo].[Countries]([OriginalName] ASC);
