using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace DataAnnotation.Data.Migrations
{
	public partial class CreateRecordTables : Migration
	{
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.CreateTable(
				name: "LoginRecord",
				columns: table => new
				{
					LoginRecordId = table.Column<int>(nullable: false)
					.Annotation("SqlServer:Identity", "1, 1"),
					UserId = table.Column<string>(maxLength: 450, nullable: false),
					LoginTime = table.Column<DateTime>(nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_LoginRecordId", x => x.LoginRecordId);
					table.ForeignKey(
						name: "FK_LoginRecord_AspNetUsers_Id",
						column: x => x.UserId,
						principalTable: "AspNetUsers",
						principalColumn: "Id",
						onDelete: ReferentialAction.Cascade);
				});

			migrationBuilder.CreateTable(
				name: "ActionRecord",
				columns: table => new
				{
					ActionRecordId = table.Column<int>(nullable: false)
					.Annotation("SqlServer:Identity", "1, 1"),
					CsvFileId = table.Column<int>(nullable: false),
					Action = table.Column<string>(maxLength: 8, nullable: false),
					Version = table.Column<string>(maxLength: 12, nullable: false),
					ActionTime = table.Column<DateTime>(nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_ActionRecordId", x => x.ActionRecordId);
					table.ForeignKey(
						name: "FK_ActionRecord_CsvFile_Id",
						column: x => x.CsvFileId,
						principalTable: "CsvFile",
						principalColumn: "CsvFileId",
						onDelete: ReferentialAction.Cascade);
				});
		}

		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropTable(
				name: "LoginRecord");
			migrationBuilder.DropTable(
				name: "ActionRecord");
		}
	}
}
