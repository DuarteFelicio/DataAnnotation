CREATE TABLE [dbo].[RowTrees]
(
	[RowTreesId]		INT				IDENTITY (1, 1) NOT NULL,
	[CsvColumnsId]		INT				NOT NULL,
    CONSTRAINT [PK_RowTrees] PRIMARY KEY CLUSTERED ([RowTreesId] ASC),
	CONSTRAINT [FK_RowTrees_CsvColumns] FOREIGN KEY ([CsvColumnsId]) REFERENCES [dbo].[CsvColumns] ([CsvColumnsId])
);

GO
CREATE NONCLUSTERED INDEX [IX_RowTrees_1]
    ON [dbo].[RowTrees]([CsvColumnsId] ASC);
