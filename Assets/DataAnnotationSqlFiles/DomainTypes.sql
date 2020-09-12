CREATE TABLE [dbo].[DomainTypes]
(
	[DomainTypesId]		INT				IDENTITY (1, 1) NOT NULL,
	[Name]				VARCHAR(500)	NOT NULL,
	[Code]				VARCHAR(100)	NOT NULL,
    CONSTRAINT [PK_DomainTypes] PRIMARY KEY CLUSTERED ([DomainTypesId] ASC)
);

GO
CREATE NONCLUSTERED INDEX [IX_DomainTypes_1]
    ON [dbo].[DomainTypes]([Name] ASC);
