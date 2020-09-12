CREATE TABLE [dbo].[CsvValues]
(
	[CsvValuesId]		INT				IDENTITY (1, 1) NOT NULL,
	[CsvColumnsId]		INT				NOT NULL,
	[OriginalValue]		VARCHAR(1000)	NOT NULL,
    [IsNull]			BIT				NOT NULL,
    [IsText]			BIT				NOT NULL,
	[IsNumeric]			BIT				NOT NULL,
	[NumericValue]		decimal			NULL,
	[IntegerOrDecimal]	VARCHAR(50)		NULL, -- i or d or null
    CONSTRAINT [PK_CsvValues] PRIMARY KEY CLUSTERED ([CsvValuesId] ASC),
	CONSTRAINT [FK_CsvValues_CsvColumns] FOREIGN KEY ([CsvColumnsId]) REFERENCES [dbo].[CsvColumns] ([CsvColumnsId])
);

GO
CREATE NONCLUSTERED INDEX [IX_CsvValues_1]
    ON [dbo].[CsvValues]([CsvColumnsId] ASC);
