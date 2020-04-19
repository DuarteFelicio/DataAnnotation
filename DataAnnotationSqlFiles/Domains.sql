CREATE TABLE [dbo].[Domains]
(
	[DomainsId]			INT				IDENTITY (1, 1) NOT NULL,
	[CountriesId]		INT				NOT NULL,
	[DomainTypesId]		INT				NOT NULL,
	[ClassifiersId]		INT				NOT NULL, -- indicates the top classifiers
	[Name]				VARCHAR(100)	NOT NULL,
	[Description]		VARCHAR(4000)	NULL,
    CONSTRAINT [PK_Domains] PRIMARY KEY CLUSTERED ([DomainsId] ASC),
	CONSTRAINT [FK_Domains_Countries] FOREIGN KEY ([CountriesId]) REFERENCES [dbo].[Countries] ([CountriesId]),
	CONSTRAINT [FK_Domains_DomainTypes] FOREIGN KEY ([DomainTypesId]) REFERENCES [dbo].[DomainTypes] ([DomainTypesId]),
	CONSTRAINT [FK_Domains_Classifiers] FOREIGN KEY ([ClassifiersId]) REFERENCES [dbo].[Classifiers] ([ClassifiersId])
);

GO
CREATE NONCLUSTERED INDEX [IX_Domains_1]
    ON [dbo].[Domains]([CountriesId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Domains_2]
    ON [dbo].[Domains]([DomainTypesId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Domains_3]
    ON [dbo].[Domains]([ClassifiersId] ASC);
