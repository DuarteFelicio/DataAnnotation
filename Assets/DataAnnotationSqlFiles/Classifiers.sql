CREATE TABLE [dbo].[Classifiers]
(
	[ClassifiersId]		INT				IDENTITY (1, 1) NOT NULL,
	[ParentId]			INT				NULL,
	[Name]				VARCHAR(100)	NOT NULL,
    CONSTRAINT [PK_Classifiers] PRIMARY KEY CLUSTERED ([ClassifiersId] ASC),
	CONSTRAINT [FK_Classifiers_Classifiers] FOREIGN KEY ([ParentId]) REFERENCES [dbo].[Classifiers] ([ClassifiersId])
);

GO
CREATE NONCLUSTERED INDEX [IX_Classifiers_1]
    ON [dbo].[Classifiers]([ParentId] ASC);

