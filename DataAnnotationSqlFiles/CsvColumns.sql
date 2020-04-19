CREATE TABLE [dbo].[CsvColumns]
(
	[CsvColumnsId]		INT				IDENTITY (1, 1) NOT NULL,
	[CsvFilesId]		INT				NOT NULL,
	[ColumnName]		VARCHAR(500)	NOT NULL,
    [ColumnIndex]		INT				NOT NULL,
    [NullsCount]		INT				NOT NULL,
	[AllDifferent]		BIT				NOT NULL,
	[MetricOrDimension]	VARCHAR(50)		NOT NULL, -- metric or dimension or unkown,
	[ValuesJson]		VARCHAR(MAX)	NULL,
    CONSTRAINT [PK_CsvColumns] PRIMARY KEY CLUSTERED ([CsvColumnsId] ASC),
	CONSTRAINT [FK_CsvColumns_CsvFiles] FOREIGN KEY ([CsvFilesId]) REFERENCES [dbo].[CsvFiles] ([CsvFilesId])
);

GO
CREATE NONCLUSTERED INDEX [IX_CsvColumns_1]
    ON [dbo].[CsvColumns]([CsvFilesId] ASC);
