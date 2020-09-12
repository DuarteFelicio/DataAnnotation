CREATE TABLE [dbo].[Nodes]
(
	[NodesId]			INT				IDENTITY (1, 1) NOT NULL,
	[RowTreesId]		INT				NOT NULL,
	[ParentId]			INT				NULL,
	[RowIndex]			INT				NOT NULL,
    [Value]				VARCHAR(MAX)	NOT NULL,
    CONSTRAINT [PK_Nodes] PRIMARY KEY CLUSTERED ([NodesId] ASC),
	CONSTRAINT [FK_Nodes_RowTrees] FOREIGN KEY ([RowTreesId]) REFERENCES [dbo].[RowTrees] ([RowTreesId]),
	CONSTRAINT [FK_Nodes_Parent] FOREIGN KEY ([ParentId]) REFERENCES [dbo].[Nodes] ([NodesId]),
);

GO
CREATE NONCLUSTERED INDEX [IX_Nodes_1]
    ON [dbo].[Nodes]([RowTreesId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Nodes_2]
    ON [dbo].[Nodes]([ParentId] ASC);
