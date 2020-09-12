CREATE TABLE [dbo].[CsvFiles]
(
	[CsvFilesId]		INT				IDENTITY (1, 1) NOT NULL,
	[FileName]			VARCHAR(500)	NOT NULL,
	[RowsCount]			INT				NOT NULL,
	[ColumnsCount]		INT				NOT NULL,
    CONSTRAINT [PK_CsvFiles] PRIMARY KEY CLUSTERED ([CsvFilesId] ASC)
);