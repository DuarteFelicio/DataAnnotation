using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataAnnotation.Data.Migrations
{
	public partial class CreateCsvFilesSchema : Migration
	{
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.CreateTable(
				name: "CsvFiles",
				columns: table => new
				{
					CsvFilesId = table.Column<int>(nullable: false)
					.Annotation("SqlServer:Identity", "1, 1"),
					RowsCount = table.Column<int>(nullable: true),
					ColumnsCount = table.Column<int>(nullable: true),
					Origin = table.Column<string>(maxLength: 500, nullable : false),
					FileNameStorage = table.Column<string>(maxLength: 500, nullable: false),
					FileNameDisplay = table.Column<string>(maxLength: 500, nullable: false),
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_CsvFiles", x => x.CsvFilesId);
				});


			migrationBuilder.CreateTable(
				name: "CsvColumns",
				columns: table => new
				{
					CsvColumnsId = table.Column<int>(nullable: false)
					.Annotation("SqlServer:Identity", "1, 1"),
					CsvFilesId = table.Column<int>(nullable: false),
					ColumnName = table.Column<string>(maxLength: 500, nullable: false),
					ColumnIndex = table.Column<int>(nullable: false),
					NullsCount = table.Column<int>(nullable: false),
					AllDifferent = table.Column<bool>(nullable: false),
					MetricOrDimension = table.Column<string>(maxLength: 50, nullable: false),
					ValuesJson = table.Column<string>(maxLength: Int32.MaxValue, nullable: true),
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_CsvColumns", x => x.CsvColumnsId);
					table.ForeignKey(
						name: "FK_CsvColumns_CsvFiles_CsvFilesId",
						column: x => x.CsvFilesId,
						principalTable: "CsvFiles",
						principalColumn: "CsvFilesId",
						onDelete: ReferentialAction.Cascade);
				});


			migrationBuilder.CreateTable(
				name: "CsvValues",
				columns: table => new
				{
					CsvValuesId = table.Column<int>(nullable: false)
					.Annotation("SqlServer:Identity", "1, 1"),
					CsvColumnsId = table.Column<int>(nullable: false),
					OriginalValue = table.Column<string>(maxLength: 1000, nullable: false),
					IsNull = table.Column<bool>(nullable: false),
					IsText = table.Column<bool>(nullable: false),
					IsNumeric = table.Column<bool>(nullable: false),
					NumericValue = table.Column<decimal>(nullable: false),
					IntegerOrDecimal = table.Column<string>(maxLength: 50, nullable: true),
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_CsvValues", x => x.CsvValuesId);
					table.ForeignKey(
						name: "FK_CsvValues_CsvColumns_CsvColumnsId",
						column: x => x.CsvColumnsId,
						principalTable: "CsvColumns",
						principalColumn: "CsvColumnsId",
						onDelete: ReferentialAction.Cascade);
				});



			migrationBuilder.CreateTable(
				name: "RowTrees",
				columns: table => new
				{
					RowTreesId = table.Column<int>(nullable: false)
					.Annotation("SqlServer:Identity", "1, 1"),
					CsvColumnsId = table.Column<int>(nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_RowTrees", x => x.RowTreesId);
					table.ForeignKey(
						name: "FK_RowTrees_CsvColumns_CsvColumnsId",
						column: x => x.CsvColumnsId,
						principalTable: "CsvColumns",
						principalColumn: "CsvColumnsId",
						onDelete: ReferentialAction.Cascade);
				});


			migrationBuilder.CreateTable(
				name: "Nodes",
				columns: table => new
				{
					NodesId = table.Column<int>(nullable: false)
					.Annotation("SqlServer:Identity", "1, 1"),
					RowTreesId = table.Column<int>(nullable: false),
					ParentId = table.Column<int>(nullable: true),
					RowIndex = table.Column<int>(nullable: false),
					Value = table.Column<string>(maxLength: Int32.MaxValue, nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_Nodes", x => x.NodesId);
					table.ForeignKey(
						name: "FK_Nodes_RowTrees_RowTreesId",
						column: x => x.RowTreesId,
						principalTable: "RowTrees",
						principalColumn: "RowTreesId",
						onDelete: ReferentialAction.Cascade);
					table.ForeignKey(
						name: "FK_Nodes_Parent",
						column: x => x.ParentId,
						principalTable: "Nodes",
						principalColumn: "NodesId",
						onDelete: ReferentialAction.NoAction);
				});


			migrationBuilder.CreateIndex(
				name: "IX_CsvColumns_1",
				table: "CsvColumns",
				column: "CsvFilesId");


			migrationBuilder.CreateIndex(
				name: "IX_CsvValues_1",
				table: "CsvValues",
				column: "CsvColumnsId");


			migrationBuilder.CreateIndex(
				name: "IX_RowTrees_1",
				table: "RowTrees",
				column: "CsvColumnsId");


			migrationBuilder.CreateIndex(
				name: "IX_Nodes_1",
				table: "Nodes",
				column: "RowTreesId");


			migrationBuilder.CreateIndex(
				name: "IX_Nodes_2",
				table: "Nodes",
				column: "ParentId");
		}

		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropTable(
				name: "Nodes");

			migrationBuilder.DropTable(
				name: "RowTrees");

			migrationBuilder.DropTable(
				name: "CsvValues");

			migrationBuilder.DropTable(
				name: "CsvColumns");

			migrationBuilder.DropTable(
				name: "CsvFiles");

		}
	}
}
