using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataAnnotation.Data.Migrations
{
	public partial class CreateCsvFilesSchema : Migration
	{
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.CreateTable(
				name: "CsvFile",
				columns: table => new
				{
					CsvFilesId = table.Column<int>(nullable: false)
					.Annotation("SqlServer:Identity", "1, 1"),
					UserId = table.Column<string>(maxLength: 450, nullable: false),
					RowsCount = table.Column<int>(nullable: true),
					ColumnsCount = table.Column<int>(nullable: true),
					UploadTime = table.Column<DateTime>(nullable: false),
					Size = table.Column<long>(nullable: false),
					Origin = table.Column<string>(maxLength: 500, nullable : false),
					FileNameStorage = table.Column<string>(maxLength: 500, nullable: false),
					FileNameDisplay = table.Column<string>(maxLength: 500, nullable: false),
					AnalysisDuration = table.Column<TimeSpan>(nullable: true),
					AnalysisCompletionTime = table.Column<DateTime>(nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_CsvFile", x => x.CsvFilesId);
					table.ForeignKey(
						name: "FK_CsvFile_AspNetUsers_Id",
						column: x => x.UserId,
						principalTable: "AspNetUsers",
						principalColumn: "Id",
						onDelete: ReferentialAction.Cascade);
				});
		}

		protected override void Down(MigrationBuilder migrationBuilder)
		{

			migrationBuilder.DropTable(
				name: "CsvFiles");

		}
	}
}
